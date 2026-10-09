# WPI Schedule Formatter and Sharing Tool

- Noah Gaskill
- Richard Newman
- James Ostermiller
- Kyle Plosky

Try it out at https://wpi-schedule-viewer.onrender.com/ <br/>
Watch a demonstration of the site in action at https://www.youtube.com/watch?v=m8X2jykxMek

---

For this project, we made a website that allows users to easily view their class schedule for any given term to easily find the time, location, professor, and type (e.g. lecture) for their classes per term. The user can import their full course schedules for the current year using an Excel spreadsheet that can be exported from their Workday page, which will then populate the schedule. If the user is logged in, their schedule is saved, and it can be additionally shared to others either through an image or a link that can be easily copied. They can additionally export their courses as an .ics file to upload on calendar applications.

The excel file to be uploaded can be found at Workday by going to Student -> Academics Hub -> Current Classes/View Details -> export Excel spreadsheet icon at the top right or directly below the “View Courses” header (importantly, not the export button across from "My Enrolled Courses"). The exported file should be called "View_My_Courses.xlsx", which can then be uploaded on the website by clicking the button on the top left in the header. To create an account, click the log in button at the top right and click the "Sign up here!" link below the login form.

## Technologies

- Node.js: Server backend
- Typescript: Language for backend and frontend with static typing for ease of debugging
- Preact: Library used to make frontend with reactive elements and smaller files than React
- Esbuild: Compiles typescript and preact, bundles, and minifies the output to browser-readable HTML and JS files
- Express: Node framework to make backend request handling simpler and enables the use of middleware
- MongoDB: Database manager that stores user and course data, hosted on MongoDB Atlas
- Mongoose: Library for MongoDB and Node that allows for schemas to be defined and simplifies interactions with MongoDB
- Node Fetch: Browser fetch function reimplemented for Node backend, used to retrieve the JSON containing all course information from the WPI website (https://courselistings.wpi.edu/assets/prod-data.json)
- Bcryptjs: Javascript version of Bcrypt, hashes and salts passwords to safely store them on the database by not storing them as plaintext
- cookie-session: Cookie-based session middleware for express, handles client cookie to maintain the user's logged-in state
- dotenv: Loads environment variables from a .env file in root, avoids MongoDB password and cookie session token keys being in the codebase as plaintext
- busboy: Parses HTML form data, used when sending the Excel file from the client to the server
- SheetJS: Allows extracting data from spreadsheets, parses .xsls file into usable data
- ical-generator: Creates iCalendar (ICS) files for exporting into calendar services
- Offscreen Canvas API: Creates the image version of the schedule for exporting
- History API: manages the state of the page history, allowing for users to change between the main page and a shared schedule without needing to paste the link into the browser

## Challenges

- The learning curve for Typescript and Preact (and figuring out that specifying modules in Esbuild is necessary)
- Figuring out how to parse FormData type content to send files
- SheetJS troubles in retrieving data; built-in functions (XLSX.utils.sheet_to_json, the "!data" field of a workbook specified as dense) seemed to be broken despite data being present. The turned out to be that the Excel spreadsheet provided by Workday has a strange issue where the metadata has the number of rows set to 1, despite clearly having significantly more than that, so the nodim option needed to be used when parsing the workbook to force SheetJS to figure out the dimensions of the spreadsheet manually.
- Getting the page url and reactive states of page to both update properly, and allowing a user to go back and forth between the index page and the shared schedule through using the History API for the browser
- Allowing for schedules to be uploaded and displayed when the user is not logged in (which required us to implement multiple ways of getting the data to the user)
- Account for edge cases generally for displaying the schedules, like for example handling a term that has no courses, allowing for future years to be added, or displaying different content depending on both whether or not a schedule has been updated and if a user is logged in
- Accounting for discrepancies and edge cases in WPI’s course data, ranging from course sections with unique meeting patterns (like ones whose meeting times change throughout the course, or which meet at different times on different days for the same section) to course sections in the data with the wrong year

## Responsibilities

- Noah Gaskill
  -Implementing an account creation system using cookies and session tokens, as well as creating a component for the login and sign up forms.
    - Implemented the link-sharing feature, using the Clipboard and History APIs in javascript; parses the link in order to show a specific user’s schedule regardless of their login status, allowed for going between that link and the main page
    - Refactoring some useStates so that all courses for a user and the ones for a given year and term are managed separately
    - Added a simple year selector, allowing for use of this site in future academic years.

- Richard Newman
    - Sending the excel file to the server
    - Parsing the excel file into usable data
    - Comparing that data with the information on the Database from the WPI website to get the full course section information, which can then be sent back to the user
    - Refactoring some Preact objects to change the props provided to the Schedule to allow for the course sections to be provided directly.

- James Ostermiller
    - Fetching the course data from the WPI server, parsing it into objects which match our defined schema, and updating the database accordingly
    - Most of the styling for the site, including refining the initial page designs and keeping the styles and typescript objects consistent and easily extensible
    - Refactoring the code for switching between pages to apply to the entire app to make it easy to add logic for new pages (based on Noah’s initial implementation of log in and sign up pages)

- Kyle Plosky
    - Set up the build environment using ESBuild for compiling TypeScript and JSX files.
    - Created the initial database schema and refactored it once we discovered some issues
    - Created the components for displaying the schedule using CSS grid as well as the canvas-based rendered for the image export feature
    - Implemented the ICS/iCalendar export feature using the ical-generator library
