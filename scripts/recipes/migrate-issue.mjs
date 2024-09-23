async function visualDelay(time) {
    return new Promise((resolve)=>setTimeout(resolve, time));
}

async function fetchFrontFromIssue (frontsIssueUrl, frontsIssueId, frontsHeaders, frontName){
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
        throw new Error(`No front found with name ${frontName} in issue ${frontsIssueId}`)
    }

    return front;
}

async function migrateFront(
    frontsIssueId,
    curationPath,
    curation,
    stage,
    frontName,
    frontsHeaders,
    frontsBaseUrl,
    dryRun
) {
    console.log(`Migrating curation data from ${curationPath} to ${stage} Fronts tool, issue: ${frontsIssueId}, front name: ${frontName}, dry run: ${dryRun}.`);
    await visualDelay(1000);

    const frontsIssueUrl = `${frontsBaseUrl}/editions-api/issues/${frontsIssueId}`;

    console.log(`Got curation data.\nFetching fronts issue data from ${frontsIssueUrl}...`);

    let front = await fetchFrontFromIssue(frontsIssueUrl, frontsIssueId, frontsHeaders, frontName);

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
                `${frontsBaseUrl}/editions-api/fronts/${front.id}/collection?name=${encodeURIComponent(title)}`,
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
        //reload the fronts to ensure we have up-to-date data
        front = await fetchFrontFromIssue(frontsIssueUrl, frontsIssueId, frontsHeaders, frontName);
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
    } else {
        for (const updatedCollection of updatedCollections) {
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
                throw new Error("Error putting new collection");
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
    }
}

async function getCuration(curationBaseUrl, curationPath, curationType, date) {
    //------Get CURATION.JSON --------//
    const curationUrl = `${curationBaseUrl}/${curationPath}/${curationType}/${date}/curation.json`;

    console.log(`Fetching curation data from ${curationUrl} ...`);

    const curationResponse = await fetch(curationUrl);


    if (curationResponse.status === 200) {
        return curationResponse.json();
    } else { //---Dont proceed if Curation.json does not exists for that date---//
        console.error(
            `Error getting issue data from Fronts tool: ${curationResponse.status} ${
                curationResponse.statusText
            } ${await curationResponse.text()}`
        );
        return undefined;
    }
}

export async function migrateIssue(
    curationBaseUrl,
    curationPath,
    date,
    frontsBaseUrl,
    frontsHeaders,
    editionName,
    stage,
    dryRun
) {

    const curation = {
        allRecipes: await getCuration(curationBaseUrl, curationPath, 'all-recipes', date),
        meatFree: await getCuration(curationBaseUrl, curationPath, 'meat-free', date)
    }

    if(!curation.allRecipes && !!curation.meatFree) {
        throw new Error(`Missing all-recipes curation for ${date}`);
    } else if(!curation.meatFree && !!curation.allRecipes) {
        throw new Error(`Missing meat-free curation for ${date}`)
    } else if(!curation.allRecipes && !curation.meatFree) {
        throw new Error(`Missing both meat-free and all-recipes curation for ${date}`);
    }

    //---Proceed to FRONT work if curation.json is present---//
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

    const fetchIssueForTheDate = async (editionName, start, end) => {
        const path = `${frontsBaseUrl}/editions-api/editions/${editionName}/issues?dateFrom=${start}&dateTo=${end}`
        console.log(`start fetching issue ${path} if available...`)
        const resp = await fetch(path, {
            method: 'get',
            mode: 'cors',
            headers: frontsHeaders,
            credentials: 'include',
        });
        console.log("response when fetching issue if available = " + resp.status)
        const content = await resp.json();
        console.log(content);
        return content[0];
    };

    const issueFoundForTheDate = await fetchIssueForTheDate(editionName, date, date);

    let frontsIssueId = ""
    if (issueFoundForTheDate && issueFoundForTheDate.id) { //Skip rest of work of data migration if issue exists on the date
        console.log(`Yes we already have existing issue ${issueFoundForTheDate.id}`)
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
                body: JSON.stringify({ issueDate: `${date}` }),
            }).then((response) => {
                console.log("response = " + response.status)
                return response.json();
            });
            return resp
        }
        const frontsIssue = await createIssue(editionName, date);
        frontsIssueId = frontsIssue.id;
    }


        if(!frontsIssueId) {
            console.error(`No Front is available in Fronts tool so unable to migrate: ${editionName} ${date}`);
        } else {
            console.log(`Issue is created: ${frontsIssueId}`);
            for(const frontName of ['All Recipes', 'Meat-Free']) {
                try {
                    await migrateFront(
                        frontsIssueId,
                        curationPath,
                        frontName === 'All Recipes' ? curation.allRecipes : curation.meatFree,
                        stage,
                        frontName,
                        frontsHeaders,
                        frontsBaseUrl,
                        dryRun
                    );
                } catch(err) {
                    console.error(`Unable to migrate from ${frontName} for ${editionName} ${date}: ${err}`);
                    await visualDelay(5000);
                }
            }
        }

}
