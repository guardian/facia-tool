import React from 'react';
import { connect } from 'react-redux';
import { createSelectArticleFromCard } from 'selectors/shared';
import type { State } from 'types/State';
import { theme, styled } from '../../../constants/theme';
import documentDragIcon from 'images/icons/document-drag-icon.svg';

interface ContainerProps {
	id: string;
}

interface ComponentProps {
	headline?: string;
}

// These constants can be added to setDragImage to
// position the drag component in a consistent way.
export const dragOffsetX = -5;
export const dragOffsetY = 50;

const DragContainer = styled.div`
	position: relative;
	padding: 0 0 10px 10px;
	width: 330px;
`;

const DragContent = styled.div`
	background: ${theme.colors.yellow};
	position: absolute;
	display: inline-block;
	border-radius: 4px;
	overflow: hidden;
	padding: 8px;
	text-overflow: ellipsis;
	white-space: nowrap;
	font-weight: 600;
	font-size: 12px;
	font: TS3TextSans;
	bottom: 25px;
	left: 25px;
	max-width: 300px;
`;

const DragContentIcon = styled.div`
	position: absolute;
	top: -30px;
	width: 28px;
	height: 28px;
	border-radius: 14px;
	background: ${theme.colors.yellow};
	padding: 6px 8px;

	box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
`;

export const DraggingArticleComponent = ({ headline }: ComponentProps) =>
	headline ? (
		<DragContainer>
			<DragContent>{headline}</DragContent>
			<DragContentIcon>
				<img src={documentDragIcon} />
			</DragContentIcon>
		</DragContainer>
	) : null;

const createMapStateToProps = () => {
	const selectArticle = createSelectArticleFromCard();
	return (state: State, props: ContainerProps): { headline?: string } => {
		const article = selectArticle(state, props.id);
		return { headline: article && article.headline };
	};
};

export default connect(createMapStateToProps)(DraggingArticleComponent);
