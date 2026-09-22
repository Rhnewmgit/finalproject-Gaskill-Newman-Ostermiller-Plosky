import express from "express"
import { join } from "path"
import { getName } from "../shared/index.js"

const app: express.Express = express()

app.use(express.static(join(import.meta.dirname, "../../static")))

app.get("/{*a}", (req: express.Request, res: express.Response) => {
    res.sendFile(join(import.meta.dirname, "../client/index.html"))
})

app.listen(process.env.PORT || 3000)

console.log(`Welcome to ${getName()}`)
console.log(`Listening on port ${process.env.PORT || 3000}...`)