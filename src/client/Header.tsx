import * as Types from "../shared/types";
import { filterCourseSections } from "../shared/util"

export function Header(props: { 
    loggedIn: boolean,
    term: Types.Term,
    academicYear: number,
    user: string | null,
    sections: Types.CourseSection[],
    years: number[],
    setSections: (sections: Types.CourseSection[]) => void,
    setAcademicYear: (year: number) => void,
    setUser: (user: string | null) => void,
    setYears: (years: number[])=>void,
    setIsCourses: (isCourses: boolean) => void,
    loadIndex: () => void,
    loadLogin: () => void
}) {
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
            const courseSections: Types.CourseSection[] = await response.json();
            console.log(props.academicYear, props.term)
            if (courseSections.length) {
                const newAcademicYear = courseSections[0].academicYearStart
                console.log(filterCourseSections(courseSections, props.academicYear, props.term));
                if (!props.loggedIn){
                    props.setSections(courseSections);
                }else{
                    const allSections = props.sections.filter(course => course.academicYearStart != newAcademicYear).concat(courseSections);
                    props.setSections(allSections)
                }
                props.setAcademicYear(newAcademicYear);
                if(!props.years.includes(newAcademicYear)) props.setYears([...props.years, newAcademicYear])
                props.loadIndex()
                props.setIsCourses(true)
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
        props.setSections([])
        props.setIsCourses(false)
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