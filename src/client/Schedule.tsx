import { useEffect, useState } from "preact/hooks";
import { CourseSection, Term } from "../shared/types"
import { mostExtremeTimes, formatTime, filterCourseSections } from "../shared/util"

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export function Schedule(props: {user: string, academicYear: number, term: Term}) {
    const [sections, setSections] = useState<CourseSection[]>([]);

    useEffect(() => {
        fetch("/api/courses/" + props.user).then(r => {
            return r.json();
        }).then(sections => {
            setSections(filterCourseSections(sections, props.academicYear, props.term))
        });
    }, [props.user, props.academicYear, props.term]);

    const extremes = mostExtremeTimes(sections);
    const hours: number[] = [];
    for (let h = Math.floor(extremes.earliest / 60); h < Math.ceil(extremes.latest / 60); h++) {
        hours.push(h);
    }

    return <div class="schedule">
        <div class="header-stripe"></div>
        {hours.map((hour, hourIndex) => {
            return <>
                {hourIndex % 2 == 1 ? <div class="time-stripe" style={{
                    gridRow: timeToRow(hour * 60, extremes.earliest) + " / " + timeToRow((hour + 1) * 60, extremes.earliest),
                    gridColumn: "1 / 7"
                }}></div> : null}
                <div class="time-label" style={{
                    gridRow: timeToRow(hour * 60, extremes.earliest) + " / " + timeToRow((hour + 1) * 60, extremes.earliest),
                    gridColumn: 1
                }}>
                    {formatTime(hour * 60)}
                </div>
            </>
        })}
        {days.map((day, dayIndex) => {
            return <div class="day-label" style={{
                gridRow: 1,
                gridColumn: dayIndex + 2
            }}>
                {day}
            </div>
        })}
        {sections.map((section, index) => {
            const cssclass = "course-section course" + index
            return <>
                {section.meetings.map(meeting => {
                    return <div class={cssclass} style={{
                        gridRow: timeToRow(meeting.startTime, extremes.earliest) + " / " + timeToRow(meeting.endTime, extremes.earliest),
                        gridColumn: meeting.day + 2
                    }}>
                        <p>{section.name}</p>
                        <p>{section.type}</p>
                        <p>{section.professors.join(", ")}</p>
                        <p>{meeting.location}</p>
                    </div>
                })}
            </>
        })}
    </div>
}

function timeToRow(time: number, earliest: number): number {
    return Math.floor((time - earliest) / 5) + 2
}