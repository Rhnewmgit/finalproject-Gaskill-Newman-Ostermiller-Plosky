import express from "express"
import { join } from "path"
import { getName } from "../shared/index.js"
import dotenv from "dotenv"
import mongoose from "mongoose"
import fetch from "node-fetch"

dotenv.config()

const app: express.Express = express()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}`;

await mongoose.connect(uri)

// https://mongoosejs.com/docs/index.html

app.use(express.static(join(import.meta.dirname, "../../static")))

app.get("/{*a}", (req: express.Request, res: express.Response) => {
    res.sendFile(join(import.meta.dirname, "../client/index.html"))
})

async function fetchCourseData(){
    let url = 'https://courselistings.wpi.edu/assets/prod-data.json'
    const response = await fetch(url)
    console.log(await response.json())
}
// fetchCourseData()

app.listen(process.env.PORT || 3000)

console.log(`Welcome to ${getName()}`)
console.log(`Listening on port ${process.env.PORT || 3000}...`)