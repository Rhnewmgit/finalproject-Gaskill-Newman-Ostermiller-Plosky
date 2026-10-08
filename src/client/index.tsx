import { render } from "preact"
import { useEffect, useState } from "preact/hooks";
import { exportScheduleImage } from "./exportScheduleImage.js"
import { exportIcal } from "./exportIcal.js"
import { Schedule } from "./Schedule.js";
import { AuthForm } from "./AuthForm.js"
import * as Types from "../shared/types.js";
import { Header } from "./Header.js";
import { filterCourseSections } from "../shared/util"
import { ShareDialog } from "./ShareDialog.jsx";
import { TermSelect } from "./TermSelect.js"

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
    const [years, setYears] = useState([2026])
    //sections cross all years and terms
    const [sections, setSections] = useState<Types.CourseSection[]>([]);
    const [filteredSections, setFilteredSections] = useState<Types.CourseSection[]>([]);
    const [isCourses, setIsCourses] = useState(false)

    // This function can be passed down to components and set as an onclick
    // function for buttons which go to the index page
    function loadIndex(): void {
        // console.log("Going to index page")
        setPage(Page.Index)
        history.pushState({}, "", "/")
        if (sharedUser) setSharedUser(null)
    }

    // This function can be passed down to components and set as an onclick
    // function for buttons which go to the login page
    function loadLogin(): void {
        // console.log("Going to login page")
        history.replaceState({}, "", "/");
        setPage(Page.Login)
    }

    // This function can be passed down to components and set as an onclick
    // function for buttons which go to the account creation page
    function loadSignUp(): void{
        // console.log("Going to account creation page")
        history.replaceState({}, "", "/");
        setPage(Page.SignUp)
    }

    // This function can be passed down to components and set as an onclick
    // function for buttons which go to the shared schedule page
    function loadShared(): void{
        // console.log("Going to a shared schedule page")
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
        // console.log("Fetching courses for the user")

        if (userToFetch) {
            fetch("/api/courses/" + userToFetch).then(r => {
            return r.json();
        }).then((sections: Types.CourseSection[]) => {
            setIsCourses(true)
            //setSections(filterCourseSections(sections, academicYear, term))
            setSections(sections)
        });
        }
    }, [user, sharedUser]);

    useEffect(()=>{
        setFilteredSections(filterCourseSections(sections, academicYear, term))
    },[sections, academicYear, term])

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
            <Header loggedIn={false} setUser={setUser} loadIndex={loadIndex} loadLogin={loadLogin} 
            term={term} user={user} academicYear={academicYear} setAcademicYear={setAcademicYear} 
            setSections={setSections} sections={sections} setIsCourses={setIsCourses} years={years} setYears={setYears}/>
            <main>
                <AuthForm isLogin={true} onLogin={setUser} loadSignUp={loadSignUp} />
            </main>
        </>
    }
    else if(!user && page == Page.SignUp){
        // Loads the account creation page only if the user is not logged in
        return <>
            <Header loggedIn={false} setUser={setUser} loadIndex={loadIndex} loadLogin={loadLogin} 
            term={term} user={user} academicYear={academicYear} setAcademicYear={setAcademicYear} 
            setSections={setSections} sections={sections} setIsCourses={setIsCourses} years={years} setYears={setYears}/>
            <main>
                <AuthForm isLogin={false} onLogin={setUser} loadLogin={loadLogin} />
            </main>
        </>
    }
    else if(page == Page.Shared){
        return <>
            <Header loggedIn={!!user} setUser={setUser} loadIndex={loadIndex} loadLogin={loadLogin} 
            term={term} user={sharedUser} academicYear={academicYear} setAcademicYear={setAcademicYear} 
            setSections={setSections} sections={sections} setIsCourses={setIsCourses} years={years} setYears={setYears}/>
            <main>
                <select class="centered" onChange={e => setAcademicYear(parseInt((e.target as HTMLSelectElement).value))}>
                    {years.map((year)=>(
                        <option value={year} key={year}>{year}-{year+1}</option>
                    ))}
                </select>
                <TermSelect setTerm={setTerm} />
                <div class="sidescroller">
                    <Schedule sections={filteredSections} />
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
            term={term} user={user} academicYear={academicYear} setAcademicYear={setAcademicYear} 
            setSections={setSections} sections={sections} setIsCourses={setIsCourses} years={years} setYears={setYears}/>
            <main>
                <select class="centered" onChange={e => setAcademicYear(parseInt((e.target as HTMLSelectElement).value))}>
                    {years.map((year)=>(
                        <option value={year} key={year}>{year}-{year+1}</option>
                    ))}
                </select>
                {isCourses && <TermSelect setTerm={setTerm} />}
                
                <div class="sidescroller">
                    {isCourses
                        ? (user ? 
                            <Schedule sections={filteredSections} />
                            : <>
                                <p class='centered-text'>Log in to save your schedule.</p>
                                <Schedule sections={filteredSections}/>
                            </>)
                        : (<>
                            <p>Upload your schedule to view or share it.</p>
                        </>)
                    }
                </div>
                <div class='centered button-div'>
                    {filteredSections.length > 0 && <>
                        <button onClick={async () => {
                            await exportScheduleImage(filteredSections);
                        }}>Export Image</button>
                        <button onClick={() => {
                            exportIcal(filteredSections);
                        }}>Export for Calendar</button>
                        {user && <ShareDialog user={user}/>}
                    </>}
                </div>
            </main>
        </>
    }
}

render(<App />, document.body)