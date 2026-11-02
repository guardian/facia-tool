import React from 'react';
import { useSelector } from 'react-redux';
import { Card, CardSizes } from 'types/Collection';
import { State } from 'types/State';
import { selectCard } from 'selectors/shared';
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
	HoverViewButton,
} from 'components/inputs/HoverActionButtons';

interface Props {
	onDragStart?: (d: React.DragEvent<HTMLElement>) => void;
	onDrop?: (d: React.DragEvent<HTMLElement>) => void;
	onDelete: () => void;
	onAddToClipboard: () => void;
	onClick?: () => void;
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

/**
 * Display-only alternative to the snap link card for interactive atom snaps.
 * The underlying card is still a plain snap -- see `createSelectCardType`.
 */
export const InteractiveAtomCard = ({
	id,
	fade,
	size = 'default',
	textSize = 'default',
	onDelete,
	onAddToClipboard,
	showMeta = true,
	// Part of the common card interface, but unused here: kept out of the spread.
	collectionId,
	frontId,
	isUneditable,
	...rest
}: Props) => {
	const card = useSelector<State, Card>((state) => selectCard(state, id));
	const { headline, atomId, snapUri } = card.meta ?? {};
	const atomUrl = atomId ? `https://www.theguardian.com/${atomId}` : snapUri;

	return (
		<CardContainer {...rest}>
			<CardBody data-testid="interactive-atom" size={size} fade={fade}>
				{showMeta && (
					<CardMetaContainer size={size}>
						<CardMetaHeading>Interactive atom</CardMetaHeading>
					</CardMetaContainer>
				)}
				<CardContent textSize={textSize}>
					<CardHeadingContainer size={size}>
						<CardHeading data-testid="headline">
							{headline ?? atomId ?? 'Unknown interactive atom'}
						</CardHeading>
					</CardHeadingContainer>
				</CardContent>
				<HoverActionsAreaOverlay data-testid="hover-overlay">
					<HoverActionsButtonWrapper
						toolTipPosition={'top'}
						toolTipAlign={'right'}
						urlPath={atomUrl}
						renderButtons={(props) => (
							<>
								{atomUrl && (
									<HoverViewButton hoverText="View" href={atomUrl} {...props} />
								)}
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
