import express from "express"
import { join } from "path"
import { getName } from "../shared/index.js"
import dotenv from "dotenv"
import mongoose from "mongoose"
import busboy from "busboy";
import parseXLSX from "./xlsxHandler.js";

dotenv.config()

const app: express.Express = express()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}`;

await mongoose.connect(uri)

// https://mongoosejs.com/docs/index.html

app.use(express.static(join(import.meta.dirname, "../../static")))

app.use(express.json());

// Handles receiving the .xlsx file from the user
app.post("/courseFile", (req: express.Request, res: express.Response) => {
	const bb = busboy({ headers: req.headers, });
	bb.on('file', async (name, file, info) => {
		const { filename, encoding, mimeType } = info;
		console.log(
			`File [${name}]: filename: %j, encoding: %j, mimeType: %j`,
			filename,
			encoding,
			mimeType
		);
		// if (filename != "View_My_Courses.xlsx" || mimeType != "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
		// 	console.log(`Improper sheeet type given; filename of ${filename} or mimeType ${mimeType} was not accepted`);
		// 	return;
		// }
		const userCourses = await parseXLSX(file);
		console.log(userCourses);

	});

	bb.on('close', () => {
		// console.log('Done parsing form!');
		res.writeHead(303, { Connection: 'close', Location: '/' });
		res.end();
	});
	req.pipe(bb);
})

app.get("/{*a}", (req: express.Request, res: express.Response) => {
	res.sendFile(join(import.meta.dirname, "../client/index.html"))
})

app.listen(process.env.PORT || 3000)

console.log(`Welcome to ${getName()}`)
console.log(`Listening on port ${process.env.PORT || 3000}...`)