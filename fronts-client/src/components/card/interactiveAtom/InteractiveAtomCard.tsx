import React from 'react';
import { Card, CardSizes } from 'types/Collection';
import CardContainer from '../CardContainer';
import CardContent from '../CardContent';
import CardHeadingContainer from '../CardHeadingContainer';
import CardMetaHeading from '../CardMetaHeading';
import CardHeading from '../CardHeading';
import { selectCard } from 'selectors/shared';
import { State } from 'types/State';
import CardBody from '../CardBody';
import CardMetaContainer from '../CardMetaContainer';
import { useSelector } from 'react-redux';
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
	children?: React.ReactNode;
	isUneditable?: boolean;
	showMeta?: boolean;
}

export const InteractiveAtomCard = ({
	id,
	fade,
	size = 'default',
	textSize = 'default',
	onDelete,
	onAddToClipboard,
	showMeta = true,
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
						<CardMetaHeading>Interactive Atom</CardMetaHeading>
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
								<HoverViewButton hoverText="View" href={atomUrl} {...props} />
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
