import { render } from "preact"
import { useState } from "preact/hooks"

import { Schedule } from "./Schedule";

function App() {

    return <>
        <Schedule user="6abec107e87c336129be6ac2" />
    </>
}

render(<App />, document.body)