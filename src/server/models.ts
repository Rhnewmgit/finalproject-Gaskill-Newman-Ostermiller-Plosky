import { InferSchemaType, model, Schema, Types } from "mongoose";

const courseSectionSchema = new Schema({
    name: {
        required: true,
        type: String, // ex. "Webware: Computational Technology For Network Information Systems"
    },
    code: {
        required: true,
        type: String, // Should have space between department and number, should not include section ID, ex. "CS 4241"
    },
    type: {
        required: true,
        type: String, // ex. "Lecture"
    },
    section: {
        required: true,
        type: String // ex. "A01"
    },
    term: {
        required: true,
        type: String, // ex. "A"
        enum: ["A", "B", "C", "D", "E1", "E2", "F", "S", "E"] // "F" is for fall, "S" is for spring, "E" is for full summer
    },
    academicYearStart: {
        required: true,
        type: Number // Summer classes are considered part of the previous academic year, ex. 2026
    },
    academicYearEnd: {
        required: true,
        type: Number // ex. 2027
    },
    meetingDays: {
        required: true,
        type: [{
            type: Number,
            min: 0,
            max: 4
        }],
        validate: (val: any) => Array.isArray(val) && val.length >= 0 && val.length <= 5
    }, // ex. [1, 4] for Tuesday and Friday
    startTime: {
        type: Number,
        min: 0,
        max: 1439,
        required: false
    }, // Minutes since midnight, ex. 840 for 2:00 PM
    endTime: {
        type: Number,
        min: 0,
        max: 1439,
        required: false
    }, // Minutes since midnight, ex. 950 for 3:50 PM
    professors: [String], // ex. ["Charlie Roberts"]
    location: {
        type: String,
        required: false
    }, // ex. "Unity Hall 420"
})

courseSectionSchema.index({
    code: 1,
    section: 1
}, {
    unique: true
}) // The combination of course code and course section should be unique

export type CourseSectionDocument = InferSchemaType<typeof courseSectionSchema>;
export const CourseSection = model<CourseSectionDocument>("CourseSection", courseSectionSchema);

const userSchema = new Schema({
    username: {
        required: true,
        type: String,
        match: /^[a-zA-Z0-9\-\_]{4,20}$/
    },
    password: {
        required: true,
        type: String
    },
    token: {
        required: true,
        type: String,
        match: /^[a-zA-Z0-9\-\_]{1,12}$/
    },
    tokenExpiry: {
        required: true,
        type: Number,
        min: 0 // Zero indicates that the token has been force-expired, ex. user manually signs out
    },
    courses: [Types.ObjectId]
})

export type UserDocument = InferSchemaType<typeof userSchema.obj>;
export const User = model("User", userSchema);