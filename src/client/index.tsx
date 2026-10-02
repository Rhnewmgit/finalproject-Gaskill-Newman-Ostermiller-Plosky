import { render } from "preact"
import { useState } from "preact/hooks"

import { getName } from "../shared/index"

function App() {
    const [count, setCount] = useState(0);

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
        <h1>{getName()}</h1>
        <button onClick={() => {
            setCount(count + 1);
        }}>Clicked {count} time{count === 1 ? "" : "s"}</button>
        <input type="file" id="xlsxInput" accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={handleFileInput}/>
    </>
}

render(<App />, document.body)