import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
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

export const createCollectionId = ({ id }: Collection) => `collection-${id}`;

interface ContainerProps {
  id: string;
  selectSharedState?: (state: any) => SharedState;
  browsingStage: CollectionItemSets;
}

type Props = ContainerProps & {
  collection: Collection;
  articleIds?: string[];
  headlineContent: React.ReactNode;
  metaContent: React.ReactNode;
  children: React.ReactNode;
  isUneditable?: boolean;
};

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
  color: #333333;
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

const CollectionHeadingText = styled('div')`
  display: inline-block;
  max-width: 400px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CollectionConfigContainer = styled('div')`
  display: inline-block;
  font-family: GHGuardianHeadline-Regular;
  font-size: 22px;
  color: #333333;
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
  color: #c9c9c9;
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

class CollectionDisplay extends React.Component<Props, { isOpen: boolean }> {
  public static defaultProps = {
    isUneditable: false
  };
  public state = {
    isOpen: !this.props.isUneditable
  };

  public toggleVisibility = () => {
    this.setState({ isOpen: !this.state.isOpen });
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
    return !!collection ? (
      <CollectionContainer id={createCollectionId(collection)}>

        <ContainerHeadingPinline>
          <CollectionHeadlineWithConfigContainer>
            <CollectionHeadingText>
              {collection.displayName}
            </CollectionHeadingText>
            <CollectionConfigContainer>
              {oc(collection).metadata[0].type() ? (
                <CollectionConfigText>
                  <CollectionConfigTextPipe> | </CollectionConfigTextPipe>
                  {oc(collection).metadata[0].type()}
                </CollectionConfigText>
              ) : null}
              {collection.platform && collection.platform !== 'Any' ? (
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

        <CollectionMetaContainer>
          <ItemCountMeta>
            <strong>{itemCount}</strong>
            <br />
            {itemCount === 1 ? 'item' : 'items'}
          </ItemCountMeta>
          <CollectionMeta>
            <div>
              <strong>
                {collection.lastUpdated &&
                  `${upperFirst(distanceFromNow(collection.lastUpdated))} ago`}
              </strong>
            </div>
            <div>{collection.updatedBy}</div>
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
              active={this.state.isOpen}
              onClick={this.toggleVisibility}
            />
          </CollectionToggleContainer>
        </CollectionMetaContainer>
        {this.state.isOpen && <FadeIn>{children}</FadeIn>}
        {isUneditable ? (
          <CollectionDisabledTheme className="DisabledTheme" />
        ) : null}
      </CollectionContainer>
    ) : (
      <span>Waiting for collection</span>
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
