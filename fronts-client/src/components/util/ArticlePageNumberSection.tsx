import CardMetaContent from '../card/CardMetaContent';
import { CapiArticle } from 'types/Capi';
import * as React from 'react';

interface ComponentProps {
	article?: CapiArticle;
}

const articlePageNumberSection = ({ article }: ComponentProps) => {
	if (article && article.fields && article.fields.newspaperPageNumber) {
		return (
			<CardMetaContent title="The newspaper page number of this article">
				Page {article.fields.newspaperPageNumber}
			</CardMetaContent>
		);
	} else {
		return null;
	}
};

export default articlePageNumberSection;
