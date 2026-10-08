import { CourseSection, Term } from "./types.js";

export function mostExtremeTimes(sections: CourseSection[]) {
    let earliest = 1439;
    let latest = 0;

    sections.forEach(section => {
        section.meetings.forEach(meeting => {
            if (meeting.startTime && meeting.startTime < earliest) {
                earliest = meeting.startTime;
            }

            if (meeting.endTime && meeting.endTime > latest) {
                latest = meeting.endTime;
            }
        })
    })

    return { earliest: Math.min(earliest, latest), latest: Math.max(earliest, latest) }
}

export function formatTime(time: number) {
    const hour = Math.floor(time / 60);
    const minute = time % 60;
    return (hour > 12 ? hour - 12 : hour) + ":" + minute.toString().padStart(2, "0") + " " + (hour >= 12 ? "PM" : "AM");
}

const termMappings: { [K in Term]: Term[] } = {
    A: ["F"],
    B: ["F"],
    C: ["S"],
    D: ["S"],
    E1: ["E"],
    E2: ["E"],
    F: ["A", "B"],
    S: ["C", "D", "G"],
    E: ["E1", "E2"],
    G: ["S"]
}

export function filterCourseSections(sections: CourseSection[], academicYear: number, term: Term): CourseSection[] {
    return sections.filter(section => {
        if (section.academicYearStart !== academicYear) {
            return false;
        }

        if (section.term !== term && !termMappings[term].includes(section.term)) {
            return false;
        }

        return true;
    });
}