import React from 'react';
import { connect } from 'react-redux';
import type { State } from 'types/State';
import FlatUl from 'components/layout/FlatUl';
import { createSelectOpenCardTitlesForCollection } from 'bundles/frontsUI';
import { createCardId } from '../../card/Card';
import styled from 'styled-components';

interface ContainerProps {
	collectionId: string;
	frontId: string;
}

interface ComponentProps extends ContainerProps {
	openArticleTitles: Array<{ uuid: string; title?: string }>;
}

const OpenArticleLi = styled.li`
	& + & {
		margin-top: 10px;
	}
`;

const OpenFormsWarning = ({ openArticleTitles }: ComponentProps) => (
	<div>
		<strong>There are open forms in this collection:</strong>
		<FlatUl>
			{openArticleTitles.map(({ uuid, title }) => (
				<OpenArticleLi key={title}>
					<a
						href={`#${uuid}`}
						onClick={() => {
							const id = createCardId(uuid);
							const element = document.getElementById(id);
							if (element) {
								element.scrollIntoView({
									behavior: 'smooth',
									inline: 'start',
									block: 'end',
								});
							}
						}}
					>
						{title || 'No title'}
					</a>
				</OpenArticleLi>
			))}
		</FlatUl>
	</div>
);

const mapStateToProps = () => {
	const selectOpenCardTitlesForCollection =
		createSelectOpenCardTitlesForCollection();
	return (state: State, { collectionId, frontId }: ContainerProps) => ({
		openArticleTitles: selectOpenCardTitlesForCollection(state, {
			collectionId,
			frontId,
		}),
	});
};

export default connect(mapStateToProps)(OpenFormsWarning);
