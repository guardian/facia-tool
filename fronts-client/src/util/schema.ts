import { createType, build, createFieldType } from 'normalise-with-fields';
import v4 from 'uuid/v4';
import { Card } from 'types/Collection';

const preProcessCard = (card: Card): object => ({
	...card,
	// guard against missing meta from the server
	meta: card.meta ?? {},
	uuid: card.uuid ?? v4(),
});

const postProcessCard = (card: Card): object => {
	const { uuid, ...af } = card;

	let meta = { ...af.meta };

	// if we have no supporting when denormalizing then remove that from the meta
	if (!(meta.supporting || []).length) {
		const { supporting, ...rest } = meta;
		meta = rest;
	}

	// if our group is 0 or falsey when denormalizing then remove that form the meta
	if (!meta.group || meta.group === '0') {
		const { group, ...rest } = meta;
		meta = rest;
	}

	return {
		...af,
		meta,
	};
};

const cards = createType('cards', {
	preProcess: preProcessCard,
	postProcess: postProcessCard,
	idKey: 'uuid',
	field: createFieldType('groups', {
		key: 'meta.group',
		valueKey: 'id',
		uuid: v4,
	}),
});
const supportingArticles = createType('cards', {
	preProcess: preProcessCard,
	postProcess: postProcessCard,
	idKey: 'uuid',
});

export const { normalize, denormalize } = build({
	live: cards({
		'meta.supporting': supportingArticles(),
	}),
	previously: cards({
		'meta.supporting': supportingArticles(),
	}),
	draft: cards({
		'meta.supporting': supportingArticles(),
	}),
});

export { postProcessCard, supportingArticles };
