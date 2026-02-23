import * as readline from "node:readline";
import { stdin as input, stdout as output } from 'node:process';

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
const frontsConfigUrl = `${frontsBaseUrl}/config`;
const frontsCollectionUrl= `${frontsBaseUrl}/config/collections`

const frontsCookie = getFrontsCookie();
const frontsHeaders = {
	"Content-Type": "application/json",
	Cookie: frontsCookie,
};

const fetchFrontsConfig = async () => {
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
	return await frontsResponse.json()
};


const findFrontsByCollectionId = (fronts, collectionId) => {
	if (!fronts || !collectionId) return [];

	return Object.entries(fronts)
		.filter(([_, frontConfig]) =>
			Array.isArray(frontConfig.collections) &&
			frontConfig.collections.includes(collectionId)
		)
		.map(([frontName, _]) => frontName);
}


const postUpdateToCollection = async(collectionId, body) => {
	const updatedResponse = await fetch(`${frontsCollectionUrl}/${collectionId}`, {
		method: "POST",
		headers: frontsHeaders,
		body: JSON.stringify(body)
	});

	if(updatedResponse.status !== 200) {
		const content = await updatedResponse.text();
		console.error(`Server error ${updatedResponse.status}: ${content}`);
		throw new Error(`Unable to update collection ${collectionId}`)
	}
	console.log("*** Successfully updated ", body.collection.type, body.collection.displayName);
}


const FLEXIBLE_GENERAL_GROUPS_CONFIG = [
	{"name": "standard",
		"maxItems": 20},
	{"name": "big",
		"maxItems": 0},
	{"name": "very big",
		"maxItems": 0},
	{"name": "splash",
		"maxItems": 1}
]

const toStaticMedium4 = (collectionId, collection) => ({
	...collection,
	type: "static/medium/4",
	id: collectionId
});



const toFlexibleGeneral = (collectionId, collection) => ({
	...collection,
	type: "flexible/general",
	groupsConfig: FLEXIBLE_GENERAL_GROUPS_CONFIG,
	id: collectionId
});


const identifyUpdates = (collections) => {
	const updates = [];
	const skipped = [];

	for (const [collectionId, collection] of Object.entries(collections)) {
		switch(collection.type) {
			case 'fixed/small/slow-IV':
				 updates.push({
					collectionId,
					updatedCollection: toStaticMedium4(collectionId, collection),
				});
				 break;
			case 'fixed/medium/fast-XII':
			case 'fixed/small/slow-III':
			case 'fixed/small/slow-V-third':
			case 'fixed/small/slow-I':
			case 'fixed/medium/slow-VI':
			case 'fixed/large/slow-XIV':
			case 'fixed/medium/fast-XI':
			case 'fixed/medium/slow-XII-mpu':
			case 'fixed/medium/slow-VII':
			case 'fixed/small/fast-VIII':
			case 'fixed/small/slow-V-mpu':
			case 'fixed/small/slow-V-half':
			case 'dynamic/fast':
			case 'dynamic/slow':
			case 'dynamic/package':
				updates.push({
					collectionId,
					updatedCollection: toFlexibleGeneral(collectionId, collection),
				});
				break;
			default:
				skipped.push(collectionId);
				break;
		}
	}
	console.log("counts", count)
	return { updates, skipped };
};


const executeUpdates = async (updates, fronts) => {
	const results = { succeeded: [], failed: [] };

	for (const { collectionId, updatedCollection } of updates) {
		const frontIds = findFrontsByCollectionId(fronts, collectionId);
		const body = { frontIds, collection: updatedCollection };

		try {
			await postUpdateToCollection(collectionId, body);
			results.succeeded.push(collectionId);
		} catch (err) {
			results.failed.push({ collectionId, error: err.message });
		}
	}

	return results;
};


const orchestrateCollectionUpdates = async() => {
	const {fronts, collections} = await fetchFrontsConfig();

	const {updates, skipped} = identifyUpdates(collections);

	console.log(`Found ${updates.length} collections to update, ${skipped.length} skipped`);


	// const { succeeded, failed } = await executeUpdates(updates, fronts);
//
// console.log(`Succeeded: ${succeeded.length}, Failed: ${failed.length}`);
// if (failed.length) console.error("Failed collections:", failed);
process.exit(0);
}


if (stage === "PROD") {

	const rl = readline.createInterface({ input, output });
	rl.question('This will run in the PROD environment. Proceed? (y/n): ', (answer) => {
		const userAnswer = answer.slice(0).toLowerCase()

		if (userAnswer === "y") {
			console.log(`Environment set to PROD`);
			console.log(`Fetching collection config data from Fronts tool ${stage} at ${frontsBaseUrl} ...`);
			orchestrateCollectionUpdates()
			rl.close();
		}
		else {
			console.log(`Cancelling container migration script...`);
			process.exit(0);
			rl.close();
		}

	});
} else {
	console.log(`Fetching collection config data from Fronts tool ${stage} at ${frontsBaseUrl} ...`);
	orchestrateCollectionUpdates()
}







