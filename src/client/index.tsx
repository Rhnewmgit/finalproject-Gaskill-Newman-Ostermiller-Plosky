import { render } from "preact"
import { useEffect, useState } from "preact/hooks";
import { exportScheduleImage } from "./exportScheduleImage.js"
import { Schedule } from "./Schedule.js";
import { AuthForm } from "./AuthForm.js"
import { CourseSection, Term } from "../shared/types.js";
import { LogoutButton } from "./LogoutButton.jsx";
import { Header } from "./Header.js";
import { filterCourseSections } from "../shared/util"

function App() {

    // To add another page, add its name to the Page enum and logic to the page
    // handling section below. To switch to the page, update useState to the
    // enum value
    enum Page{Index, Login, SignUp}
    const [page, setPage] = useState(Page.Index)

    const [term, setTerm] = useState<Term>("A");
    const [user, setUser] = useState(null);
    const [academicYear, setAcademicYear] = useState(2026);
    const [sections, setSections] = useState<CourseSection[]>([]);

    // This function can be passed down to components and set as an onclick
    // function for buttons which go to the index page
    function loadIndex(event: MouseEvent): void {
        console.log("Going to index page")
        setPage(Page.Index)
    }

    // This function can be passed down to components and set as an onclick
    // function for buttons which go to the login page
    function loadLogin(event: MouseEvent): void {
        console.log("Going to login page")
        setPage(Page.Login)
    }

    // This function can be passed down to components and set as an onclick
    // function for buttons which go to the account creation page
    function loadSignUp(event: MouseEvent): void{
        console.log("Going to account creation page")
        setPage(Page.SignUp)
    }

    useEffect(() => {
        if (user) {
            fetch("/api/courses/" + user).then(r => {
            return r.json();
        }).then(sections => {
            setSections(filterCourseSections(sections, academicYear, term))
        });
        }
    }, [user, academicYear, term]);

    //check login status on page load
    useEffect(() =>{
        fetch('/api/status')
        .then(res => res.json())
        .then(json => setUser(json.user))
    }, [])

    async function handleFileInput(event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];        
        if (file) {
            const formData = new FormData();
            formData.append("file", file);
            const response = await fetch("/api/courses", {
                method: 'POST',
                body: formData,
            });
            const courseSections = await response.json();
            if (courseSections.length) {
                console.log(filterCourseSections(courseSections, academicYear, term));
                setSections(filterCourseSections(courseSections, academicYear, term));
                setAcademicYear(courseSections[0].academicYearStart);
            }      
        }
    }
    // -------------------------------------------------------------------------
    // PAGE HANDLING
    // This handles the logic for when to load pages and what to load
    // Most pages should have a <Header> and a <main> element
    // -------------------------------------------------------------------------
    if(!user && page == Page.Login){
        // Loads the login page only if the user is not logged in
        return <>
            <Header loggedIn={false} loadIndex={loadIndex} loadLogin={loadLogin} />
            <main>
                <AuthForm isLogin={true} onLogin={setUser} loadSignUp={loadSignUp} />
            </main>
        </>
    }
    else if(!user && page == Page.SignUp){
        // Loads the account creation page only if the user is not logged in
        return <>
            <Header loggedIn={false} loadIndex={loadIndex} loadLogin={loadLogin} />
            <main>
                <AuthForm isLogin={false} onLogin={setUser} loadLogin={loadLogin} />
            </main>
        </>
    }
    else{
        // Otherwise loads the index page
        if(page != Page.Index){setPage(Page.Index)}
        return <>
            <Header loggedIn={!!user} setUser={setUser} loadIndex={loadIndex} loadLogin={loadLogin} />
            <main>
                <select class="centered" onChange={e => setTerm((e.target as HTMLSelectElement).value as Term)}>
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
                    {user
                        ? <Schedule user={user} term={term} academicYear={2026} />
                        : <p class='centered'>Please log in to see your schedule.</p>
                    }
                </div>
                <button class='centered' onClick={async () => {
                    await exportScheduleImage(user, 2026, term);
                }}>Export Image</button>
            </main>
        </>
    }
}

render(<App />, document.body)