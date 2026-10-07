import express from "express"
import { CourseSection, User } from "./models.js"
import { Types } from "mongoose";
import busboy from "busboy";
import { parseXLSX, type CourseDBTuple } from "./xlsxHandler.js";
import { getUserByToken } from "./auth.js";
import { log } from "node:console";

export function courseRoutes(app: express.Express) {
    app.get("/api/courses/:user", async (req, res) => {
        const user = await User.findById(req.params.user);

        if (!user) {
            res.status(404).json({
                error: "User not found"
            });
            return;
        }

        if (!user.courses.length) {
            res.status(200).json({});
            return;
        }

        const courseSections = await CourseSection.find({
            $or: user.courses.map(course => {
                return {
                    code: course.code,
                    section: course.section,
                    academicYearStart: course.academicYear
                }
            })
        })

        res.status(200).json(courseSections);
    });

    // Handles receiving the .xlsx file from the user
    app.post("/api/courses", (req: express.Request, res: express.Response) => {
        const bb = busboy({ headers: req.headers, });
        let userCourses: CourseDBTuple[];
        bb.on('file', async (name, file, info) => {
            const { filename, encoding, mimeType } = info;
            console.log(
                `File [${name}]: filename: %j, encoding: %j, mimeType: %j`,
                filename,
                encoding,
                mimeType
            );
            if (!filename.includes("View_My_Courses") || mimeType != "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
                console.log(`Improper sheeet type given; filename of ${filename} or mimeType ${mimeType} was not accepted`);
                return;
            }
            userCourses = await parseXLSX(file);
            if (userCourses.length < 1) {
                console.log(`No courses found in provided file ${filename}`);
                return;
            }
            const user = await getUserByToken(req.session?.token);
            if (!user) {
                console.log(`No user token found`);
                return;
            }
            const courseYear: Number = userCourses[0].academicYear;
            const newCourses: { code: String, section: String, academicYear: number }[] = user.courses.filter(course => course.academicYear != courseYear).concat(userCourses as any[]);
            // console.log(newCourses);
            await user.updateOne({ courses: newCourses });
        });

        bb.on('close', () => {
            console.log('Done parsing form!');
            res.json(userCourses);
            // res.writeHead(303, { Connection: 'close', Location: '/' });
        });
        req.pipe(bb);
    });
}