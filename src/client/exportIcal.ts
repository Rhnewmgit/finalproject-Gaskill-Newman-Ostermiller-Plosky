import ical, { ICalEventRepeatingFreq } from "ical-generator";
import { CourseSection } from "../shared/types.js";

export function exportIcal(sections: CourseSection[]) {
    const calendar = ical({
        name: "WPI Schedule",
        timezone: "America/New_York"
    });

    sections.forEach(section => {
        section.meetings.forEach(meeting => {
            const start = new Date(meeting.startDate);
            start.setHours(Math.floor(meeting.startTime / 60), meeting.startTime % 60);
            const end = new Date(meeting.startDate);
            end.setHours(Math.floor(meeting.endTime / 60), meeting.endTime % 60);
            const termEnd = new Date(meeting.endDate + 86400000);
            end.setHours(Math.floor(meeting.endTime / 60), meeting.endTime % 60);

            calendar.createEvent({
                start: start,
                end: end,
                description: section.name + (section.professors.length > 0 ? " with " + section.professors.join(", ") : ""),
                summary: section.code + "-" + section.section + " " + section.type,
                location: meeting.location,
                repeating: {
                    freq: ICalEventRepeatingFreq.WEEKLY,
                    until: termEnd,
                }
            })
        })
    });

    const blob = new Blob([calendar.toString()], {
        type: "text/calendar"
    });
    const blobUrl = URL.createObjectURL(blob);
    const downloadLink = document.createElement("A");
    downloadLink.setAttribute("href", blobUrl);
    downloadLink.setAttribute("download", "schedule.ics");
    downloadLink.click();
}