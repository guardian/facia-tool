import React from 'react';
import { connect } from 'react-redux';
import type { State } from 'types/State';
import FlatUl from 'components/layout/FlatUl';
import {
	AbTestHeadlineError,
	createSelectActiveAbTestHeadlineErrorsForCollection,
} from 'selectors/collection';
import { createCardId } from '../../card/Card';
import styled from 'styled-components';

interface ContainerProps {
	collectionId: string;
}

interface ComponentProps extends ContainerProps {
	abTestHeadlineErrors: AbTestHeadlineError[];
}

const ErrorLi = styled.li`
	& + & {
		margin-top: 10px;
	}
`;

const errorMessage = (error: AbTestHeadlineError['error']): string =>
	error === 'duplicate'
		? 'headline variants A and B are the same'
		: 'headline variants A and B must both be set';

const AbTestHeadlineWarning = ({ abTestHeadlineErrors }: ComponentProps) => (
	<div>
		<strong>
			This collection cannot be launched because of an incomplete active
			headline test:
		</strong>
		<FlatUl>
			{abTestHeadlineErrors.map(({ cardId, title, error }) => (
				<ErrorLi key={cardId}>
					<a
						href={`#${cardId}`}
						onClick={() => {
							const id = createCardId(cardId);
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
					{`: ${errorMessage(error)}`}
				</ErrorLi>
			))}
		</FlatUl>
	</div>
);

const mapStateToProps = () => {
	const selectActiveAbTestHeadlineErrorsForCollection =
		createSelectActiveAbTestHeadlineErrorsForCollection();
	return (state: State, { collectionId }: ContainerProps) => ({
		abTestHeadlineErrors: selectActiveAbTestHeadlineErrorsForCollection(state, {
			collectionId,
		}),
	});
};

export default connect(mapStateToProps)(AbTestHeadlineWarning);
