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
    const data = await response.json()
    const courseObjects = []
    // TODO: remove all courses for the current year from the database
    data.Report_Entry.forEach(course => {
        courseObjects.push(createCourseSection(course))
    });
    // Print a selection of courses
    console.log(courseObjects[1]) // Random selection
    console.log(courseObjects[155]) // Random selection
    console.log(courseObjects[71]) // AE 5232-B01: Online-asynchronous section
    console.log(courseObjects[66]) // AE 5132-D02: Online-synchronous section with no times or days (probably a mistake in the data)
    console.log(courseObjects[184]) // AS 4001-AL01: Section with different meeting times on different days
    console.log(courseObjects[2852]) // NEU 504-F01: Section with different meeting times throughout the semester
    // TODO: add the new courses to the database
    // mongoose.COLLECTION.insertMany(courseObjects)
}
fetchCourseData()

// Given a json object representing a course with the fields present in the data
// recieved from WPI, creates a CourseSection object
function createCourseSection(course){
    // PARSE NAME:
    // course.Course_Section is in format 'CS 4241-A01 - Webware'
    // Split on hyphen to get 'CS 4241', 'A01 ', ' Webware'
    let sectionstring = course.Course_Section.split('-')
    // Remove leading space from name
    let name = sectionstring[2].slice(1)
    // Name might have a hyphen in it: if so, reconstruct it
    for(let i = 3; i < sectionstring.length; i++){
        name += '-' + sectionstring[i]
    }

    // FIND FULL ACADEMIC YEAR:
    const termLetter = course.Starting_Academic_Period_Type.charAt(0)
    let startYear = Number(course.Offering_Period.substring(0,4))
    let endYear = startYear + 1
    if(termLetter != 'A' && termLetter != 'B'){
        // termletter == C, D, E
        startYear--
        endYear--
    }

    // PARSE MEETING DAYS
    const meetingDays = []
    // If the class is asynchronous, no meeting days
    if(course.Locations !== "Online-asynchronous" && course.Meeting_Day_Patterns != ""){
        // Otherwise, check for each day and push the corresponding numbwe
        if(course.Meeting_Day_Patterns.indexOf('M') !== -1){
            meetingDays.push(0)
        }
        if(course.Meeting_Day_Patterns.indexOf('T') !== -1){
            meetingDays.push(1)
        }
        if(course.Meeting_Day_Patterns.indexOf('W') !== -1){
            meetingDays.push(2)
        }
        if(course.Meeting_Day_Patterns.indexOf('R') !== -1){
            meetingDays.push(3)
        }
        if(course.Meeting_Day_Patterns.indexOf('F') !== -1){
            meetingDays.push(4)
        }
        if(course.Meeting_Day_Patterns.indexOf('S') !== -1){
            meetingDays.push(5)
        }
        if(course.Meeting_Day_Patterns.indexOf('U') !== -1){
            meetingDays.push(6)
        }
    }

    // FIND START AND END TIMES
    // course.Meeting_Patterns is in format 'M-T-R-F | 9:00 AM - 9:50 AM'
    // Split into 'M-T-R-F' (discarded) and '9:00 AM - 9:50 AM'
    let startTime = -1
    let endTime = -1
    // If the class is asynchronous, the start and end times will be -1
    if(course.Locations !== "Online-asynchronous" && course.Meeting_Patterns != ""){
        const timestring = course.Meeting_Patterns.split(' | ')[1]
        // Split into '9:00 AM' and '9:50 AM'
        const times = timestring.split(' - ')
        startTime = timeToMinutesPastMidnight(times[0])
        endTime = timeToMinutesPastMidnight(times[1])
    }

    course.Instructors.split('; ')

    // MAKE EVERYTHING INTO AN OBJECT
    const courseObject: CourseSection = {
        name:name,
        code:sectionstring[0],
        type:course.Instructional_Format,
        section:sectionstring[1].slice(0,-1),
        term:termLetter,
        academicYearStart:startYear,
        academicYearEnd:endYear,
        meetingDays:meetingDays,
        professors:course.Instructors.split('; '),
        location:course.Locations
    }
    // Only add times if they exist
    if(startTime != -1){
        courseObject.startTime = startTime
        courseObject.endTime = endTime
    }
    return courseObject
}

// Given a 12h time formatted as a string, e.g. "9:20 AM", returns the time as
// minutes from midnight
function timeToMinutesPastMidnight(timestring){
    const parts = timestring.split(':')
    const hour = Number(parts[0])
    const mins = Number(parts[1].substring(0,2))
    const meridian = parts[1].substring(3)
    let time = hour * 60 + mins
    if(meridian == 'PM'){
        time += 12*60
    }
    return time
}

app.listen(process.env.PORT || 3000)

console.log(`Welcome to ${getName()}`)
console.log(`Listening on port ${process.env.PORT || 3000}...`)