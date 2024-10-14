import React from 'react';
import { DragIcon } from 'components/icons/Icons';
import { styled, theme } from 'constants/theme';
import RenderOffscreen from 'components/util/RenderOffscreen';

const DragToAddSnapContainer = styled.div`
	border-top: 1px solid ${theme.card.border};
	background-color: ${theme.colors.whiteMedium};
	font-size: 12px;
	font-weight: bold;
	line-height: 18px;
	padding: 0 5px;
	cursor: pointer;

	&:hover {
		background-color: ${theme.colors.whiteDark};
	}
	> a {
		text-decoration: none;
		&:hover {
			text-decoration: none;
		}
	}
`;

interface Props {
	onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
	testId?: string;
	dragImage: React.ReactNode;
	dragImageRef: React.Ref<HTMLDivElement>;
}

export const DragToAdd: React.FC<Props> = ({
	onDragStart,
	testId,
	dragImage,
	dragImageRef,
	children,
}) => {
	return (
		<>
			<RenderOffscreen ref={dragImageRef}>{dragImage}</RenderOffscreen>
			<DragToAddSnapContainer
				data-testid={testId}
				onDragStart={onDragStart}
				draggable={true}
			>
				<DragIcon />
				{children}
			</DragToAddSnapContainer>
		</>
	);
};
