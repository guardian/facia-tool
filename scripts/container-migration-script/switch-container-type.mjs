import {writeFile} from "fs/promises";


const usage = `Example usage is

node ./switch-container-type
    --stage CODE
Note that you must specify --dry-run=false in order to populate the collections with content

Cookie Setup (Required):

  This script expects the stage cookie to be provided via an environment variable,
  NOT as a CLI argument.

  The cookie must be available as:

    process.env.{STAGE}_FRONTS_COOKIE

How to set the cookie:

  macOS / Linux (bash/zsh):

  export {STAGE}_FRONTS_COOKIE="<paste full cookie header value here>"

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

const getFrontsCookie = () => {
	const cookie = process.env[`${stage}_FRONTS_COOKIE`];
	if (!cookie) {
		console.error(`Cookie is missing in ${stage}. Ensure this is stored as an environment variable`);
		process.exit(1);
	}
	return cookie;
}

const stage = getArg("--stage");

const frontsBaseUrl = getFrontsUri();
const frontsCookie = getFrontsCookie();
const frontsHeaders = {
	"Content-Type": "application/json",
	Cookie: frontsCookie,
};

const frontsConfigUrl = `${frontsBaseUrl}/config`;

const frontsCollectionUrl= `${frontsBaseUrl}/config/collections/`

if (stage === "PROD") {
	console.warn(
		`This will run in the PROD environment in 5 seconds - Ctrl-C to cancel.`
	);
	await new Promise((r) => setTimeout(r, 5000));
}

console.log(`Fetching collection config data from Fronts tool ${stage} at ${frontsBaseUrl} ...`);



function findFrontsByCollectionId(fronts, collectionId) {
	if (!fronts || !collectionId) return [];

	return Object.entries(fronts)
		.filter(([frontName, frontConfig]) =>
			Array.isArray(frontConfig.collections) &&
			frontConfig.collections.includes(collectionId)
		)
		.map(([frontName, frontConfig]) => frontName);
}



const swapCollectionType = (fronts, collections) => {
	return Object.fromEntries(
		Object.entries(collections).map(async ([id, collection]) => {
			if (collection.type === "fixed/small/slow-IV") {
				console.log("*** ",collection.type, collection.displayName, 'updated');
				return [id,   {
					...collection,
					type: "static/medium/four",
				}];
			}

			if (collection.type === "dynamic/fast") {
				console.log("*** ",collection.id, collection.type, collection.displayName, 'updated');

				const updatedBody =  [ {
					...collection,
					"type": "flexible/general",
					"groupsConfig": [
						{"name": "standard",
							"maxItems": 20},
						{"name": "big",
							"maxItems": 0},
						{"name": "very big",
							"maxItems": 0},
						{"name": "splash",
							"maxItems": 1}
					],
				}];


				const frontIds = findFrontsByCollectionId(fronts,id)
				console.log("updatedBody", updatedBody, "frontIds", frontIds)
				// const frontsResponse = await fetch(frontsConfigUrl, {
				// 	method: "POST",
				// 	headers: frontsHeaders,
				// 	body: updatedBody
				// });
			}
			return [id, collection]
		})
	);
}


const fetchFrontsConfig= async () => {
	const frontsResponse = await fetch(frontsConfigUrl, {
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
	const configJson = await frontsResponse.json();
	console.log("Got Fronts data.");
	const {fronts, collections} = configJson;

	const swappedCollections = swapCollectionType(fronts, collections)

	const finalConfig = {
		fronts,
		collections: swappedCollections,
	};

	console.log(`Original collection count: ${Object.keys(collections).length}`);
	console.log(`Final collection count: ${Object.keys(swappedCollections).length}`);

	await writeFile(
		"config.json",
		JSON.stringify(finalConfig, null, 2),
		"utf-8"
	);

	return ;
};



await fetchFrontsConfig();
process.exit(0);


