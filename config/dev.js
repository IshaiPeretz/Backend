import dotenv from 'dotenv'
dotenv.config()
console.log(process.env.MONGO_URL);

export default {
  dbURL: process.env.MONGO_URL,
  dbName: 'station_db'
}
