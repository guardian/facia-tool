import crypto from "crypto";

const dateFormat = 'YYYY-MM-DD';
const usage = `Example usage is

node ./insert-recipe-cards.mjs
    --curation-path "northern/meat-free"
    --from-date "2024-05-01"
    --to-date "2024-05-05"
    --edition-name "feast-northern-hemisphere"
    --front-name "Meat-Free"
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
const frontName = getArg("--front-name");
const fromDate = getArg("--from-date");
const toDate = getArg("--to-date");
const editionName = getArg("--edition-name")
const stage = getArg("--stage");
const cookie = getArg("--cookie");
const dryRun = getArg("--dry-run", true) !== "false";

const curationBaseUrl = "https://recipes.code.dev-guardianapis.com";
const frontsBaseUrl = getFrontsUri();
const frontsHeaders = {
    "Content-Type": "application/json",
    Cookie: cookie,
};


const startDate = new Date(fromDate);
const endDate = new Date(toDate);
var loopOnDate = startDate;//introduce loop to iterate through dates
while(loopOnDate <= endDate) {
    let newDate = loopOnDate.setDate(loopOnDate.getDate() + 1);
    loopOnDate = new Date(newDate);
    console.log(`loopOnDate is ${loopOnDate}`)
    const date = getDate(loopOnDate)
    console.log(`after date format, date is ${date}`)

    //------Get CURATION.JSON --------//
    const curationUrl = `${curationBaseUrl}/${curationPath}/${date}/curation.json`;

    if (stage === "PROD") {
        console.warn(
            `This will run in the PROD environment in 5 seconds - Ctrl-C to cancel.`
        );
        await new Promise((r) => setTimeout(r, 5000));
    }

    console.log(`Fetching curation data from ${curationUrl} ...`);

    const curationResponse = await fetch(curationUrl);


    if (curationResponse.status !== 200) { //---Dont proceed if Curation.json does not exists for that date---//
        console.error(
            `Error getting issue data from Fronts tool: ${curationResponse.status} ${
                curationResponse.statusText
            } ${await curationResponse.text()}`
        );
        //process.exit(1);
    }else { //---Proceed to FRONT work if curation.json is present---//
        /**
         * @type {Array<{
         *  title: string,
         *  body: string,
         *  id: string,
         *  items: Array<
         *      { recipe: { id: string } } |
         *      { chef: { id: string }} |
         *      { collection: { recipes: string[] }}
         *    >}
         *  >}
         */
        const curation = await curationResponse.json();

        const fetchIssueForTheDate = async (editionName, start, end) => {
            const path = `${frontsBaseUrl}/editions-api/editions/${editionName}/issues?dateFrom=${start}&dateTo=${end}`
            console.log("start fetching issue if available...")
            const resp = await fetch(path, {
                method: 'get',
                mode: 'cors',
                headers: frontsHeaders,
                credentials: 'include',
            }).then((response) => {
                console.log("response when fetching issue if available = " + response.status)
                return response.json();
            }).then(({issues}) => issues[0])
            return resp;
        };

        const issueFoundForTheDate = await fetchIssueForTheDate(editionName, date, date);

        console.log(`DO we already have issue id?  ${issueFoundForTheDate.id}`)

        let frontsIssueId = ""
        if (issueFoundForTheDate && issueFoundForTheDate.id) { //Skip rest of work of data migration if issue exists on the date
            console.log(`Yes we already have existing issue so Don't migrate! ${issueFoundForTheDate.id}`)
            frontsIssueId = issueFoundForTheDate.id
        } else { //Proceed to create new issue and migration of data in to it.
            const createIssue = async (editionName, date) => {
                const path = `${frontsBaseUrl}/editions-api/editions/${editionName}/issues`;
                console.log("start creating issue...")
                const resp = await fetch(path, {
                    method: 'post',
                    mode: 'cors',
                    headers: frontsHeaders,
                    credentials: 'include',
                    body: JSON.stringify({issueDate: `${date}`}),
                }).then((response) => {
                    console.log("response = " + response.status)
                    return response.json();
                });
                return resp
            }

            const frontsIssue = await createIssue(editionName, date)

            frontsIssueId = frontsIssue.id
            console.log(`Issue is created: ${frontsIssueId.id}`)

        if (frontsIssueId.length > 0) {
            console.log(`Migrating curation data from ${curationPath} to ${stage} Fronts tool, issue: ${frontsIssueId}, front name: ${frontName}, dry run: ${dryRun}.`);

            const frontsIssueUrl = `${frontsBaseUrl}/editions-api/issues/${frontsIssueId}`;

            console.log(`Got curation data.\nFetching fronts issue data from ${frontsIssueUrl}...`);

            const fetchFrontFromIssue = async () => {
                const frontsResponse = await fetch(frontsIssueUrl, {
                    method: "GET",
                    headers: frontsHeaders,
                });

                if (frontsResponse.status !== 200) {
                    console.error(
                        `Error getting issue data from Fronts tool: ${
                            frontsResponse.status
                        } ${frontsResponse.statusText} ${await frontsResponse.text()}`
                    );
                    process.exit(1);
                }

                /**
                 * @type {{
                 *   id: string;
                 *   edition: string;
                 *   issueDate: string; // YYYY-MM-dd
                 *   createdOn: number;
                 *   createdBy: string;
                 *   createdEmail: string;
                 *   launchedOn?: number;
                 *   launchedBy: string;
                 *   launchedEmail: string;
                 *   fronts: Array<{
                 *       id: string;
                 *       displayName: string;
                 *       isHidden: boolean;
                 *       updatedOn?: number;
                 *       updatedBy?: string;
                 *       updatedEmail?: string;
                 *       collections: Array<{
                 *           id: string;
                 *           displayName: string;
                 *           prefill?: EditionsPrefill;
                 *           isHidden: boolean;
                 *           lastUpdated?: number;
                 *           updatedBy?: string;
                 *           updatedEmail?: string;
                 *           items: any[];
                 *         }>;
                 *     }>;
                 *   supportsProofing: boolean;
                 *   lastProofedVersion?: string;
                 *   platform: string;
                 * }}
                 */
                const issueJson = await frontsResponse.json();

                console.log("Got Fronts data.");

                const front = issueJson.fronts.find(
                    (front) => front.displayName === frontName
                );

                if (!front) {
                    console.error(
                        `No front found with name ${frontName} in issue ${frontsIssueId}`
                    );
                    process.exit(1);
                }

                return front;
            };

            let front = await fetchFrontFromIssue();

            const collectionNamesInFrontsTool = front.collections.map(
                (col) => col.displayName
            );
            const collectionTitlesMissingInFronts = curation
                .filter((col) => !collectionNamesInFrontsTool.includes(col.title.trim()))
                .map((col) => col.title);

            if (collectionTitlesMissingInFronts.length) {
                // Collections are added from the top, so we add the last collection first
                for (const title of collectionTitlesMissingInFronts.reverse()) {
                    const newCollectionResponse = await fetch(
                        `${frontsBaseUrl}/editions-api/fronts/${front.id}/collection?name=${title}`,
                        {
                            method: "PUT",
                            headers: frontsHeaders,
                        }
                    );

                    if (newCollectionResponse.status !== 200) {
                        console.error(
                            `Error creating new collection: ${
                                newCollectionResponse.status
                            } ${
                                newCollectionResponse.statusText
                            } ${await newCollectionResponse.text()}`
                        );
                        process.exit(1);
                    } else {
                        console.log(
                            `Collection with title ${title} added to front ${front.id}`
                        );
                    }
                }

                front = await fetchFrontFromIssue();
            }

            const titleMap = Object.values(front.collections).reduce(
                (acc, collection) => ({
                    ...acc,
                    [collection.displayName]: collection,
                }),
                {}
            );

            console.log(
                `Mapped titles to collections: \n\n${JSON.stringify(
                    Object.entries(titleMap).map(([title, col]) => `${title}: ${col.id}`),
                    undefined,
                    "  "
                )}`
            );

            const skippedCollections = [];

            const updatedCollections = curation.flatMap((collection) => {
                const frontCollection = titleMap[collection.title.trim()];
                const frontCollectionId = frontCollection?.id;
                if (!frontCollectionId) {
                    console.log(
                        `No id found mapping the title ${collection.title} to the existing front – skipping this collection`
                    );
                    skippedCollections.push(collection.title);
                    return [];
                }

                const items = collection.items.flatMap((item, index) => {
                    const cardMeta = {
                        uuid: crypto.randomUUID(),
                        frontPublicationDate: Date.now(),
                    };

                    const cardType = item.chef
                        ? "chef"
                        : item.recipe
                            ? "recipe"
                            : item.collection
                                ? "collection"
                                : undefined;

                    if (!cardType) {
                        console.log(`No card type for ${item}`);
                        return [];
                    }

                    switch (cardType) {
                        case "recipe": {
                            return [
                                {
                                    ...cardMeta,
                                    id: item.recipe.id,
                                    cardType: "recipe",
                                },
                            ];
                        }
                        case "chef": {
                            const {id, bio, image, foregroundHex, backgroundHex} =
                                item.chef;
                            return [
                                {
                                    ...cardMeta,
                                    id: id,
                                    frontPublicationDate: Date.now(),
                                    cardType: "chef",
                                    meta: {
                                        bio: bio,
                                        ...(foregroundHex
                                            ? {
                                                chefTheme: {
                                                    id: "custom",
                                                    palette: {
                                                        foregroundHex: foregroundHex,
                                                        backgroundHex: backgroundHex,
                                                    },
                                                },
                                            }
                                            : {}),
                                        ...(image
                                            ? {
                                                chefImageOverride: {
                                                    src: image,
                                                    origin: image,
                                                },
                                            }
                                            : {}),
                                    },
                                },
                            ];
                        }
                        case "collection": {
                            const {title, image, lightPalette, darkPalette, recipes} =
                                item.collection;

                            return [
                                {
                                    ...cardMeta,
                                    id: crypto.randomUUID(),
                                    cardType: "feast-collection",
                                    meta: {
                                        title,
                                        supporting: recipes.map((id) => ({
                                            cardType: "recipe",
                                            id,
                                            uuid: crypto.randomUUID(),
                                            frontPublicationDate: Date.now(),
                                        })),
                                        ...(lightPalette && darkPalette
                                            ? {
                                                feastCollectionTheme: {
                                                    id: "custom",
                                                    lightPalette,
                                                    darkPalette,
                                                    ...(image ? {imageURL: image} : {}),
                                                },
                                            }
                                            : {}),
                                    },
                                },
                            ];
                        }
                        default: {
                            console.warn("++?????++ Out of Cheese Error. Redo From Start.");
                        }
                    }
                });

                return {
                    ...frontCollection,
                    items,
                };
            });

            if (dryRun) {
                console.log(
                    `Dry run, stopping. Would have updated ${
                        updatedCollections.length
                    } collections: \n\n ${JSON.stringify(
                        updatedCollections,
                        undefined,
                        "  "
                    )}`
                );

                process.exit(0);
            }

            let hasError = false;

            for (const updatedCollection of updatedCollections) {
                if (hasError) {
                    console.warn(
                        `Skipping ${updatedCollection.id} (${updatedCollection.name}), as there were errors.`
                    );
                    break;
                }

                const body = JSON.stringify({
                    id: updatedCollection.id,
                    collection: updatedCollection,
                });
                const bodySize = new Blob([body]).size;

                const response = await fetch(
                    `${frontsBaseUrl}/editions-api/collections/${updatedCollection.id}`,
                    {
                        method: "PUT",
                        headers: frontsHeaders,
                        body,
                    }
                );

                if (response.status !== 200) {
                    hasError = true;
                    console.error(
                        `Error putting new collection data for collection ${
                            updatedCollection.id
                        } from Fronts tool. Attempted to post \n\n ${JSON.stringify(
                            updatedCollection,
                            null,
                            "  "
                        )}. \n\n Response was: ${response.status} ${
                            response.statusText
                        } ${await response.text()}`
                    );
                } else {
                    console.log(
                        `Written updated collection with name: ${
                            updatedCollection.displayName
                        }, id: ${
                            updatedCollection.id
                        } payload ${new Intl.NumberFormat().format(bodySize)} bytes`
                    );
                }
            }

            console.log("Script complete.");

            if (hasError) {
                console.warn(
                    `There were errors writing the updated collections to the issue.`
                );
            }

            console.log(`Updated ${updatedCollections.length} collections`);

            if (updatedCollections.length < curation.length) {
                console.warn(
                    `${
                        curation.length - updatedCollections.length
                    } collections were not mapped onto the front. Do the collection names match exactly? \n\n ${skippedCollections.join(
                        "\n"
                    )}`
                );
            }
        } else {
            console.error(`No Front is available in Fronts tool so unable to migrate: ${frontsIssueId.length}`);
        }
    }
    }
    console.log(" Ending the loop iteration for date = " + date)
}

process.exit(hasError ? 1 : 0);






