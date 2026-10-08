import { useRef, useState } from "preact/hooks";
import * as Types from "../shared/types"
import { filterCourseSections } from "../shared/util";
import { Signal } from "@preact/signals";

export function UploadDialog(props: {
    show: Signal<() => void>,
    term: Types.Term,
    academicYear: number,
    setSections: (sections: Types.CourseSection[]) => void,
    setAcademicYear: (year: number) => void,
    loadIndex: () => void,
}){
    const [errorMsg, setErrorMsg] = useState('');

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
            const courseSections: Types.CourseSection[] | { error: string } = await response.json();
            if ("error" in courseSections) {
                setErrorMsg(courseSections.error);
            } else if (courseSections.length) {
                console.log(filterCourseSections(courseSections, props.academicYear, props.term));
                props.setSections(filterCourseSections(courseSections, props.academicYear, props.term));
                props.setAcademicYear(courseSections[0].academicYearStart);
                props.loadIndex()
                closeDialog();
            }      
        }
    }

    const dialogRef = useRef<HTMLDialogElement>(null);

    props.show.value = () => {
        dialogRef.current?.showModal();
        setErrorMsg("");
    }

    const closeDialog = ()=>{
        dialogRef.current?.close();
    }
    return <dialog ref={dialogRef} id='share'>
                <div class="flex">
                    <div>
                        <p>Start by exporting your courses as an Excel file on Workday. Go to your Academics Hub, and select View Details under Current Courses.</p>
                        <p>The button to download the Excel file will either be at the top right of the page, or directly under the "View Courses" header. Don't use the semester-specific download button, only the full-year one will work!</p>
                        <p>Then upload the Excel file here:</p>
                        <label class="file-input">
                            <input type="file" id="xlsxInput" accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={handleFileInput}/>
                            Upload Schedule
                        </label>
                        <p class='margin error'> {errorMsg}</p>
                    </div>
                    <button class="close-button" onClick={closeDialog}>X</button>
                </div>
            </dialog>
}