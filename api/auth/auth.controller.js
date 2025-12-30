import { authService } from './auth.service.js'
import { logger } from '../../services/logger.service.js'
import { stationService } from '../station/station.service.js'
import { OAuth2Client } from 'google-auth-library'

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)



export async function login(req, res) {
	const { username, password } = req.body
	try {
		const user = await authService.login(username, password)
		const loginToken = authService.getLoginToken(user)



		// let userStations = []
		// if (user.userStations && user.userStations.length > 0) {
		// 	userStations = await stationService.query({ ids: user.userStations })
		// }
		res.cookie('loginToken', loginToken, { sameSite: 'None', secure: true })

		// res.json({ user, userStations })
		res.json(user)
	} catch (err) {
		logger.error('Failed to Login ' + err)
		res.status(401).send({ err: 'Failed to Login' })
	}
}

export async function signup(req, res) {
	try {
		const credentials = req.body

		const account = await authService.signup(credentials)
		logger.debug(`auth.route - new account created: ` + JSON.stringify(account))


		const user = await authService.login(credentials.username, credentials.password)


		// let userStations = []
		// if (user.userStations && user.userStations.length > 0) {
		// 	userStations = await stationService.query({ ids: user.userStations })
		// }

		logger.info('User signup:', user)

		const loginToken = authService.getLoginToken(user)
		res.cookie('loginToken', loginToken, { sameSite: 'None', secure: true })
		// res.json({ user, userStations })
		res.json(user)
	} catch (err) {
		logger.error('Failed to signup ' + err)
		res.status(400).send({ err: 'Failed to signup' })
	}
}

export async function logout(req, res) {
	try {
		res.clearCookie('loginToken')
		res.send({ msg: 'Logged out successfully' })
	} catch (err) {
		res.status(400).send({ err: 'Failed to logout' })
	}
}

export async function googleLogin(req, res) {
	try {
		const { credential } = req.body
		if (!credential) {
			return res.status(400).send({ err: 'Missing Google credential' })
		}

		const ticket = await client.verifyIdToken({
			idToken: credential,
			audience: process.env.GOOGLE_CLIENT_ID,
		})

		const payload = ticket.getPayload()

		const googleId = payload.sub
		const username = payload.email
		const fullname = payload.name

		let user = await authService.getUserByGoogleId(googleId)

		if (!user) {
			user = await authService.signupGoogleUser({
				googleId,
				username,
				fullname,
			})
		} else {
			delete user.password
			user._id = user._id.toString()
		}

		const loginToken = authService.getLoginToken(user)
		res.cookie('loginToken', loginToken, { sameSite: 'None', secure: true })

		res.json(user)
	} catch (err) {
		logger.error('Google login failed', err)
		res.status(401).send({ err: 'Google authentication failed' })
	}
}
