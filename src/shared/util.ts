import { CourseSection } from "./types.js";

export function mostExtremeTimes (sections: CourseSection[]) {
    let earliest = 1439;
    let latest = 0;

    sections.forEach(section => {
        if (section.startTime && section.startTime < earliest) {
            earliest = section.startTime;
        }

        if (section.endTime && section.endTime > latest) {
            latest = section.endTime;
        }
    })

    return { earliest: Math.min(earliest, latest), latest: Math.max(earliest, latest) }
}

export function formatSchedule (sections: CourseSection[]) {
    const schedule: CourseSection[][][] = [];

    for (let h = 0; h < 24; h++) {
        const hour: CourseSection[][] = [];
        for (let d = 0; d < 5; d++) {
            hour.push([]);
        }

        schedule.push(hour);
    }

    sections.forEach(section => {
        if (!section.startTime || !section.startTime) {
            return;
        }

        const hour = Math.floor(section.startTime / 60);

        section.meetingDays.forEach(day => {
            schedule[hour][day].push(section);
        })
    })

    return schedule;
}

export function formatTime(time: number) {
    const hour = Math.floor(time / 60);
    const minute = time % 60;
    return (hour > 12 ? hour - 12 : hour) + ":" + minute.toString().padStart(2, "0") + " " + (hour >= 12 ? "PM" : "AM");
}