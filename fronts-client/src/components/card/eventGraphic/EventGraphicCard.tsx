import React from 'react';
import { useSelector } from 'react-redux';
import { Card, CardSizes } from 'types/Collection';
import { State } from 'types/State';
import { selectCard } from 'selectors/shared';
import { getEventGraphicTitle } from 'constants/eventGraphics';
import CardContainer from '../CardContainer';
import CardBody from '../CardBody';
import CardContent from '../CardContent';
import CardHeading from '../CardHeading';
import CardHeadingContainer from '../CardHeadingContainer';
import CardMetaContainer from '../CardMetaContainer';
import CardMetaHeading from '../CardMetaHeading';
import { HoverActionsAreaOverlay } from 'components/CollectionHoverItems';
import { HoverActionsButtonWrapper } from 'components/inputs/HoverActionButtonWrapper';
import {
	HoverAddToClipboardButton,
	HoverDeleteButton,
} from 'components/inputs/HoverActionButtons';

interface Props {
	onDragStart?: (d: React.DragEvent<HTMLElement>) => void;
	onDrop?: (d: React.DragEvent<HTMLElement>) => void;
	onDelete: () => void;
	onAddToClipboard: () => void;
	id: string;
	collectionId?: string;
	frontId: string;
	draggable?: boolean;
	size?: CardSizes;
	textSize?: CardSizes;
	fade?: boolean;
	isUneditable?: boolean;
	showMeta?: boolean;
}

export const EventGraphicCard = ({
	id,
	fade,
	size = 'default',
	textSize = 'default',
	onDelete,
	onAddToClipboard,
	showMeta = true,
	// These are part of the common card interface but aren't needed here, so
	// they're kept out of the props spread onto the container.
	collectionId,
	frontId,
	isUneditable,
	...rest
}: Props) => {
	const card = useSelector<State, Card>((state) => selectCard(state, id));

	return (
		<CardContainer {...rest}>
			<CardBody data-testid="event-graphic" size={size} fade={fade}>
				{showMeta && (
					<CardMetaContainer size={size}>
						<CardMetaHeading>Event graphic</CardMetaHeading>
					</CardMetaContainer>
				)}
				<CardContent textSize={textSize}>
					<CardHeadingContainer size={size}>
						<CardHeading data-testid="headline">
							{getEventGraphicTitle(card.id)}
						</CardHeading>
					</CardHeadingContainer>
				</CardContent>
				<HoverActionsAreaOverlay data-testid="hover-overlay">
					<HoverActionsButtonWrapper
						toolTipPosition={'top'}
						toolTipAlign={'right'}
						urlPath={undefined}
						renderButtons={(props) => (
							<>
								<HoverAddToClipboardButton
									onAddToClipboard={onAddToClipboard}
									hoverText="Clipboard"
									{...props}
								/>
								<HoverDeleteButton
									hoverText="Delete"
									onDelete={onDelete}
									{...props}
								/>
							</>
						)}
					/>
				</HoverActionsAreaOverlay>
			</CardBody>
		</CardContainer>
	);
};
