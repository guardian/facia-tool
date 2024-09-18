import crypto from "crypto";

const usage = `Example usage is

node ./insert-recipe-cards.mjs
    --curation-path "northern/all-recipes"
    --fronts-issue-id "b45d7c3a-497f-4230-8aad-923ce5a8cd2f"
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

const curationPath = getArg("--curation-path");
const frontsIssueId = getArg("--fronts-issue-id");
const frontName = getArg("--front-name");
const stage = getArg("--stage");
const cookie = getArg("--cookie");
const dryRun = getArg("--dry-run", true) !== "false";

const curationBaseUrl = "https://recipes.guardianapis.com";
const curationUrl = `${curationBaseUrl}/${curationPath}/curation.json`;
const frontsBaseUrl = getFrontsUri();
const frontsHeaders = {
    "Content-Type": "application/json",
    Cookie: cookie,
};

console.log(
    `Migrating curation data from ${curationPath} to ${stage} Fronts tool, issue: ${frontsIssueId}, front name: ${frontName}, dry run: ${dryRun}.`
);

if (stage === "PROD") {
    console.warn(
        `This will run in the PROD environment in 5 seconds - Ctrl-C to cancel.`
    );
    await new Promise((r) => setTimeout(r, 5000));
}

console.log(`Fetching curation data from ${curationUrl} ...`);

const curationResponse = await fetch(curationUrl);

if (curationResponse.status !== 200) {
    console.error(
        `Error getting issue data from Fronts tool: ${frontsResponse.status} ${
            frontsResponse.statusText
        } ${await frontsResponse.text()}`
    );
    process.exit(1);
}

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

const frontsIssueUrl = `${frontsBaseUrl}/editions-api/issues/${frontsIssueId}`;

console.log(
    `Got curation data.\nFetching fronts issue data from ${frontsIssueUrl}...`
);

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
                const { id, bio, image, foregroundHex, backgroundHex } =
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
                const { title, image, lightPalette, darkPalette, recipes } =
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
                                          ...(image ? { imageURL: image } : {}),
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

process.exit(hasError ? 1 : 0);
