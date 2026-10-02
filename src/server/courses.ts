import express from "express"
import { CourseSection, User } from "./models.js"
import { Types } from "mongoose";

export function courseRoutes (app: express.Express) {
    app.get("/api/courses/:user", async (req, res) => {
        const user = await User.findById(req.params.user);

        if (!user) {
            res.status(404).json({
                error: "User not found"
            });
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
}