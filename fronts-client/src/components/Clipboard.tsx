import { Dispatch } from 'types/Store';
import React, { RefObject } from 'react';
import { connect } from 'react-redux';
import { DragAndDropRoot, Move, PosSpec } from 'lib/dnd';
import type { State } from 'types/State';
import { insertCardFromDropEvent } from 'util/collectionUtils';
import {
	addImageToCard,
	moveCard,
	removeCard as removeCardAction,
	updateCardMetaWithPersist as updateCardMetaAction,
} from 'actions/Cards';
import {
	editorSelectCard,
	editorClearCardSelection,
	selectIsClipboardOpen,
	createSelectCollectionIdsWithOpenForms,
} from 'bundles/frontsUI';
import { clipboardId } from 'constants/fronts';
import { Card as TCard, CardMeta } from 'types/Collection';
import ClipboardLevel from './clipboard/ClipboardLevel';
import CardLevel from './clipboard/CardLevel';
import Card from './card/Card';
import { styled, theme } from 'constants/theme';
import DragIntentContainer from 'components/DragIntentContainer';
import {
	setFocusState,
	resetFocusState,
	selectIsClipboardFocused,
} from 'bundles/focusBundle';
import FocusWrapper from './FocusWrapper';
import { bindActionCreators } from 'redux';
import ButtonRoundedWithLabel, {
	ButtonLabel,
} from 'components/inputs/ButtonRoundedWithLabel';
import { clearClipboardWithPersist } from 'actions/Clipboard';
import { selectClipboardArticles } from 'selectors/clipboardSelectors';
import { ValidationResponse } from '../util/validateImageSrc';

const ClipboardWrapper = styled.div.attrs({
	'data-testid': 'clipboard-wrapper',
})<{
	'data-testid'?: string;
	clipboardHasOpenForms: boolean;
}>`
	width: ${({ clipboardHasOpenForms }) =>
		clipboardHasOpenForms ? theme.front.minWidth : 220}px;
	background: ${theme.collection.background};
	border-top: 1px solid ${theme.colors.greyLightPinkish};
	overflow-y: scroll;
	&:focus {
		border: 1px solid ${theme.base.colors.focusColor};
		border-top: 1px solid ${theme.base.colors.focusColor};
		outline: none;
	}
`;

const ClipboardBody = styled.div`
	padding: 0 10px;
	flex: 1;
	display: flex;
	flex-direction: column;
`;

const StyledDragIntentContainer = styled(DragIntentContainer)`
	display: flex;
	flex-direction: column;
	min-height: 100%;
`;

const ClipboardHeader = styled.div`
	display: flex;
	height: 35px;
	padding-top: 15px;
`;

const ClearClipboardButton = styled(ButtonRoundedWithLabel)`
	margin-left: auto;
`;

interface ClipboardProps {
	selectCard: (id: string, isSupporting?: boolean) => void;
	clearCardSelection: () => void;
	removeCard: (id: string) => void;
	removeSupportingCard: (parentId: string, id: string) => void;
	clearClipboard: () => void;
	handleFocus: () => void;
	handleArticleFocus: (card: TCard) => void;
	handleBlur: () => void;
	dispatch: Dispatch;
	isClipboardOpen: boolean;
	isClipboardFocused: boolean;
	clipboardHasOpenForms: boolean;
	clipboardHasContent: boolean;
	updateCardMeta: (id: string, meta: CardMeta) => void;
	addImageToCard: (uuid: string, imageData: ValidationResponse) => void;
}

// Styled component typings for ref seem to be broken so any refs
// passed to styled components has to be any for now.
type Ref = any;
type TClipboardWrapper = any;

class Clipboard extends React.Component<ClipboardProps> {
	public state = {
		preActive: false,
	};

	private focusClipboardIfInFocus: () => void;
	private clipboardWrapper: RefObject<TClipboardWrapper>;

	constructor(props: ClipboardProps) {
		super(props);

		this.clipboardWrapper = React.createRef<TClipboardWrapper>();

		this.focusClipboardIfInFocus = () => {
			if (this.props.isClipboardFocused && this.clipboardWrapper.current) {
				this.clipboardWrapper.current.focus();
			}
		};
	}

	public componentDidUpdate() {
		this.focusClipboardIfInFocus();
	}

	// TODO: this code is repeated in src/components/FrontsEdit/Front.js
	// refactor

	public handleMove = (move: Move<TCard>) => {
		this.props.dispatch(
			moveCard(move.to, move.data, move.from || null, 'clipboard'),
		);
	};

	public handleInsert = (e: React.DragEvent, to: PosSpec) => {
		this.props.dispatch(insertCardFromDropEvent(e, to, 'clipboard'));
	};

	public render() {
		const {
			isClipboardOpen,
			clipboardHasOpenForms,
			clipboardHasContent,
			selectCard,
			removeCard,
			removeSupportingCard,
			updateCardMeta,
			addImageToCard,
		} = this.props;
		return (
			<React.Fragment>
				{isClipboardOpen && (
					<ClipboardWrapper
						tabIndex={0}
						onFocus={this.handleFocus}
						onBlur={this.handleBlur}
						ref={this.clipboardWrapper as Ref}
						clipboardHasOpenForms={clipboardHasOpenForms}
					>
						<StyledDragIntentContainer
							active={!isClipboardOpen}
							delay={300}
							onDragIntentStart={() => this.setState({ preActive: true })}
							onDragIntentEnd={() => this.setState({ preActive: false })}
						>
							<ClipboardBody>
								<ClipboardHeader>
									<ClearClipboardButton
										disabled={!clipboardHasContent}
										onClick={this.props.clearClipboard}
									>
										<ButtonLabel>Clear clipboard</ButtonLabel>
									</ClearClipboardButton>
								</ClipboardHeader>
								<DragAndDropRoot
									id="clipboard"
									data-testid="clipboard"
									style={{ display: 'flex', flex: 1 }}
								>
									<ClipboardLevel
										onMove={this.handleMove}
										onDrop={this.handleInsert}
									>
										{(card, getAfProps) => (
											<>
												<FocusWrapper
													tabIndex={0}
													onFocus={(e: React.FocusEvent<HTMLDivElement>) =>
														this.handleArticleFocus(e, card)
													}
													area="clipboard"
													onBlur={this.handleBlur}
													uuid={card.uuid}
												>
													<Card
														uuid={card.uuid}
														parentId={clipboardId}
														frontId={clipboardId}
														getNodeProps={getAfProps}
														showMeta={false}
														canDragImage={false}
														canShowPageViewData={false}
														textSize="small"
														onSelect={selectCard}
														onDelete={() => removeCard(card.uuid)}
														updateCardMeta={updateCardMeta}
														addImageToCard={addImageToCard}
													>
														<CardLevel
															cardId={card.uuid}
															onMove={this.handleMove}
															onDrop={this.handleInsert}
														>
															{(supporting, getSProps, i, arr) => (
																<Card
																	uuid={supporting.uuid}
																	frontId={clipboardId}
																	parentId={card.uuid}
																	canShowPageViewData={false}
																	getNodeProps={getSProps}
																	size="small"
																	showMeta={false}
																	onSelect={(id) => selectCard(id, true)}
																	onDelete={() =>
																		removeSupportingCard(
																			card.uuid,
																			supporting.uuid,
																		)
																	}
																	updateCardMeta={updateCardMeta}
																	addImageToCard={addImageToCard}
																/>
															)}
														</CardLevel>
													</Card>
												</FocusWrapper>
											</>
										)}
									</ClipboardLevel>
								</DragAndDropRoot>
							</ClipboardBody>
						</StyledDragIntentContainer>
					</ClipboardWrapper>
				)}
			</React.Fragment>
		);
	}

	private handleFocus = (e: React.FocusEvent<HTMLDivElement>) =>
		this.props.handleFocus();
	private handleBlur = () => this.props.handleBlur();

	private handleArticleFocus = (
		e: React.FocusEvent<HTMLDivElement>,
		card: TCard,
	) => {
		this.props.handleArticleFocus(card);
		e.stopPropagation();
	};
}

const mapStateToProps = () => {
	const selectCollectionIdsWithOpenForms =
		createSelectCollectionIdsWithOpenForms();
	return (state: State) => ({
		isClipboardOpen: selectIsClipboardOpen(state),
		isClipboardFocused: selectIsClipboardFocused(state),
		clipboardHasContent: !!selectClipboardArticles(state).length,
		clipboardHasOpenForms: !!selectCollectionIdsWithOpenForms(state, {
			frontId: clipboardId,
		}).length,
	});
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
	clearCardSelection: () => dispatch(editorClearCardSelection(clipboardId)),
	removeCard: (uuid: string) => {
		dispatch(removeCardAction('clipboard', 'clipboard', uuid, 'clipboard'));
	},
	removeSupportingCard: (parentId: string, uuid: string) => {
		dispatch(removeCardAction('card', parentId, uuid, 'clipboard'));
	},
	clearClipboard: () => {
		dispatch(clearClipboardWithPersist(clipboardId));
	},
	handleFocus: () =>
		dispatch(
			setFocusState({
				type: 'clipboard',
			}),
		),
	handleArticleFocus: (card: TCard) => {
		dispatch(
			setFocusState({
				type: 'clipboardArticle',
				card,
			}),
		);
	},
	...bindActionCreators(
		{
			selectCard: editorSelectCard,
			updateCardMeta: updateCardMetaAction('clipboard'),
			handleBlur: resetFocusState,
			addImageToCard: addImageToCard('clipboard'),
		},
		dispatch,
	),
	dispatch,
});

type TStateProps = ReturnType<ReturnType<typeof mapStateToProps>>;
type TDispatchProps = ReturnType<typeof mapDispatchToProps>;

const mergeProps = (
	stateProps: TStateProps,
	dispatchProps: TDispatchProps,
) => ({
	...stateProps,
	...dispatchProps,
	selectCard: (articleId: string, isSupporting = false) =>
		dispatchProps.selectCard(
			articleId,
			clipboardId, // clipboardId is passed twice here as both the collection ID...
			clipboardId, // and the front ID
			isSupporting,
		),
});

export default connect(
	mapStateToProps,
	mapDispatchToProps,
	mergeProps,
)(Clipboard);
