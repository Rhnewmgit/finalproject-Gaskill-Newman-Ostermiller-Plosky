import { useEffect, useRef, useState } from "preact/hooks";
import { CourseSection, Term } from "../shared/types"
import { mostExtremeTimes, formatTime, filterCourseSections } from "../shared/util"
import { Ref } from "preact";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const canvasWidth = 900;
const canvasHeight = 600;
const timeColumnWidth = 100;
const dayColumnWidth = (canvasWidth - timeColumnWidth) / days.length;

export function ScheduleCanvas(props: {user: string, academicYear: number, term: Term}) {
    const [sections, setSections] = useState<CourseSection[]>([]);
    const canvas = useRef<HTMLCanvasElement>();

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

    useEffect(() => {
        if (!canvas.current) {
            return;
        }

        const ctx = canvas.current.getContext("2d");

        if (!ctx) {
            return;
        }

        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        const heightPerMinute = (canvasHeight - 25) / (extremes.latest - extremes.earliest);

        ctx.textBaseline = "top";
        ctx.textAlign = "center";
        ctx.font = "bold 14px Arial";
        ctx.fillStyle = "#ccc";
        ctx.fillRect(0, 0, canvasWidth, 25);
        ctx.fillStyle = "#00f0";
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
            section.meetingDays.forEach(day => {
                if (!section.startTime || !section.endTime) {
                    return;
                }

                const x = timeColumnWidth + dayColumnWidth * day;
                let y = 25 + heightPerMinute * (section.startTime - extremes.earliest);
                const yEnd = y + heightPerMinute * (section.endTime - section.startTime) - 4;

                ctx.fillStyle = "#ddd";
                ctx.fillRect(x + 2, y + 2, dayColumnWidth - 4, heightPerMinute * (section.endTime - section.startTime) - 4)
                ctx.fillStyle = "#000";
                y += 5;
                y = wrapText(section.name, x + 5, y, dayColumnWidth - 10, yEnd, 18, ctx) + 2;
                y = wrapText(section.type, x + 5, y, dayColumnWidth - 10, yEnd, 18, ctx) + 2;
                y = wrapText(section.professors.join(", "), x + 5, y, dayColumnWidth - 10, yEnd, 18, ctx) + 2;
                wrapText(section.location || "", x + 5, y, dayColumnWidth - 10, yEnd, 18, ctx);
            });
        })
    }, [sections]);

    return <canvas ref={canvas as Ref<HTMLCanvasElement>} width={canvasWidth} height={canvasHeight}></canvas>
}

function wrapText(text: string, x: number, y: number, maxWidth: number, maxY: number, lineHeight: number, ctx: CanvasRenderingContext2D) {
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