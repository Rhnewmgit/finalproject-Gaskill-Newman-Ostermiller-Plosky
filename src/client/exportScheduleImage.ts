import { CourseSection, Term } from "../shared/types.js"
import { mostExtremeTimes, formatTime, filterCourseSections } from "../shared/util.js"

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const canvasWidth = 900;
const canvasHeight = 600;
const timeColumnWidth = 100;
const dayColumnWidth = (canvasWidth - timeColumnWidth) / days.length;

export async function exportScheduleImage(sections){
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

    ctx.font = "14px Arial";
    sections.forEach(section => {
        section.meetings.forEach(meeting => {
            const x = timeColumnWidth + dayColumnWidth * meeting.day;
            let y = 25 + heightPerMinute * (meeting.startTime - extremes.earliest);
            const yEnd = y + heightPerMinute * (meeting.endTime - meeting.startTime) - 4;

            ctx.fillStyle = "#ddd";
            ctx.fillRect(x + 2, y + 2, dayColumnWidth - 4, heightPerMinute * (meeting.endTime - meeting.startTime) - 4)
            ctx.fillStyle = "#000";
            y += 5;
            y = wrapText(section.name, x + 5, y, dayColumnWidth - 10, yEnd, 18, ctx) + 2;
            y = wrapText(section.type, x + 5, y, dayColumnWidth - 10, yEnd, 18, ctx) + 2;
            y = wrapText(section.professors.join(", "), x + 5, y, dayColumnWidth - 10, yEnd, 18, ctx) + 2;
            wrapText(meeting.location || "", x + 5, y, dayColumnWidth - 10, yEnd, 18, ctx);
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