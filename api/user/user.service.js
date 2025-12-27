import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'

import { ObjectId } from 'mongodb'

export const userService = {
    add, // Create (Signup)
    addGoogleUser,
    getById, // Read (Profile page)
    update, // Update (Edit profile)
    remove, // Delete (remove user)
    query, // List (of users)
    getByUsername, // Used for Login
    getByGoogleId,
}

async function query(filterBy = {}) {
    const criteria = _buildCriteria(filterBy)
    try {
        const collection = await dbService.getCollection('user')
        var users = await collection.find(criteria).toArray()
        users = users.map(user => {
            delete user.password
            user.createdAt = user._id.getTimestamp()
            // Returning fake fresh data
            // user.createdAt = Date.now() - (1000 * 60 * 60 * 24 * 3) // 3 days ago
            return user
        })
        return users
    } catch (err) {
        logger.error('cannot find users', err)
        throw err
    }
}

async function getById(userId) {
    try {
        var criteria = { _id: ObjectId.createFromHexString(userId) }

        const collection = await dbService.getCollection('user')
        const user = await collection.findOne(criteria)
        delete user.password



        return user
    } catch (err) {
        logger.error(`while finding user by id: ${userId}`, err)
        throw err
    }
}

async function getByUsername(username) {
    try {
        const collection = await dbService.getCollection('user')
        const user = await collection.findOne({ username })
        return user
    } catch (err) {
        logger.error(`while finding user by username: ${username}`, err)
        throw err
    }
}

async function getByGoogleId(googleId) {
    try {
        const collection = await dbService.getCollection('user')
        const user = await collection.findOne({ googleId })
        return user
    } catch (err) {
        logger.error(`while finding user by googleId: ${googleId}`, err)
        throw err
    }
}


async function remove(userId) {
    try {
        const criteria = { _id: ObjectId.createFromHexString(userId) }

        const collection = await dbService.getCollection('user')
        await collection.deleteOne(criteria)
    } catch (err) {
        logger.error(`cannot remove user ${userId}`, err)
        throw err
    }
}


async function update(user) {
    try {

        const collection = await dbService.getCollection('user')
        const userId = new ObjectId(user._id)

        await collection.updateOne(
            { _id: userId },
            {
                $set: {
                    likedSongs: user.likedSongs || [],
                    userStationsIds: user.userStationsIds || [],
                }
            }
        )

        return await collection.findOne({ _id: userId })
    } catch (err) {
        logger.error(`cannot update user ${user._id}`, err)
        throw err
    }
}


async function add(user) {
    try {
        // peek only updatable fields!
        const userToAdd = {
            username: user.username,
            password: user.password,
            fullname: user.fullname,
            likedSongs: [],
            userStationsIds: [],
        }
        const collection = await dbService.getCollection('user')
        await collection.insertOne(userToAdd)
        return userToAdd
    } catch (err) {
        logger.error('cannot add user', err)
        throw err
    }
}

async function addGoogleUser(user) {
    try {
        const userToAdd = {
            username: user.username,
            fullname: user.fullname,
            googleId: user.googleId,
            authProvider: 'google',
            likedSongs: [],
            userStationsIds: [],
        }

        const collection = await dbService.getCollection('user')
        const res = await collection.insertOne(userToAdd)

        return { ...userToAdd, _id: res.insertedId }
    } catch (err) {
        logger.error('cannot add Google user', err)
        throw err
    }
}


function _buildCriteria(filterBy) {
    const criteria = {}
    if (filterBy.txt) {
        const txtCriteria = { $regex: filterBy.txt, $options: 'i' }
        criteria.$or = [
            {
                username: txtCriteria,
            },
            {
                fullname: txtCriteria,
            },
        ]
    }

    return criteria
}