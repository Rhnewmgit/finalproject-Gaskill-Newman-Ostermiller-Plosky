import { render } from "preact"
import { useState } from "preact/hooks"

import { getName } from "../shared/index"

function App() {
    const [count, setCount] = useState(0);

    return <>
        <h1>{getName()}</h1>
        <button onClick={() => {
            setCount(count + 1);
        }}>Clicked {count} time{count === 1 ? "" : "s"}</button>
    </>
}

render(<App />, document.body)