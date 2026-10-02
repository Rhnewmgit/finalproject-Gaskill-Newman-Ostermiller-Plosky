export type User = {
    username: string
    password: string
    token: string
    tokenExpiry: number
    courses: {
        code: string,
        section: string,
        academicYear: number
    }[]
}

export type CourseSection = {
    type: string;
    name: string;
    code: string;
    section: string;
    term: "A" | "B" | "C" | "D" | "E1" | "E2" | "F" | "S" | "E";
    academicYearStart: number;
    academicYearEnd: number;
    meetingDays: number[];
    professors: string[];
    startTime?: number;
    endTime?: number;
    location?: string;
}