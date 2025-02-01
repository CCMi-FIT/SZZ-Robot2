import fs from "node:fs";
import process from "process";
import Papa, {type ParseResult} from "papaparse";

type Row = string[];
type Table = Row[];

export type RosterItem = {
    commision: string;
    studentCode: string;
    spol: string;
    obor: string;
}

// Gets the lines that begin with an identifer
function filterEmptyRows(data: Table): Table {
    return data.filter(l => l[0].length > 0);
}

// Discards empty cells in a row
function compactRow(row: Row): Row {
    return row.filter(cell => cell.length > 0);
}

// Makes a student name code by extracting 3 characters from the first two words.
function studentNameToCode(studentName: string): string {
    return studentName
        .split(/\s+/)          // Split the name into words (by any whitespace)
        .filter(Boolean)       // Remove any empty strings
        .slice(0, 2)           // Keep only the first two words
        .map(word => word.slice(0, 3)) // Take the first 3 characters of each word (or fewer if the word is short)
        .join("");
}

function mkLineStruc(row: Row): RosterItem {
    if (row.length != 4) { throw new Error(`Processed row length does not match: ${row} (commission - student name - SPOL - OBOR`); }
    const [commision, studentName, spol, obor] = row;
    return {
        commision,
        studentCode: studentNameToCode(studentName),
        spol,
        obor,
    };
}

function checkStudentCodeUnique(rowsStructs: RosterItem[]): void {
    const codes = rowsStructs.map(rowStruct => rowStruct.studentCode);
    const duplicates = codes
        .filter((item, index, arr) => arr.indexOf(item) !== index)
        .reduce<string[]>((uniqueDups, dup) =>
            uniqueDups.includes(dup) ? uniqueDups : [...uniqueDups, dup], []);
    if (duplicates.length > 0) { throw new Error(`Duplicate student names codes: ${duplicates}`); }
    console.info("Student names codes: ", codes);
}

export function mkRosterItems(rosterFile: string) {
    console.info("Processing the roster file...");
    const csv = fs.readFileSync(rosterFile, "utf8");
    const result: ParseResult<Row> = Papa.parse(csv);
    if (result.errors.length > 0) {
        console.error(result.errors);
        process.exit(1);
    }
    const table = result.data.slice(1);
    const rows = filterEmptyRows(table).map(compactRow);
    const rowsStructs = rows.map(mkLineStruc);
    checkStudentCodeUnique(rowsStructs);
    return rowsStructs;
}

