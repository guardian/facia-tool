import { createType, build } from 'normalise-with-fields';
import v4 from 'uuid/v4';
import { postProcessCard, supportingArticles } from 'util/schema';
import { Card } from 'types/Collection';

const cards = createType('cards', {
	preProcess: (af: Card) => ({
		...af,
		uuid: v4(),
	}),
	postProcess: postProcessCard,
	idKey: 'uuid',
});

export const { normalize, denormalize } = build({
	articles: cards({
		'meta.supporting': supportingArticles(),
	}),
});
