import express from "express"
import { CourseSection, User } from "./models.js"
import busboy from "busboy";
import { parseXLSX } from "./xlsxHandler.js";
import { getUserByToken } from "./auth.js";
import * as Types from "../shared/types.js";

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
            res.status(200).json([]);
            return;
        }

        const courseSections = await getCourseSections(user.courses);

        res.status(200).json(courseSections);
    });

    // Handles receiving the .xlsx file from the user
    app.post("/api/courses", (req: express.Request, res: express.Response) => {
        const bb = busboy({ headers: req.headers, });
        let userCourses: Types.CourseDBTuple[];
        bb.on('file', async (name, file, info) => {
            const { filename, encoding, mimeType } = info;
            // console.log(
            //     `File [${name}]: filename: %j, encoding: %j, mimeType: %j`,
            //     filename,
            //     encoding,
            //     mimeType
            // );
            if (!filename.includes("View_My_Courses") || mimeType != "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
                console.log(`Improper sheeet type given; filename of ${filename} or mimeType ${mimeType} was not accepted`);
                res.status(400).json({
                    error: `Improper sheeet type given; filename of ${filename} or mimeType ${mimeType} was not accepted`
                });
                return;
            }
            userCourses = await parseXLSX(file);
            if (!userCourses.length) {
                console.log(`Unable to parse course in provided file: ${filename}`);
                res.status(400).json({
                    error: `Unable to parse course in provided file: ${filename}`
                });
                return;
            }
            const user = await getUserByToken(req.session?.token);
            if (!user) {
                // console.log("Went to no user route on parse")
                // res.status(404).json({
                //     error: "User not found"
                // });
                const courseYear: Number = userCourses[0].academicYear;

                const courseSections = await getCourseSections(userCourses);
                res.json(courseSections);
                return;
            } else {
                // console.log("Went to user route on parse")
                const courseYear: Number = userCourses[0].academicYear;
                const newCourses: Types.CourseDBTuple[] = user.courses.filter(course => course.academicYear != courseYear).concat(userCourses as any[]);
                // console.log(newCourses);
                //await user.updateOne({ courses: newCourses });
                //const updatedUser = await User.findById(user._id)
                user.set('courses', newCourses);
                await user.save()
                const courseSections = await getCourseSections(user.courses);
                res.json(courseSections);
            }
        });

        bb.on('close', () => {
            // console.log('Done parsing form!');
            // res.json(userCourses);
            // res.writeHead(303, { Connection: 'close', Location: '/' });
        });
        req.pipe(bb);
    });
}

export async function getCourseSections(courses: Types.CourseDBTuple[]): Promise<Types.CourseSection[]> {
    return await CourseSection.find({
        $or: courses.map(course => {
            return {
                code: course.code as any,
                section: course.section as any,
                academicYearStart: course.academicYear as any
            }
        })
    })
}