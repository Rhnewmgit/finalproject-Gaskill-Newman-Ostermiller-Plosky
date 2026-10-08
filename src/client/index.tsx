import { render } from "preact"
import { useEffect, useState } from "preact/hooks";
import { exportScheduleImage } from "./exportScheduleImage.js"
import { Schedule } from "./Schedule.js";
import { AuthForm } from "./AuthForm.js"
import * as Types from "../shared/types.js";
import { Header } from "./Header.js";
import { filterCourseSections } from "../shared/util"
import { ShareDialog } from "./ShareDialog.jsx";

function App() {

    // To add another page, add its name to the Page enum and logic to the page
    // handling section below. To switch to the page, update useState to the
    // enum value
    enum Page{Index, Login, SignUp, Shared}
    const [page, setPage] = useState(Page.Index)
    const [term, setTerm] = useState<Types.Term>("A");
    const [user, setUser] = useState<string |null>(null);
    //seperate useState to show another person's schdule, so it can work regardless of login status
    const [sharedUser, setSharedUser] = useState<string |null>(null);
    const [academicYear, setAcademicYear] = useState(2026);
    const [sections, setSections] = useState<Types.CourseSection[]>([]);

    // This function can be passed down to components and set as an onclick
    // function for buttons which go to the index page
    function loadIndex(): void {
        console.log("Going to index page")
        setPage(Page.Index)
        history.pushState({}, "", "/")
        if (sharedUser) setSharedUser(null)
    }

    // This function can be passed down to components and set as an onclick
    // function for buttons which go to the login page
    function loadLogin(): void {
        console.log("Going to login page")
        history.replaceState({}, "", "/");
        setPage(Page.Login)
    }

    // This function can be passed down to components and set as an onclick
    // function for buttons which go to the account creation page
    function loadSignUp(): void{
        console.log("Going to account creation page")
        history.replaceState({}, "", "/");
        setPage(Page.SignUp)
    }

    // This function can be passed down to components and set as an onclick
    // function for buttons which go to the shared schedule page
    function loadShared(): void{
        console.log("Going to a shared schedule page")
        history.pushState({},"",`/user/${sharedUser}`)
        setPage(Page.Shared)
    }

    const setPageWithUrL =()=>{
        //produces the following array: [ "", "user", "6ac6e94ce0690abe701ae14a" ] or [""]
        const pathArray: string[] = window.location.pathname.split("/")
        if(pathArray.length === 3 && pathArray[1] == 'user'){
            setPage(Page.Shared)
            setSharedUser(pathArray[2])
        }
        else{
            setPage(Page.Index)
            setSharedUser(null)
        }

    }
    //use effect to parse the url
    useEffect(()=>{
        setPageWithUrL();
        window.addEventListener('popstate', setPageWithUrL)
        return () => window.removeEventListener("popstate", setPageWithUrL);
    },[])

    useEffect(() => {
        const userToFetch =  sharedUser || user
        console.log("Fetching courses for the user")

        if (userToFetch) {
            fetch("/api/courses/" + userToFetch).then(r => {
            return r.json();
        }).then((sections: Types.CourseSection[]) => {
            setSections(filterCourseSections(sections, academicYear, term))
        });
        }
    }, [user, sharedUser, academicYear, term]);

    //check login status on page load
    useEffect(() =>{
        fetch('/api/status')
        .then(res => res.json())
        .then(json => setUser(json.user))
    }, [])

    // -------------------------------------------------------------------------
    // PAGE HANDLING
    // This handles the logic for when to load pages and what to load
    // Most pages should have a <Header> and a <main> element
    // -------------------------------------------------------------------------
    if(!user && page == Page.Login){
        // Loads the login page only if the user is not logged in
        return <>
            <Header loggedIn={false} setUser={setUser} loadIndex={loadIndex} loadLogin={loadLogin} term={term} user={user} academicYear={academicYear} setAcademicYear={setAcademicYear} setSections={setSections} />
            <main>
                <AuthForm isLogin={true} onLogin={setUser} loadSignUp={loadSignUp} />
            </main>
        </>
    }
    else if(!user && page == Page.SignUp){
        // Loads the account creation page only if the user is not logged in
        return <>
            <Header loggedIn={false} setUser={setUser} loadIndex={loadIndex} loadLogin={loadLogin} term={term} user={user} academicYear={academicYear} setAcademicYear={setAcademicYear} setSections={setSections} />
            <main>
                <AuthForm isLogin={false} onLogin={setUser} loadLogin={loadLogin} />
            </main>
        </>
    }
    else if(page == Page.Shared){
        return <>
            <Header loggedIn={!!user} setUser={setUser} loadIndex={loadIndex} loadLogin={loadLogin} 
            term={term} user={sharedUser} academicYear={academicYear} setAcademicYear={setAcademicYear} setSections={setSections}/>
            <main>
                <select class="centered" onChange={e => setTerm((e.target as HTMLSelectElement).value as Types.Term)}>
                    <option value="A" selected>A term</option>
                    <option value="B">B term</option>
                    <option value="F">Fall Semester</option>
                    <option value="C">C term</option>
                    <option value="D">D term</option>
                    <option value="S">Spring Semester</option>
                    <option value="G">Graduate Spring Late Start</option>
                    <option value="E1">E1 term</option>
                    <option value="E2">E2 term</option>
                    <option value="E">Summer term</option>
                </select>
                <div class="sidescroller">
                    <Schedule sections={sections} />
                </div>
            </main>
        </>
    }
    else{
        // Otherwise loads the index page
        if(page != Page.Index){
            setPage(Page.Index)
            history.pushState({}, "", "/")
            if (sharedUser) setSharedUser(null)
        }
        
        return <>
            <Header loggedIn={!!user} setUser={setUser} loadIndex={loadIndex} loadLogin={loadLogin} 
            term={term} user={user} academicYear={academicYear} setAcademicYear={setAcademicYear} setSections={setSections}/>
            <main>
                <select class="centered" onChange={e => setTerm((e.target as HTMLSelectElement).value as Types.Term)}>
                    <option value="A" selected>A term</option>
                    <option value="B">B term</option>
                    <option value="F">Fall Semester</option>
                    <option value="C">C term</option>
                    <option value="D">D term</option>
                    <option value="S">Spring Semester</option>
                    <option value="G">Graduate Spring Late Start</option>
                    <option value="E1">E1 term</option>
                    <option value="E2">E2 term</option>
                    <option value="E">Summer term</option>
                </select>
                <div class="sidescroller">
                    {sections.length >0
                        ? (user ? 
                            <Schedule sections={sections} />
                            : <>
                                <p>Log in to save your schedule</p>
                                <Schedule sections={sections}/>
                            </>)
                        : (<p class='centered'>
                            You can export your courses as an Excel file found on Workday.
                            Go to your academics hub, and select View Details under Current Courses.
                            On the top right of that page, click the button to obtain the excel file.
                            And then you can upload the file using the Upload Schedule button.
                        </p>)
                    }
                </div>
                {user && <div class='centered button-div'>
                    <button onClick={async () => {
                        await exportScheduleImage(user, 2026, term);
                    }}>Export Image</button>
                    <ShareDialog user={user}/>
                </div>}
            </main>
        </>
    }
}

render(<App />, document.body)