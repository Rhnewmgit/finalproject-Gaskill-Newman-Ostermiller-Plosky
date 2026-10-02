import { render } from "preact"

import { Schedule } from "./Schedule.js";
import { ScheduleCanvas } from "./ScheduleCanvas.jsx";

function App() {

    return <>
        <Schedule user="6abec107e87c336129be6ac2" />
        <ScheduleCanvas user="6abec107e87c336129be6ac2" />
    </>
}

render(<App />, document.body)