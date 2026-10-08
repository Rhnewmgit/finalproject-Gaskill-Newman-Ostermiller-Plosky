import * as Types from "../shared/types";

export function TermSelect(props:{
        setTerm: (term: Types.Term) => void
}){
    return <>
        <select class="centered" onChange={e => props.setTerm((e.target as HTMLSelectElement).value as Types.Term)}>
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
    </>
}