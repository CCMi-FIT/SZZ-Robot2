import fs from "node:fs";
import * as child_process from "node:child_process";
import {mkRosterItems, type RosterItem} from "./rosterReader.ts";
import {generateDocs} from "./generator.ts";

// Get working dir
const workingDir = Bun.argv[2] + "/";
if (!workingDir) { throw new Error("Missing working directory parameter"); }

function mkRoster(): RosterItem[] {
    const rosterOdsFile = workingDir + "roster.ods";
    console.info("Converting the roster file ODS->CSV")
    const res = child_process.execSync(`libreoffice --convert-to csv:"Text - txt - csv (StarCalc)":44,34,76 --outdir "${workingDir}" "${rosterOdsFile}"`);
    console.log(res.toString());
    const rosterCsvFile = workingDir + "roster.csv";
    return mkRosterItems(rosterCsvFile);
}

// Get docx template files
console.info("Looking into", workingDir);
const docxFiles = fs.readdirSync(workingDir).filter(fn => fn.includes(".docx"));
if (docxFiles.length === 0) {
    console.error("No .docx files, aborting");
    process.exit(1);
}
console.info("Found docx files (hopefully they are templates)", docxFiles);

generateDocs(workingDir, mkRoster());
console.info("Done.");
