import React from 'react';
import { connect } from 'react-redux';
import { styled } from 'shared/constants/theme';
import distanceFromNow from 'date-fns/distance_in_words_to_now';
import upperFirst from 'lodash/upperFirst';
import { oc } from 'ts-optchain';

import ShortVerticalPinline from './layout/ShortVerticalPinline';
import ContainerHeadingPinline from './typography/ContainerHeadingPinline';
import { Collection, CollectionItemSets } from '../types/Collection';
import ButtonCircularCaret from './input/ButtonCircularCaret';
import { State as SharedState } from '../types/State';
import { State } from '../../types/State';

import {
  selectSharedState,
  createArticlesInCollectionSelector
} from '../selectors/shared';
import { selectors as collectionSelectors } from '../bundles/collectionsBundle';
import FadeIn from './animation/FadeIn';
import ContentContainer from './layout/ContentContainer';
import { css } from 'styled-components';
import { events } from 'services/GA';

export const createCollectionId = ({ id }: Collection) => `collection-${id}`;

interface ContainerProps {
  id: string;
  selectSharedState?: (state: any) => SharedState;
  browsingStage: CollectionItemSets;
  frontId: string;
}

type Props = ContainerProps & {
  collection: Collection | undefined;
  articleIds?: string[];
  headlineContent: React.ReactNode;
  metaContent: React.ReactNode;
  children: React.ReactNode;
  isUneditable?: boolean;
  isOpen?: boolean;
  onChangeOpenState?: (isOpen: boolean) => void;
};

interface CollectionState {
  hasDragOpenIntent: boolean;
}

const CollectionContainer = ContentContainer.extend`
  flex: 1;
  width: 600px;
`;

const HeadlineContentContainer = styled('span')`
  position: relative;
  right: -11px;
  line-height: 0px;
`;

const CollectionDisabledTheme = styled('div')`
  position: absolute;
  background-color: hsla(0, 0%, 100%, 0.3);
  height: 100%;
  width: 100%;
  top: 0;
  left: 0;
`;

const LockedCollectionFlag = styled('span')`
  font-family: GHGuardianHeadline-Regular;
  font-size: 22px;
  color: ${({ theme }) => theme.base.colors.text};
  height: 40px;
  line-height: 40px;
  font-weight: normal;
  font-style: normal;
`;

const CollectionMetaContainer = styled('div')`
  display: flex;
  position: relative;
  font-family: TS3TextSans;
  font-size: 12px;
  font-weight: normal;
  justify-content: space-between;
`;

const CollectionMetaBase = styled('span')`
  position: relative;
  padding-top: 3px;
  padding-right: 40px;
`;

const CollectionMeta = CollectionMetaBase.extend`
  padding-left: 10px;
`;

const ItemCountMeta = CollectionMetaBase.extend`
  flex: 0;
`;

const CollectionHeadlineWithConfigContainer = styled('div')`
  flex-grow: 1;
  max-width: calc(100% - 95px);
  display: flex;
`;

const CollectionHeadingText = styled('span')<{ isLoading: boolean }>`
  display: inline-block;
  max-width: 400px;
  white-space: nowrap;
  ${({ isLoading, theme }) =>
    isLoading &&
    css`
      color: ${theme.base.colors.textMuted};
    `} white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CollectionConfigContainer = styled('div')`
  display: inline-block;
  font-family: GHGuardianHeadline-Regular;
  font-size: 22px;
  color: ${({ theme }) => theme.base.colors.text};
  height: 40px;
  line-height: 40px;
  white-space: nowrap;
  margin-left: 3px;
`;

const CollectionConfigText = styled('div')`
  display: inline;
  font-weight: normal;
  font-style: normal;
`;

const CollectionConfigTextPipe = styled('span')`
  color: ${({ theme }) => theme.base.colors.borderColor};
`;

const CollectionToggleContainer = styled('div')`
  padding-top: 5px;
  margin-left: auto;
  z-index: 2;
`;

const CollectionShortVerticalPinline = ShortVerticalPinline.extend`
  right: initial;
  left: 0;
`;

class CollectionDisplay extends React.Component<Props, CollectionState> {
  public static defaultProps = {
    isUneditable: false,
    isOpen: true
  };

  public state = {
    hasDragOpenIntent: false
  };

  private dragTimer: number | null = null;

  // Keeps track of dragEvents over the Collection's toggleVisibility button to determine enter/leave events
  private dragHoverDepth: number = 0;

  public toggleVisibility = () => {
    events.collectionToggleClicked(this.props.frontId);
    if (this.props.onChangeOpenState) {
      this.props.onChangeOpenState(!this.props.isOpen);
    }
  };

  public handleToggleButtonDragEnter = () => {
    if (this.dragHoverDepth === 0 && !this.props.isOpen) {
      this.registerDragOpenIntent();
    }
    this.dragHoverDepth += 1;
  };

  public handleToggleButtonDragLeave = () => {
    this.dragHoverDepth -= 1;
    if (this.dragHoverDepth === 0) {
      this.deregisterDragOpenIntent();
    }
  };

  public handleToggleButtonDrop = () => {
    this.dragHoverDepth = 0;
    this.deregisterDragOpenIntent();
  };

  public registerDragOpenIntent = () => {
    this.dragTimer = window.setTimeout(() => {
      if (!this.props.isOpen) {
        this.toggleVisibility();
        this.deregisterDragOpenIntent();
      }
    }, 300);
    this.setState({ hasDragOpenIntent: true });
  };

  public deregisterDragOpenIntent = () => {
    if (this.dragTimer) {
      window.clearTimeout(this.dragTimer);
    }
    this.dragTimer = null;
    this.setState({ hasDragOpenIntent: false });
  };

  public render() {
    const {
      collection,
      articleIds,
      headlineContent,
      metaContent,
      isUneditable,
      children
    }: Props = this.props;
    const itemCount = articleIds ? articleIds.length : 0;

    return (
      <CollectionContainer id={collection && createCollectionId(collection)}>
        <ContainerHeadingPinline>
          <CollectionHeadlineWithConfigContainer>
            <CollectionHeadingText isLoading={!collection}>
              {collection ? collection.displayName : 'Loading'}
            </CollectionHeadingText>
            <CollectionConfigContainer>
              {oc(collection).metadata[0].type() ? (
                <CollectionConfigText>
                  <CollectionConfigTextPipe> | </CollectionConfigTextPipe>
                  {oc(collection).metadata[0].type()}
                </CollectionConfigText>
              ) : null}
              {collection &&
              collection.platform &&
              collection.platform !== 'Any' ? (
                <CollectionConfigText>
                  <CollectionConfigTextPipe> | </CollectionConfigTextPipe>
                  {`${collection.platform} Only`}
                </CollectionConfigText>
              ) : null}
            </CollectionConfigContainer>
          </CollectionHeadlineWithConfigContainer>
          {isUneditable ? (
            <LockedCollectionFlag>Locked</LockedCollectionFlag>
          ) : headlineContent ? (
            <HeadlineContentContainer>
              {headlineContent}
            </HeadlineContentContainer>
          ) : null}
        </ContainerHeadingPinline>

        <CollectionMetaContainer
          onClick={this.toggleVisibility}
          onDragEnter={this.handleToggleButtonDragEnter}
          onDragLeave={this.handleToggleButtonDragLeave}
          onDrop={this.handleToggleButtonDrop}
        >
          <ItemCountMeta>
            {collection && (
              <>
                <strong>{itemCount}</strong>
                <br />
                {itemCount === 1 ? 'item' : 'items'}
              </>
            )}
          </ItemCountMeta>
          <CollectionMeta>
            <div>
              <strong>
                {collection &&
                  collection.lastUpdated &&
                  `${upperFirst(distanceFromNow(collection.lastUpdated))} ago`}
              </strong>
            </div>
            <div>{collection && collection.updatedBy}</div>
            <CollectionShortVerticalPinline />
          </CollectionMeta>
          {metaContent && (
            <CollectionMeta>
              {metaContent}
              <CollectionShortVerticalPinline />
            </CollectionMeta>
          )}
          <CollectionToggleContainer>
            <ButtonCircularCaret
              active={this.props.isOpen!}
              preActive={this.state.hasDragOpenIntent}
            />
          </CollectionToggleContainer>
        </CollectionMetaContainer>
        {this.props.isOpen && <FadeIn>{children}</FadeIn>}
        {isUneditable ? (
          <CollectionDisabledTheme className="DisabledTheme" />
        ) : null}
      </CollectionContainer>
    );
  }
}

const createMapStateToProps = () => {
  const selectArticlesInCollection = createArticlesInCollectionSelector();
  return (state: State, props: ContainerProps) => {
    const sharedState = props.selectSharedState
      ? props.selectSharedState(state)
      : selectSharedState(state);
    return {
      collection: collectionSelectors.selectById(sharedState, props.id),
      articleIds: selectArticlesInCollection(sharedState, {
        collectionId: props.id,
        collectionSet: props.browsingStage
      })
    };
  };
};

export default connect(createMapStateToProps)(CollectionDisplay);
