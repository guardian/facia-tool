import React from 'react';
import { Card, CardSizes } from '../../../types/Collection';
import { useDispatch, useSelector } from 'react-redux';
import { selectCard } from '../../../selectors/shared';
import { State } from '../../../types/State';
import CardContainer from '../CardContainer';
import CardBody from '../CardBody';
import CardMetaHeading from '../CardMetaHeading';
import CardMetaContainer from '../CardMetaContainer';
import CardContent from '../CardContent';
import CardHeadingContainer from '../CardHeadingContainer';
import CardHeading from '../CardHeading';
import { HoverActionsAreaOverlay } from '../../CollectionHoverItems';
import { HoverActionsButtonWrapper } from '../../inputs/HoverActionButtonWrapper';
import {
	HoverAddToClipboardButton,
	HoverDeleteButton,
} from '../../inputs/HoverActionButtons';
import { PaletteItem } from 'components/form/PaletteForm';
import { CardPaletteContainer } from '../CardPaletteContainer';
import { HeadlineContentButton } from '../../CollectionDisplay';
import { feastCollectionToFrontCollection } from '../../../actions/Editions';

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
	children?: React.ReactNode;
	isUneditable?: boolean;
	showMeta?: boolean;
}

export const FeastCollectionCard = ({
	id,
	fade,
	size = 'default',
	textSize = 'default',
	onDelete,
	onAddToClipboard,
	children,
	isUneditable,
	collectionId,
	frontId,
	showMeta = true,
	...rest
}: Props) => {
	const dispatch = useDispatch();
	const card = useSelector<State, Card>((state) => selectCard(state, id));

	const collectionToContainer: React.MouseEventHandler = (evt) => {
		evt.preventDefault();
		evt.stopPropagation();

		if (collectionId) {
			dispatch<any>(
				feastCollectionToFrontCollection(frontId, collectionId, card.id),
			);
		} else {
			console.error(
				"Can't convert a collection into a container unless said collection is already in a container :(",
			);
		}
	};

	return (
		<>
			<CardContainer {...rest}>
				<CardBody data-testid="snap" size={size} fade={fade}>
					{showMeta && (
						<CardMetaContainer size={size}>
							<CardMetaHeading>Feast collection</CardMetaHeading>
						</CardMetaContainer>
					)}
					<CardContent textSize={textSize}>
						<CardHeadingContainer size={size}>
							<div style={{ display: 'flex', justifyContent: 'space-between' }}>
								<div
									style={{
										flex: 0,
										width: 'fit-content',
										minWidth: 'fit-content',
									}}
								>
									<CardHeading data-testid="headline" html>
										{card.meta.title ? card.meta.title : 'No title'}
									</CardHeading>
								</div>
								{collectionId ? (
									<div
										style={{
											flex: 0,
											width: 'fit-content',
											minWidth: 'fit-content',
										}}
									>
										<HeadlineContentButton onClick={collectionToContainer}>
											Convert to Container
										</HeadlineContentButton>
									</div>
								) : undefined}
							</div>
						</CardHeadingContainer>
					</CardContent>
					{card.meta.feastCollectionTheme && (
						<CardPaletteContainer>
							{card.meta.feastCollectionTheme.lightPalette && (
								<PaletteItem
									size="s"
									palette={card.meta.feastCollectionTheme.lightPalette}
									imageURL={card.meta.feastCollectionTheme.imageURL}
								/>
							)}
							{card.meta.feastCollectionTheme?.darkPalette && (
								<PaletteItem
									size="s"
									palette={card.meta.feastCollectionTheme.darkPalette}
									imageURL={card.meta.feastCollectionTheme.imageURL}
								/>
							)}
						</CardPaletteContainer>
					)}
					<HoverActionsAreaOverlay data-testid="hover-overlay">
						<HoverActionsButtonWrapper
							toolTipPosition={'top'}
							toolTipAlign={'right'}
							renderButtons={(props) => (
								<>
									<HoverAddToClipboardButton
										hoverText="Clipboard"
										onAddToClipboard={onAddToClipboard}
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
			{children}
		</>
	);
};
