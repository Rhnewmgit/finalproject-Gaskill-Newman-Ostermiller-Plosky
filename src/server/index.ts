import express from "express"
import { join } from "path"
import { getName } from "../shared/index.js"
import dotenv from "dotenv"
import mongoose from "mongoose"
import { courseRoutes } from "./courses.js"
import busboy from "busboy";
import parseXLSX from "./xlsxHandler.js";
import fetch from "node-fetch"

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
})

app.get("/{*a}", (req: express.Request, res: express.Response) => {
	res.sendFile(join(import.meta.dirname, "../client/index.html"))
})

async function fetchCourseData(){
    let url = 'https://courselistings.wpi.edu/assets/prod-data.json'
    const response = await fetch(url)
    const data = await response.json()
    const courselist = data.Report_Entry
    // TODO: remove all courses for the current year
    courselist.forEach(course => {
        createCourseSection(course)
        // TODO: ADD COURSE TO DB
    });

}
// fetchCourseData()

// Test data
let course = {
    Course_Section_Start_Date: '2026-10-19',
    CF_LRV_Cluster_Ref_ID: '',
    Student_Course_Section_Cluster: '',
    Meeting_Patterns: 'M-T-R-F | 9:00 PM - 9:50 AM',
    Course_Title: 'AB 1532 - Elementary Arabic II',
    Locations: 'Olin Hall 126',
    Instructional_Format: 'Lecture',
    Waitlist_Waitlist_Capacity: '0/10',
    Course_Description: '<p>Cat. I<br /><br />This course continues students’ exposure to and development of Modern Standard Arabic and Darija, the Arabic dialect spoken in Morocco; it is for students who can read and write using the Arabic script but have very basic understanding of vocabulary and syntax. New language structures, vocabulary and cultural concepts will be presented in communicative activities/materials in class and homework assignments; these activities will focus on receptive (reading &amp; listening) and productive (writing &amp; speaking) skills in Arabic.<br /><br />Recommended background: AB1531 or instructor approval; this course is closed to native<br />speakers of Arabic and heritage speakers except with written permission from the instructor.</p>',
    Public_Notes: '',
    Subject: 'Arabic',
    Delivery_Mode: 'In-Person',
    Academic_Level: 'Undergraduate',
    Section_Status: 'Open',
    Credits: '3',
    Section_Details: 'Olin Hall 126 | M-T-R-F | 9:00 AM - 9:50 AM',
    Instructors: 'Mohammed El Hamzaoui',
    Offering_Period: '2026 Fall B Term',
    Starting_Academic_Period_Type: 'B Term',
    Course_Tags: 'Degree Attribute :: Humanities and Arts; Offering Pattern :: Category I',
    Academic_Units: 'Humanities and Arts Department',
    Course_Section: 'AB 1532-B01 - Elementary Arabic II',
    Enrolled_Capacity: '13/25',
    Course_Section_End_Date: '2026-12-11',
    Meeting_Day_Patterns: 'M-T-R-F',
    Course_Section_Owner: 'Humanities and Arts Department'
    }
const courseSection = createCourseSection(course)
console.log(courseSection)

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

    // FIND START AND END TIMES
    // course.Meeting_Patterns is in format 'M-T-R-F | 9:00 AM - 9:50 AM'
    // Split into 'M-T-R-F' (can be discarded) and '9:00 AM - 9:50 AM'
    const timestring = course.Meeting_Patterns.split(' | ')[1]
    // Split into '9:00 AM' and '9:50 AM'
    const times = timestring.split(' - ')
    const startTime = timeToMinutesPastMidnight(times[0])
    const endTime = timeToMinutesPastMidnight(times[1])

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
        startTime:startTime,
        endTime:endTime,
        professors:course.Instructors.split('; '),
        location:course.Locations
    }
    return courseObject
}

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