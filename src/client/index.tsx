import { render } from "preact"
import { useEffect, useState } from "preact/hooks";

import { Schedule } from "./Schedule.js";
import { ScheduleCanvas } from "./ScheduleCanvas.jsx";
import { AuthForm } from "./AuthForm.js"
import { Term } from "../shared/types.js";
import { LogoutButton } from "./LogoutButton.jsx";

function App() {
    const [term, setTerm] = useState<Term>("A");
    const [user, setUser] = useState(null);

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
            // const arr = await response.json();
        }
    }
    if(!user){
        return <AuthForm onLogin={setUser}/>
    }else{
        return <>
            <select onChange={e => setTerm((e.target as HTMLSelectElement).value as Term)}>
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
            <LogoutButton onLogout={setUser}/>
            <Schedule user={user} term={term} academicYear={2026} />
            <ScheduleCanvas user={user} term={term} academicYear={2026} />
            <input type="file" id="xlsxInput" accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={handleFileInput}/>
        </>
    }
}

render(<App />, document.body)