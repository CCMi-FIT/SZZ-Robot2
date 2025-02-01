import fs from "node:fs";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import type {RosterItem} from "./rosterReader.ts";

function mkRecord(rosterItem: RosterItem): Record<string, string> {
    const spol = {[`${rosterItem.studentCode}_spol`]: rosterItem.spol};
    const obor = {[`${rosterItem.studentCode}_obor`]: rosterItem.obor};
    return {
        ...spol,
        ...obor,
    };
}

function mkTemplateData(rosterItems: RosterItem[]): Record<string, string> {
    return rosterItems.reduce(
        (res, line) => ({...res, ...mkRecord(line)}),
        {}
    );
}

function generateCommissionDoc(workingDir: string, resultDir: string, commission: string, rosterItems: RosterItem[]) {
    const file = workingDir + commission + ".docx";
    console.info("Loading template", file);
    const content = fs.readFileSync(file, "binary");
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
    });
    // Render the document (Replace {first_name} by John, {last_name} by Doe, ...)
    doc.render(mkTemplateData(rosterItems));

    const buf = doc.getZip().generate({
        type: "nodebuffer",
        compression: "DEFLATE",
    });

    const resultFile =resultDir + commission + ".docx";
    console.info("Writing", resultFile);
    fs.writeFileSync(resultFile, buf);
}

export function generateDocs(workingDir: string, rosterItems: RosterItem[]) {
    console.info("Going to generate the documents...");

    const resultDir = workingDir + "otazky/";
    if (!fs.existsSync(resultDir)) {
        fs.mkdirSync(resultDir);
    }

    const commissions = [...new Set(rosterItems.map(rosterItem => rosterItem.commision))];
    console.info("The following commissions are present in the roster:", commissions);
    for (const commission of commissions) {
        generateCommissionDoc(workingDir, resultDir, commission, rosterItems.filter(ri => ri.commision === commission));
    }
}

