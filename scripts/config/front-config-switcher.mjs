import {
	GetObjectCommand,
	PutObjectCommand,
	S3Client,
} from '@aws-sdk/client-s3';
import { fromIni } from '@aws-sdk/credential-providers';
import { readFile, writeFile } from 'node:fs/promises';
import { Readable } from 'node:stream';

const getArg = (flag, optional = false) => {
    const argIdx = process.argv.indexOf(flag);
    const arg = argIdx !== -1 ? process.argv[argIdx + 1] : "";

    if (!arg && !optional) {
        console.error(`No argument for ${flag} given.`);
        process.exit(2);
    }

    return arg;
};


const activeFront = getArg('--active-front');
const hiddenFront = getArg('--hidden-front');
const stage = getArg('--stage');
const objectPath = getArg('--object-path');
const profile = getArg('--profile');


const CONFIG = {
	s3: {
		region: 'eu-west-1',
		bucketName: 'facia-tool-store',
	},
	files: {
		localConfig: './config.local.json',
		outputConfig: './config.json',
	},
};

export async function readJsonFile(path) {
	try {
		const content = await readFile(path, 'utf-8');
		return JSON.parse(content);
	} catch (error) {
		throw new Error(
			`Failed to read JSON file at ${path}: ${error.message}`,
		);
	}
}

export async function writeJsonFile(path, data) {
	try {
		await writeFile(path, JSON.stringify(data, null, 2));
	} catch (error) {
		throw new Error(
			`Failed to write JSON file to ${path}: ${error.message}`,
		);
	}
}

export const createS3Client = (region, profile) => {
	return new S3Client({
		region,
		credentials: fromIni({ profile }),
	});
};

export async function streamToString(stream) {
	const chunks = [];
	for await (const chunk of stream) {
		chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
	}
	return Buffer.concat(chunks).toString('utf-8');
}

export async function fetchFromS3(client, bucket, key) {
	try {
		const command = new GetObjectCommand({ Bucket: bucket, Key: key });
		const { Body } = await client.send(command);

		if (!(Body instanceof Readable)) {
			throw new Error('Unexpected response body format');
		}

		return streamToString(Body);
	} catch (error) {
		throw new Error(`Failed to fetch from S3: ${error.message}`);
	}
}

export async function uploadToS3(client, bucket, key, data) {
	try {
		const command = new PutObjectCommand({
			Bucket: bucket,
			Key: key,
			Body: data,
			ContentType: 'application/json',
		});
		await client.send(command);
	} catch (error) {
		throw new Error(`Failed to upload to S3: ${error.message}`);
	}
}

async function fetchAndSaveConfig() {
	try {
		const s3Client = createS3Client(CONFIG.s3.region, profile);

		const configJson = await fetchFromS3(
			s3Client,
			CONFIG.s3.bucketName,
			`${stage}${objectPath}`,
		);

		const parsedConfig = JSON.parse(configJson);
		await writeJsonFile(CONFIG.files.localConfig, parsedConfig);
		console.log(`✅ Saved JSON to ${CONFIG.files.localConfig}`);
	} catch (error) {
		throw new Error(`Failed to fetch and save config: ${error.message}`);
	}
}

export function swapFronts(fronts) {
	if (!fronts) {
		throw new Error('No fronts found in config');
	}
	if (!fronts[activeFront]) {
		throw new Error(`Missing '${activeFront}' in config`);
	}
	if (!fronts[hiddenFront]) {
		throw new Error(`Missing '${hiddenFront}' in config`);
	}

	const result = { ...fronts };

	result[activeFront] = { ...fronts[hiddenFront] };
	result[hiddenFront] = { ...fronts[activeFront] };

	delete result[activeFront].isHidden;
	result[hiddenFront].isHidden = true;

	return result;
}

async function processConfig() {
	try {
		const config = await readJsonFile(CONFIG.files.localConfig);
		const swappedFronts = swapFronts(config.fronts);
		const finalConfig = {
			fronts: swappedFronts,
			collections: config.collections,
		};

		await writeJsonFile(CONFIG.files.outputConfig, finalConfig);
		console.log(`✅ Saved modified config to ${CONFIG.files.outputConfig}`);

		return finalConfig;
	} catch (error) {
		throw new Error(`Failed to process config: ${error.message}`);
	}
}

async function uploadConfig(config) {
	try {
		const s3Client = createS3Client(CONFIG.s3.region, profile);
		const configJson = JSON.stringify(config, null, 2);

		await uploadToS3(
			s3Client,
			CONFIG.s3.bucketName,
			`${stage}${objectPath}`,
			configJson,
		);

		console.log(
			`✅ Uploaded modified config to S3: ${CONFIG.s3.bucketName}/${objectPath}`,
		);
	} catch (error) {
		throw new Error(`Failed to upload config: ${error.message}`);
	}
}

async function main() {
	try {
		await fetchAndSaveConfig();
		const modifiedConfig = await processConfig();
		await uploadConfig(modifiedConfig);

		console.log(
			'✅ Complete! Config was successfully processed and uploaded.',
		);
	} catch (error) {
		console.error(`❌ Error: ${error.message}`);
		process.exit(1);
	}
}

main();
