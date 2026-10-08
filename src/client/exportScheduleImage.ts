import { Term } from "../shared/types.js"
import { mostExtremeTimes, formatTime, filterCourseSections } from "../shared/util.js"

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const canvasWidth = 900;
const canvasHeight = 600;
const timeColumnWidth = 100;
const dayColumnWidth = (canvasWidth - timeColumnWidth) / days.length;
const colors = ["rgb(218, 127, 75)", "rgb(124, 180, 220)", "rgb(219, 172, 31)", "rgb(103, 164, 62)", "rgb(168, 117, 197)", "rgb(46, 168, 163)", "rgb(227, 137, 132)", "rgb(100, 100, 193)", "rgb(117, 212, 180)", "rgb(212, 174, 117)", "rgb(155, 199, 97)", "rgb(163, 101, 126)"];

export async function exportScheduleImage(user: string, academicYear: number, term: Term) {
    const sections = filterCourseSections(await fetch("/api/courses/" + user).then(r => {
        return r.json();
    }), academicYear, term);

    const extremes = mostExtremeTimes(sections);
    const hours: number[] = [];
    for (let h = Math.floor(extremes.earliest / 60); h < Math.ceil(extremes.latest / 60); h++) {
        hours.push(h);
    }

    const canvas = new OffscreenCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext("2d", {
        alpha: false
    });

    if (!ctx) {
        return;
    }

    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    const heightPerMinute = (canvasHeight - 25) / (extremes.latest - extremes.earliest);

    ctx.textBaseline = "top";
    ctx.textAlign = "center";
    ctx.font = "bold 14px Arial";
    ctx.fillStyle = "#ccc";
    ctx.fillRect(0, 0, canvasWidth, 25);
    ctx.fillStyle = "#000";
    days.forEach((day, dayIndex) => {
        ctx.fillText(day, timeColumnWidth + dayColumnWidth * dayIndex + (dayColumnWidth / 2), 5);
    });
    ctx.textAlign = "left";
    hours.forEach((hour, hourIndex) => {
        ctx.fillStyle = "#eee";
        if (hourIndex % 2 === 1) {
            ctx.fillRect(0, 25 + heightPerMinute * hourIndex * 60, canvasWidth, heightPerMinute * 60);
        }
        ctx.fillStyle = "#000";
        ctx.fillText(formatTime(60 * hour), 5, 30 + heightPerMinute * hourIndex * 60);
    })

    const courseColors = new Map<string, number>();
    let lastCourseColor = 0;

    ctx.font = "14px Arial";
    sections.forEach(section => {
        let courseColor: number;
        if (courseColors.has(section.code)) {
            courseColor = courseColors.get(section.code) as number;
        } else {
            courseColor = lastCourseColor;
            courseColors.set(section.code, courseColor);
            lastCourseColor++;
        }

        section.meetings.forEach(meeting => {
            const x = timeColumnWidth + dayColumnWidth * meeting.day;
            let y = 25 + heightPerMinute * (meeting.startTime - extremes.earliest);
            const yEnd = y + heightPerMinute * (meeting.endTime - meeting.startTime) - 4;

            ctx.fillStyle = colors[courseColor];
            ctx.fillRect(x + 2, y + 2, dayColumnWidth - 4, heightPerMinute * (meeting.endTime - meeting.startTime) - 4)
            ctx.fillStyle = "#000";
            y += 5;
            ctx.font = "bold 14px Arial";
            y = wrapText(`${section.code}-${section.section}`, x + 5, y, dayColumnWidth - 10, yEnd, 18, ctx) + 2;
            y = wrapText(section.name, x + 5, y, dayColumnWidth - 10, yEnd, 18, ctx) + 2;
            ctx.font = "14px Arial";
            y = wrapText(meeting.location || "", x + 5, y, dayColumnWidth - 10, yEnd, 18, ctx);
            y = wrapText(section.professors.join(", "), x + 5, y, dayColumnWidth - 10, yEnd, 18, ctx) + 2;
            y = wrapText(section.type, x + 5, y, dayColumnWidth - 10, yEnd, 18, ctx) + 2;
            
        });
    })

    const blob = await canvas.convertToBlob({
        type: "image/png"
    });
    const blobUrl = URL.createObjectURL(blob);
    const downloadLink = document.createElement("A");
    downloadLink.setAttribute("href", blobUrl);
    downloadLink.setAttribute("download", "schedule.png");
    downloadLink.click();
}

function wrapText(text: string, x: number, y: number, maxWidth: number, maxY: number, lineHeight: number, ctx: OffscreenCanvasRenderingContext2D) {
    const words = text.split(" ");
    let line = "";
    while (words.length) {
        line = words.shift() as string;
        while (words.length && ctx.measureText(line + " " + words[0]).width < maxWidth) {
            line += " " + words.shift();
        }

        if (y + lineHeight > maxY) {
            return y;
        }
        ctx.fillText(line, x, y);
        y += lineHeight;
        line = "";
    }

    return y;
}