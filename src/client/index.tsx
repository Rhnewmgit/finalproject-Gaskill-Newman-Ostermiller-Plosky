import { render } from "preact"
import { useEffect, useState } from "preact/hooks";

import { Schedule } from "./Schedule.js";
import { ScheduleCanvas } from "./ScheduleCanvas.jsx";
import { AuthForm } from "./AuthForm.js"
import { Term } from "../shared/types.js";
import { LogoutButton } from "./LogoutButton.jsx";
import { Header } from "./Header.js";

function App() {
    enum Page{Index, Login, SignUp}
    const [term, setTerm] = useState<Term>("A");
    const [user, setUser] = useState(null);
    const [page, setPage] = useState(Page.Index)

    function loadLogin(event: MouseEvent): void {
        console.log("Going to login page")
        setPage(Page.Login)
    }

    function loadSignUp(event: MouseEvent): void{
        console.log("Going to account creation page")
        setPage(Page.SignUp)
    }

    //check login status on page load
    useEffect(() =>{
        fetch('/api/status')
        .then(res => res.json())
        .then(json => setUser(json.user))
    }, [])

    // if(!user){
    //     return <AuthForm onLogin={setUser}/>
        // return <>
        //     <header>
        //         <button>Log In</button>
        //     </header>
        //     <input type="file" id="xlsxInput" accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={handleFileInput}/>
        // </>
    // }else{
    if(!user && page == Page.Login){
        return <>
            <Header loggedIn={false} login={loadLogin} />
            <main>
                <AuthForm isLogin={true} onLogin={setUser} signUp={loadSignUp} />
            </main>
        </>
    }
    else if(!user && page == Page.SignUp){
        return <>
            <Header loggedIn={false} login={loadLogin} />
            <main>
                <AuthForm isLogin={false} onLogin={setUser} login={loadLogin} />
            </main>
        </>
    }
    else{
        if(page != Page.Index){setPage(Page.Index)}
        console.log(user)
        return <>
            <Header loggedIn={!!user} setUser={setUser} login={loadLogin} />
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
                    <p> SCHEDULE GOES HERE </p>
                    {/* <Schedule user={user} term={term} academicYear={2026} /> */}
                </div>
                <button class="centered">Export as image</button>
            </main>
        </>
    }
}

render(<App />, document.body)