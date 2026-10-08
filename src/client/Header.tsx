import { useState } from "preact/hooks"
import { filterCourseSections } from "../shared/util"
import { CourseSection, Term } from "../shared/types.js";

export function Header(props: any){
    // Sends the selected file to the server
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
                console.log(filterCourseSections(courseSections, props.academicYear, props.term));
                props.setSections(filterCourseSections(courseSections, props.academicYear, props.term));
                props.setAcademicYear(courseSections[0].academicYearStart);
                props.loadIndex(event)
            }      
        }
    }
        
    // Sends a logout request to the server
    const handleLogout = async(event : Event) =>{
        event.preventDefault()
        fetch( '/api/log-out', {
      		method:'POST',
      		headers: { 'Content-Type': 'application/json' }
    	}).then(response => response.json())
    		.then(json => {
      		props.setUser(null)
    	})	
    }

    return <>
        <header>
            <button class='title' type='button' onClick={props.loadIndex}>WPI Schedule Viewer</button>
            <label class="file-input">
                <input type="file" id="xlsxInput" accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={handleFileInput}/>
                Upload Schedule
            </label>
            {props.loggedIn
                ? <><form onSubmit={handleLogout}>
                        <button type='submit'>Log Out</button>
                    </form></>
                : <button type='button' onClick={props.loadLogin}>Log In</button>
            }
        </header>
    </>
}