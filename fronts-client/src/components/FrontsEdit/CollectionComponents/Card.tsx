import { Dispatch } from 'types/Store';
import React from 'react';
import { connect } from 'react-redux';
import Article from 'components/article/Article';
import type { State } from 'types/State';
import { createSelectCardType } from 'selectors/cardSelectors';
import {
  selectExternalArticleFromCard,
  selectSupportingArticleCount,
} from 'selectors/shared';
import cardTypes from 'constants/cardTypes';
import { CardTypes, CardSizes, CardMeta } from 'types/Collection';
import SnapLink from 'components/snapLink/SnapLink';
import {
  copyCardImageMetaWithPersist,
  addImageToCard,
  addCardToClipboard,
} from 'actions/Cards';
import {
  dragEventHasImageData,
  validateImageEvent,
  ValidationResponse,
} from 'util/validateImageSrc';
import {
  cardImageCriteria,
  editionsCardImageCriteria,
  DRAG_DATA_CARD_IMAGE_OVERRIDE,
} from 'constants/image';
import Sublinks from './Sublinks';
import {
  selectIsCardFormOpen,
  editorClearCardSelection,
} from 'bundles/frontsUI';
import { bindActionCreators } from 'redux';
import CardFormInline from '../CardFormInline';
import { updateCardMetaWithPersist as updateCardMetaAction } from 'actions/Cards';
import { EditMode } from 'types/EditMode';
import { selectEditMode } from 'selectors/pathSelectors';
import EditModeVisibility from 'components/util/EditModeVisibility';
import { css, styled } from 'constants/theme';
import { getPillarColor } from 'util/getPillarColor';
import { isLive as isArticleLive } from 'util/CAPIUtils';
import { DefaultDropIndicator } from 'components/DropZone';
import DragIntentContainer from 'components/DragIntentContainer';

export const createCardId = (id: string) => `collection-item-${id}`;

const CardContainer = styled('div')<{
  pillarId: string | undefined;
  isLive?: boolean;
  size?: CardSizes;
}>`
  border-top-width: 1px;
  border-top-style: solid;
  border-top-color: ${({ size, pillarId, isLive, theme }) =>
    size !== 'small' && pillarId && isLive
      ? getPillarColor(pillarId, isLive)
      : theme.base.colors.borderColor};
`;

const DropzoneStyling = styled.div<{
  isDraggingCardOver?: boolean;
}>`
  ${({ isDraggingCardOver }) =>
    isDraggingCardOver &&
    css`
      ${DefaultDropIndicator} {
        opacity: 1;
      }
    `}
`;

interface ContainerProps {
  uuid: string;
  frontId: string;
  collectionId?: string;
  children?: React.ReactNode;
  getNodeProps: () => object;
  onSelect: (uuid: string) => void;
  onDelete: () => void;
  parentId: string;
  size?: CardSizes;
  textSize?: CardSizes;
  isUneditable?: boolean;
  showMeta?: boolean;
  isSupporting?: boolean;
  canDragImage?: boolean;
  canShowPageViewData: boolean;
}

type CardContainerProps = ContainerProps & {
  onAddToClipboard: (uuid: string) => void;
  copyCardImageMeta: (from: string, to: string) => void;
  addImageToCard: (id: string, response: ValidationResponse) => void;
  updateCardMeta: (id: string, meta: CardMeta) => void;
  clearCardSelection: (id: string) => void;
  type: CardTypes;
  isSelected: boolean;
  numSupportingArticles: number;
  editMode: EditMode;
  isLive?: boolean;
  pillarId?: string;
};

class Card extends React.Component<CardContainerProps> {
  public state = {
    showCardSublinks: false,
    isDraggingCardOver: false,
  };

  public toggleShowArticleSublinks = (e?: React.MouseEvent) => {
    const togPos = this.state.showCardSublinks ? false : true;
    this.setState({ showCardSublinks: togPos });
    if (e) {
      e.stopPropagation();
    }
  };

  public render() {
    const {
      uuid,
      isSelected,
      isSupporting = false,
      children,
      getNodeProps,
      onSelect,
      type,
      size,
      textSize,
      isUneditable,
      numSupportingArticles,
      updateCardMeta,
      clearCardSelection,
      parentId,
      showMeta,
      frontId,
      collectionId,
      canDragImage,
      canShowPageViewData = false,
      isLive,
      pillarId,
    } = this.props;

    const getSublinks = (
      <Sublinks
        numSupportingArticles={numSupportingArticles}
        toggleShowArticleSublinks={this.toggleShowArticleSublinks}
        showArticleSublinks={this.state.showCardSublinks}
        parentId={parentId}
      />
    );

    const getCard = () => {
      switch (type) {
        case cardTypes.ARTICLE:
          return (
            <Article
              frontId={frontId}
              collectionId={collectionId}
              id={uuid}
              isUneditable={isUneditable}
              {...getNodeProps()}
              onDelete={this.onDelete}
              onAddToClipboard={this.handleAddToClipboard}
              onClick={isUneditable ? undefined : () => onSelect(uuid)}
              size={size}
              textSize={textSize}
              showMeta={showMeta}
              onImageDrop={this.handleImageDrop}
              canDragImage={canDragImage}
              canShowPageViewData={canShowPageViewData}
            >
              <EditModeVisibility visibleMode="fronts">
                {getSublinks}
                {/* If there are no supporting articles, the children still need to be rendered, because the dropzone is a child  */}
                {numSupportingArticles === 0
                  ? children
                  : this.state.showCardSublinks && children}
              </EditModeVisibility>
            </Article>
          );
        case cardTypes.SNAP_LINK:
          return (
            <>
              <SnapLink
                frontId={frontId}
                collectionId={collectionId}
                id={uuid}
                isUneditable={isUneditable}
                {...getNodeProps()}
                onDelete={this.onDelete}
                onAddToClipboard={this.handleAddToClipboard}
                onClick={isUneditable ? undefined : () => onSelect(uuid)}
                size={size}
                textSize={textSize}
                showMeta={showMeta}
                canShowPageViewData={canShowPageViewData}
              />
              {getSublinks}
              {numSupportingArticles === 0
                ? children
                : this.state.showCardSublinks && children}
            </>
          );
        default:
          return (
            <p>
              Item with id {uuid} has unknown card type {type}
            </p>
          );
      }
    };

    return (
      <CardContainer
        id={createCardId(uuid)}
        size={size}
        isLive={isLive}
        pillarId={pillarId}
      >
        {isSelected ? (
          <>
            <CardFormInline
              cardId={uuid}
              isSupporting={isSupporting}
              key={uuid}
              form={uuid}
              frontId={frontId}
              onSave={(meta) => {
                updateCardMeta(uuid, meta);
                clearCardSelection(uuid);
              }}
              onCancel={() => clearCardSelection(uuid)}
              size={size}
            />
            {getSublinks}
            {numSupportingArticles === 0
              ? children
              : this.state.showCardSublinks && children}
          </>
        ) : (
          <DragIntentContainer
            filterRegisterEvent={(e) => !dragEventHasImageData(e)}
            onDragIntentStart={() => this.setIsDraggingCardOver(true)}
            onDragIntentEnd={() => this.setIsDraggingCardOver(false)}
          >
            <DropzoneStyling isDraggingCardOver={this.state.isDraggingCardOver}>
              {getCard()}
            </DropzoneStyling>
          </DragIntentContainer>
        )}
      </CardContainer>
    );
  }

  public setIsDraggingCardOver = (isDraggingCardOver: boolean) =>
    this.setState({ isDraggingCardOver });

  private handleAddToClipboard = () => {
    this.props.onAddToClipboard(this.props.uuid);
  };

  private onDelete = () => {
    this.props.onDelete();
  };

  private handleImageDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.persist();

    // Our drag is a copy event, from another Card
    const cardUuid = e.dataTransfer.getData(DRAG_DATA_CARD_IMAGE_OVERRIDE);
    if (cardUuid) {
      this.props.copyCardImageMeta(cardUuid, this.props.uuid);
      return;
    }

    const isEditionsMode = this.props.editMode === 'editions';
    const imageCriteria = isEditionsMode
      ? editionsCardImageCriteria
      : cardImageCriteria;

    // Our drag contains Grid data
    validateImageEvent(e, this.props.frontId, imageCriteria)
      .then((imageData) =>
        this.props.addImageToCard(this.props.uuid, imageData)
      )
      .catch(alert);
  };
}

const createMapStateToProps = () => {
  const selectType = createSelectCardType();
  return (state: State, { uuid, frontId }: ContainerProps) => {
    const maybeExternalArticle = selectExternalArticleFromCard(state, uuid);
    return {
      type: selectType(state, uuid),
      isSelected: selectIsCardFormOpen(state, uuid, frontId),
      isLive: maybeExternalArticle && isArticleLive(maybeExternalArticle),
      pillarId: maybeExternalArticle && maybeExternalArticle.pillarId,
      numSupportingArticles: selectSupportingArticleCount(state, uuid),
      editMode: selectEditMode(state),
    };
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return bindActionCreators(
    {
      onAddToClipboard: addCardToClipboard,
      copyCardImageMeta: copyCardImageMetaWithPersist,
      addImageToCard,
      updateCardMeta: updateCardMetaAction,
      clearCardSelection: editorClearCardSelection,
    },
    dispatch
  );
};

export default connect(createMapStateToProps, mapDispatchToProps)(Card);
