import XLSX from "xlsx";
import { buffer } from "stream/consumers"
import Stream from "stream"

type Course = {
    section: string,
    year: number
};

export type CourseDBTuple = {
    code: String, //  ex. "CS 4241"
    section: String, // ex. "A01"
    academicYear: Number, // Year - 1 for terms excluding A, B, and AB
}

/**
 * 
 * @param file readable stream returned as file from busboy library
 * @returns promise containing an array of Objects representing the user's courses
 */
export default async function parseXLSX(file: Stream.Readable): Promise<CourseDBTuple[] | [] | undefined> {
    const workbook = XLSX.read(await buffer(file), { dense: true, nodim: true });
    const sheet1 = workbook.Sheets[workbook.SheetNames[0]];
    const data: any[][] = XLSX.utils.sheet_to_json(sheet1, { header: 1 }); //sheet1["!data"]?.map((row) => row.map((cell) => cell.v));
    if (data?.[3]?.[0] === null || data?.[3]?.[0] != "My Enrolled Courses") {
        console.log(`Bad data in A4: ${data?.[3]?.[0]}`)
        return;
    }
    const userCourses: UserCourse[] = [{ section: parseCourseSection(data?.[6][6]), year: normalizeYear(data?.[6][12]) }];
    for (let i = 7, secondSem = false; ; i++) {
        const dataRow = data?.[i];
        if (dataRow.length < 14) {
            // console.log(`${dataRow.length} < 14; secondSem = ${secondSem}, `)
            if (secondSem) {
                break;
            }
            while (data?.[i]?.[0] != "My Enrolled Courses" && i < 100) {
                i++;
                // console.log(`i = ${i}, col 1 = ${data?.[i]?.[0]}`);
            }
            if (i >= 100) {
                break;
            }
            i += 2;
            secondSem = true;
            continue;
        }
        userCourses.push({ section: parseCourseSection(dataRow[6]), year: normalizeYear(dataRow[12]) });
        // console.log(userCourses.at(userCourses.length - 1));
    }
    // console.log(userCourses);
    return userCourses;
}

function parseCourseSection(section: string): string {
    if (section === undefined) {
        console.log(`Unable to parse course section: ${section}`)
        return section;
    }
    return section.split(" -")?.[0];
}

function normalizeYear(raw: number): number {
    return Math.floor((raw / 365) + 1900);
}