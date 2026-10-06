import express from "express"
import { join } from "path"
import { getName } from "../shared/index.js"
import dotenv from "dotenv"
import mongoose from "mongoose"

import { courseRoutes } from "./courses.js"
import { fetchCourseData } from "./fetchCourseData.js";
import cookieSession from 'cookie-session';
import { authRoutes } from "./auth.js";

dotenv.config()

const app: express.Express = express()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}`;

await mongoose.connect(uri)

// https://mongoosejs.com/docs/index.html

app.use(express.static(join(import.meta.dirname, "../../static")))

app.use(express.json());
app.use(cookieSession({
  name: 'session',
  //made using randomkeygen.com
  keys: ['xt#1dw(&2gf7fgYw', '%*7URk{mAGmUA3Jg']
}))
authRoutes(app);
courseRoutes(app);

app.get("/{*a}", (req: express.Request, res: express.Response) => {
  res.sendFile(join(import.meta.dirname, "../client/index.html"))
})

app.listen(process.env.PORT || 3000)

console.log(`Welcome to ${getName()}`)
console.log(`Listening on port ${process.env.PORT || 3000}...`)