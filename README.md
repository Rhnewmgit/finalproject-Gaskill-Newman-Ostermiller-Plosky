# WPI Schedule Formatter and Sharing Tool

- Noah Gaskill
- Richard Newman
- James Ostermiller
- Kyle Plosky

Try it out at (Render link)
Watch a demonstration of the site in action at (YT Link)

---

For this project, we made a website that allows users to easily view their class schedule for any given term to easily find the time, location, professor, and type (e.g. lecture) for their classes per term. The user can import their full course schedules using an Excel spreadsheet that can be exported from their Workday page, which will then populate the schedule. If the user is logged in, their schedule is saved, and it can be additionally shared to others either through an image or a link that can be easily copied.

The excel file to be uploaded can be found at Workday by going to Student -> Academics Hub -> Current Classes/View Details -> export Excel spreadsheet icon at the top right (importantly, not the export button across from "My Enrolled Courses"). The exported file should be called "View_My_Courses.xlsx". To create an account, click the log in button at the top right and click the "Sign up here!" button.

## Technologies

- Node.js
    - Server backend
- Typescript
    - Language for backend and frontent with static typing for ease of debugging
- Preact
    - Library used to make frontend with reactive elements and smaller files than React
- Esbuild
    - Compiles typescript and preact, bundles, and minifies the output to browser-readable HTML and JS files
- Express
    - Node framwork to make backend request handling simpler and enables the use of middleware
- MongoDB
    - Database manager
    - Stores user and course data, hosted on MongoDB Atlas
- Mongoose
    - Library for MongoDB and Node that allows for schemas to be defined and simplifies interactions with MongoDB
- Node Fetch
    - Browser fetch function reimplemented for Node backend
    - Used to retrieve the JSON containing all course information from the WPI website (https://courselistings.wpi.edu/assets/prod-data.json)
- Bcryptjs
    - Javascript version of Bcrypt for hashing passwords
    - Hashes and salts passwords to safely store them on the database by not storing them as plaintext
- cookie-session
    - Cookie-based session middleware for express
    - Handles client cookie to maintain the user's logged-in state
- dotenv
    - Loads environment variables from a .env file in root
    - Avoids MongoDB password and cookie session token keys being in the codebase as plaintext
- busboy
    - Parses HTML form data
    - Used when sending the Excel file from the client to the server
- Sheet Js
    - Allows extracting data from spreadsheets
    - Parses .xsls file into usable data
- ical-generator
    - Creates iCalendar (ICS) files for exporting into calendar services

## Responsibilities and Challenges

- Noah Gaskill
    -
- Richard Newman
    -
- James Ostermiller
    -
- Kyle Plosky
    -
