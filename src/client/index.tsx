import { render } from "preact"

import { Schedule } from "./Schedule.js";

function App() {
    async function handleFileInput(event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (file) {
            const formData = new FormData();
            formData.append("file", file);
            await fetch("/courseFile", {
                method: 'POST',
                body: formData,
            });
        }
    }

    return <>
        <Schedule user="6abec107e87c336129be6ac2" />
        <input type="file" id="xlsxInput" accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={handleFileInput}/>
    </>
}

render(<App />, document.body)