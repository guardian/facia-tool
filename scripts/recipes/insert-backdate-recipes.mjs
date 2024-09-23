import crypto from "crypto";
import { migrateIssue } from './migrate-issue.mjs';

const dateFormat = 'YYYY-MM-DD';
const usage = `Example usage is

node ./insert-backdate-recipes.mjs
    --curation-path "northern"
    --from-date "2024-05-01"
    --to-date "2024-05-05"
    --edition-name "feast-northern-hemisphere"
    --stage CODE
    --cookie "<get this from a Fronts client request header for the appropriate stage>"

Note that you must specify --dry-run=false in order to populate the collections with content
`;

const getArg = (flag, optional = false) => {
    const argIdx = process.argv.indexOf(flag);
    const arg = argIdx !== -1 ? process.argv[argIdx + 1] : "";

    if (!arg && !optional) {
        console.error(`No argument for ${flag} given. ${usage}`);
        process.exit(2);
    }

    return arg;
};

const getFrontsUri = () => {
    switch(stage.toLocaleUpperCase()) {
        case "PROD":
            return "https://fronts.gutools.co.uk";
        case "CODE":
            return "https://fronts.code.dev-gutools.co.uk";
        case "LOCAL":
            return "https://fronts.local.dev-gutools.co.uk";
        default:
            throw new Error("--stage must be one of PROD, CODE or LOCAL")
    }
}

const getDate = (d) => {
    var curr_date = d.getDate();
    var curr_month = d.getMonth() + 1; //Months are zero based
    var curr_year = d.getFullYear();
    const resultData =   '' + curr_year + '-' + (curr_month<=9 ? '0' + curr_month : curr_month) + '-' + (curr_date <= 9 ? '0' + curr_date : curr_date);//curr_year + "-" + curr_month  + "-" + curr_date
    console.log( " resultData = "+resultData);
    return resultData
}

const curationPath = getArg("--curation-path");
const fromDate = getArg("--from-date");
const toDate = getArg("--to-date");
const editionName = getArg("--edition-name")
const stage = getArg("--stage");
const cookie = getArg("--cookie");
const dryRun = getArg("--dry-run", true) !== "false";

const curationBaseUrl = "https://recipes.guardianapis.com";
const frontsBaseUrl = getFrontsUri();
const frontsHeaders = {
    "Content-Type": "application/json",
    Cookie: cookie,
};

if (stage === "PROD") {
    console.warn(
        `This will run in the PROD environment in 5 seconds - Ctrl-C to cancel.`
    );
    await new Promise((r) => setTimeout(r, 5000));
}

if(dryRun) throw new Error("Boo");

const startDate = new Date(fromDate);
const endDate = new Date(toDate);
var loopOnDate = startDate;//introduce loop to iterate through dates
while(loopOnDate <= endDate) {
    let newDate = loopOnDate.setDate(loopOnDate.getDate() + 1);
    loopOnDate = new Date(newDate);
    console.log(`loopOnDate is ${loopOnDate}`)
    const date = getDate(loopOnDate)
    console.log(`after date format, date is ${date}`)

    try {
        await migrateIssue(curationBaseUrl, curationPath, date, frontsBaseUrl, frontsHeaders, editionName, stage, dryRun);
    } catch (err) {
        console.error(err);
        await new Promise((r) => setTimeout(r, 5000));
    }
    console.log(" Ending the loop iteration for date = " + date)
}







