import type { Card, CardMeta } from 'types/Collection';
import type { CAPIInteractiveAtomResponse } from 'services/capiQuery';
import { getAbsolutePath, isGuardianUrl, isValidSnapLinkUrl } from './url';
import fetchOpenGraphData from './openGraph';
import v4 from 'uuid/v4';
import set from 'lodash/fp/set';
import { PartialBy } from 'types/Util';

function generateId() {
	return 'snap/' + new Date().getTime();
}
function validateId(id: string) {
	return (
		([] as Array<string | null>).concat(
			getAbsolutePath(id || '').match(/^snap\/\d+$/),
		)[0] || undefined
	);
}

function convertToSnap({ id, ...rest }: PartialBy<Card, 'id'>): Card {
	const card = {
		id: generateId(),
		...rest,
		meta: rest.meta,
	};

	if (!id) {
		return card;
	}

	const href = isGuardianUrl(id) ? '/' + getAbsolutePath(id, true) : id;
	return set(['meta', 'href'], href, card);
}

async function createPlainSnap(url: string): Promise<Card> {
	if (!isValidSnapLinkUrl(url)) {
		throw new Error(`The URL is not valid. The URL was: ${url}`);
	}
	return createSnap(url);
}

async function createSnap(url?: string, meta?: CardMeta): Promise<Card> {
	const uuid = v4();
	try {
		const { title, description, siteName } =
			meta || !url ? ({} as any) : await fetchOpenGraphData(url);
		return convertToSnap({
			uuid,
			id: url,
			frontPublicationDate: Date.now(),
			meta: {
				headline: title,
				trailText: description,
				byline: siteName,
				showByline: siteName ? true : false,
				snapType: 'link',
				...meta,
			},
		});
	} catch (e) {
		return convertToSnap({
			uuid,
			id: url,
			frontPublicationDate: Date.now(),
			meta: {
				headline: 'Invalid page',
				snapType: 'link',
			},
		});
	}
}

async function createAtomSnap(
	url: string,
	atom: CAPIInteractiveAtomResponse,
	meta?: CardMeta,
): Promise<Card> {
	const { title } = atom.response.interactive.data.interactive;
	const atomId = new URL(url).pathname.substr(1);

	return convertToSnap({
		uuid: v4(),
		id: url,
		frontPublicationDate: Date.now(),
		meta: {
			headline: title,
			byline: 'Guardian Visuals',
			showByline: false,
			snapType: 'interactive',
			snapUri: url,
			atomId,
			...meta,
		},
	});
}

function createLatestSnap(url: string, kicker: string) {
	return convertToSnap({
		id: url,
		uuid: v4(),
		frontPublicationDate: Date.now(),
		meta: {
			snapType: 'latest',
			snapUri: getAbsolutePath(url),
			showKickerCustom: true,
			customKicker: kicker,
		},
	});
}

export {
	generateId,
	validateId,
	createLatestSnap,
	createSnap,
	createAtomSnap,
	createPlainSnap,
};
