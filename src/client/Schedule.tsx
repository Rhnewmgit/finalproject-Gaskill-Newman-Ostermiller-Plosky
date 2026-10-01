import { useEffect, useState } from "preact/hooks";
import { CourseSection } from "../shared/types"
import { mostExtremeTimes, formatSchedule, formatTime } from "../shared/util"

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export function Schedule(props: {user: string}) {
    const [sections, setSections] = useState<CourseSection[]>([]);

    useEffect(() => {
        fetch("/api/courses/" + props.user).then(r => {
            return r.json();
        }).then(setSections);
    }, [props.user]);

    const extremes = mostExtremeTimes(sections);
    const formatted = formatSchedule(sections);

    console.log(formatted)

    return <table class="schedule">
        <thead>
            <tr>
                <th></th>
                {days.map(day => {
                    return <th scope="column">{day}</th>
                })}
            </tr>
        </thead>
        <tbody>
            {formatted.map((hour, hourIndex) => {
                if (hourIndex * 60 < extremes.earliest || hourIndex * 60 > extremes.latest) {
                    return;
                }

                return <tr>
                    <th scope="row">{formatTime(hourIndex * 60)}</th>
                    {(hour || []).map(day => {
                        return <td>
                            {(day || []).map(section => {
                                return <div style={{
                                    transform: "translate(0px, calc(" + ((section.startTime as number) - (hourIndex * 60)) + " * var(--height-per-minute)))",
                                    height: "calc(" + ((section.endTime as number) - (section.startTime as number)) + " * var(--height-per-minute))"
                                }}>
                                    <p>{section.name}</p>
                                    <p>{section.type}</p>
                                    <p>{section.professors.join(", ")}</p>
                                    <p>{section.location}</p>
                                </div>
                            })}
                        </td>
                    })}
                </tr>
            })}
        </tbody>
    </table>
}