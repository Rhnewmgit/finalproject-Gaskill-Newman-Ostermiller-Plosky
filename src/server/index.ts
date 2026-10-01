import express from "express"
import { join } from "path"
import { getName } from "../shared/index.js"
import dotenv from "dotenv"
import mongoose from "mongoose"
import { courseRoutes } from "./courses.js"
import busboy from "busboy";
import parseXLSX from "./xlsxHandler.js";
import fetch from "node-fetch"
import {CourseSection, User} from "./models.js"
import busboy from "busboy";
import parseXLSX from "./xlsxHandler.js";
import { courseRoutes } from "./courses.js"

dotenv.config()

const app: express.Express = express()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}`;

await mongoose.connect(uri)

// https://mongoosejs.com/docs/index.html

app.use(express.static(join(import.meta.dirname, "../../static")))

app.use(express.json());
courseRoutes(app);

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
});
courseRoutes(app);

app.get("/{*a}", (req: express.Request, res: express.Response) => {
    res.sendFile(join(import.meta.dirname, "../client/index.html"))
})

app.get("/{*a}", (req: express.Request, res: express.Response) => {
	res.sendFile(join(import.meta.dirname, "../client/index.html"))
})

// Updates the course data in the database for the current year based on the
// data provided from WPI's server
async function fetchCourseData(){
    // Fetch data
    let url = 'https://courselistings.wpi.edu/assets/prod-data.json'
    const response = await fetch(url)
    const data = await response.json()
    const yearcounts = []

    // Convert data to CourseSection objects
    const courseObjects = []
    data.Report_Entry.forEach(course => {
        courseObjects.push(createCourseSection(course, yearcounts))
    });

    // Print a selection of courses for verification purposes
    // console.log("Selection of courses created:")
    // console.log(courseObjects[0]) // Generic course
    // console.log(courseObjects[155]) // Generic course
    // console.log(courseObjects[71]) // AE 5232-B01: Online-asynchronous section
    // console.log(courseObjects[66]) // AE 5132-D02: Online-synchronous section with no times or days (probably a mistake in the data)
    // console.log(courseObjects[184]) // AS 4001-AL01: Section with different meeting times on different days
    // console.log(courseObjects[2852]) // NEU 504-F01: Section with different meeting times throughout the semester
    
    console.log('Deleting old data...')

    // Removes all the old courses for the years associated with the incoming file.
    // Assumes that any year with less than 10 courses associated with it is
    // erroneous data and discards it.
    let countDeleted = 0
    let countRemoved = 0
    // For each year, check if the count is less than 10
    for (const y of yearcounts){
        if(y.count >= 10){
            // If there are more than 10, delete all the old courses for that year
            let newdeleted = await CourseSection.deleteMany({academicYearStart: y.year})
            countDeleted += await newdeleted.deletedCount
        }
        else{
            // Otherwise, discard all new courses for that year
            let nextOfYear = courseObjects.findIndex((e) => e.academicYearStart == y.year)
            while(nextOfYear !== -1){
                countRemoved++
                courseObjects.splice(nextOfYear, 1)
                nextOfYear = courseObjects.findIndex((e) => e.academicYearStart == y.year)
            }
        }
    };
    console.log('Deleted ' + countDeleted + ' courses')
    console.log("Removed " + countRemoved + " courses with incorrect year from the incoming dataset.")
    
    // Send the new courses to the database
    console.log("Sending data to database...")
    await CourseSection.bulkSave(courseObjects)

    /* DEBUG: instead of bulksave, send each course individually so that the
       bulk printing of ids doesn't push the error off the screen */
    // courseObjects.forEach(element => {
    //     element.save()
    // });

    console.log("Successfully sent all courses.")
}

/* Actually runs the function that fetches the course data. Can be put anywhere */
fetchCourseData()

// Given a json object representing a course with the fields present in the data
// recieved from WPI, creates a CourseSection object
function createCourseSection(course, yearcounts){
    // PARSE NAME:
    // course.Course_Section is in format 'CS 4241-A01-X - Webware'
    // Split on hyphen surrounded by spaces to get 'CS 4241-A01-X', 'Webware'
    const sectionstring = course.Course_Section.split(' - ')
 
    // Split on hyphen to get 'CS 4241' 'A01' 'X'
    const courseCodeFull = sectionstring[0].split('-')
    const code = courseCodeFull[0]

    let section = courseCodeFull[1]
    // If there are additional parts to the section code, add them
    for(let i = 2; i < courseCodeFull.length; i++){
        section += '-' + courseCodeFull[i]
    }

    let name = sectionstring[1]
    // Name might have ' - ' in it: if so, add extra pieces back
    for(let i = 2; i < sectionstring.length; i++){
        name += ' - ' + sectionstring[i]
    }

    // FIND FULL ACADEMIC YEAR:
    let termLetter = course.Starting_Academic_Period_Type.charAt(0)
    // Add number to "E1" or "E2"
    if(course.termLetter == 'E'){
        termLetter += course.Starting_Academic_Period_Type.charAt(1)
    }
    // Convert "Summer" to "E"
    if(course.Starting_Academic_Period_Type == 'Summer'){
        termLetter == E
    }
    let startYear = Number(course.Offering_Period.substring(0,4))
    let endYear = startYear + 1
    if(termLetter != 'A' && termLetter != 'B' && termLetter != 'F'){
        // termletter == C, D, E, S, G
        startYear--
        endYear--
    }

    // Add the year of this item to the year counts
    const yearIndex = yearcounts.findIndex((e) => e.year == startYear)
    // console.log(startYear + ' at '+ yearIndex)
    if(yearIndex !== -1){
        yearcounts[yearIndex].count++
    }
    else{
        yearcounts.push({year: startYear, count: 1})
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
    const courseObject = new CourseSection({
        name:name,
        code:code,
        type:course.Instructional_Format,
        section:section,
        term:termLetter,
        academicYearStart:startYear,
        academicYearEnd:endYear,
        meetingDays:meetingDays,
        professors:course.Instructors.split('; '),
        location:course.Locations
    });
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
    if(meridian == 'PM' && hour != 12){
        time += 12*60
    }
    return time
}

app.listen(process.env.PORT || 3000)

console.log(`Welcome to ${getName()}`)
console.log(`Listening on port ${process.env.PORT || 3000}...`)