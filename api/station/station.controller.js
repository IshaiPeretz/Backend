import { logger } from '../../services/logger.service.js'
import { getRandomInt } from '../../services/util.service.js'
import { userService } from '../user/user.service.js'
import { stationService } from './station.service.js'


const genres = ['rock', 'pop', 'country', 'trending', 'mood', 'workout', 'R&B', 'chill', 'jazz', 'metal', 'hip-hop']

export async function getStations(req, res) {
	try {
		const filterBy = {
			name: req.query.txt || '',

		}
		const stations = await stationService.query(filterBy)
		res.json(stations)
	} catch (err) {
		logger.error('Failed to get stations', err)
		res.status(400).send({ err: 'Failed to get stations' })
	}
}

export async function getStationById(req, res) {
	try {
		const stationId = req.params.id
		const station = await stationService.getById(stationId)
		res.json(station)
	} catch (err) {
		logger.error('Failed to get station', err)
		res.status(400).send({ err: 'Failed to get station' })
	}
}

export async function addStation(req, res) {
	const { loggedinUser, body } = req
	console.log('body:', body)


	const station = {
		name: body.name,
		imgUrl: body.imgUrl || '',
		owner: loggedinUser,
		description: '',
		tracks: body.tracks || [],
		genre: genres[getRandomInt(0, genres.length - 1)]
	}
	try {

		const addedStation = await stationService.add(station)

		console.log('userId:', loggedinUser._id)

		const currentUser = await userService.getById(loggedinUser._id)
		currentUser.userStationsIds = [...(currentUser.userStationsIds || []), addedStation._id.toString()]


		await userService.update(currentUser)


		res.json(addedStation)
	} catch (err) {
		logger.error('Failed to add station', err)
		res.status(400).send({ err: 'Failed to add station' })
	}
}

export async function updateStation(req, res) {
	const { body: station } = req
	// const { _id: userId, isAdmin } = loggedinUser
	// if(station.owner._id !== userId) {
	//     res.status(403).send('Not your station...')
	//     return
	// }
	
	try {
		const updatedStation = await stationService.update(station)
		console.log(updatedStation);
		res.json(updatedStation)
	} catch (err) {
		logger.error('Failed to update station', err)
		res.status(400).send({ err: 'Failed to update station' })
	}
}

export async function removeStation(req, res) {
	try {
		const stationId = req.params.id
		const removedId = await stationService.remove(stationId)

		res.send(removedId)
	} catch (err) {
		logger.error('Failed to remove station', err)
		res.status(400).send({ err: 'Failed to remove station' })
	}
}

// export async function addStationMsg(req, res) {
// 	const { loggedinUser } = req

// 	try {
// 		const stationId = req.params.id
// 		const msg = {
// 			txt: req.body.txt,
// 			by: loggedinUser,
// 		}
// 		const savedMsg = await stationService.addStationMsg(stationId, msg)
// 		res.json(savedMsg)
// 	} catch (err) {
// 		logger.error('Failed to add station msg', err)
// 		res.status(400).send({ err: 'Failed to add station msg' })
// 	}
// }

// export async function removeStationMsg(req, res) {
// 	try {
// 		const { id: stationId, msgId } = req.params

// 		const removedId = await stationService.removeStationMsg(stationId, msgId)
// 		res.send(removedId)
// 	} catch (err) {
// 		logger.error('Failed to remove station msg', err)
// 		res.status(400).send({ err: 'Failed to remove station msg' })
// 	}
// }
