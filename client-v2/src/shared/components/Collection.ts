

import React, { type Node as ReactNode } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import distanceFromNow from 'date-fns/distance_in_words_to_now';
import upperFirst from 'lodash/upperFirst';

import ShortVerticalPinline from './layout/ShortVerticalPinline';
import ContainerHeadingPinline from './typography/ContainerHeadingPinline';
import { Collection } from '../types/Collection';
import ButtonCircularCaret from './input/ButtonCircularCaret';
import { State } from '../types/State';
import {
  selectSharedState,
  createArticlesInCollectionSelector
} from '../selectors/shared';
import { selectors as collectionSelectors } from '../bundles/collectionsBundle';
import FadeIn from './animation/FadeIn';
import ContentContainer from './layout/ContentContainer';

type ContainerProps = {
  id: string, // eslint-disable-line react/no-unused-prop-types
  selectSharedState?: (state: any) => State, // eslint-disable-line react/no-unused-prop-types
  browsingStage?: string // eslint-disable-line react/no-unused-prop-types
};

type Props = ContainerProps & {
  collection: Collection,
  articleIds?: Array<string>,
  headlineContent: ReactNode,
  metaContent: ReactNode,
  children: ReactNode
};

const CollectionContainer = ContentContainer.extend`
  flex: 1;
  width: 600px;
`;

const HeadlineContentContainer = styled('span')`
  position: relative;
  margin-left: auto;
  right: -11px;
  line-height: 0px;
`;

const CollectionMetaContainer = styled('div')`
  display: flex;
  position: relative;
  font-family: TS3TextSans;
  font-size: 12px;
  font-weight: normal;
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

const CollectionHeadingText = styled('span')`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
`;

const CollectionToggleContainer = styled('div')`
  padding-top: 5px;
  margin-left: auto;
`;

const CollectionShortVerticalPinline = ShortVerticalPinline.extend`
  right: initial;
  left: 0;
`;

class CollectionDetail extends React.Component<Props, { isOpen: boolean }> {
  state = {
    isOpen: true
  };

  toggleVisibility = () => {
    this.setState({ isOpen: !this.state.isOpen });
  };

  render() {
    const {
      collection,
      articleIds,
      headlineContent,
      metaContent,
      children
    }: Props = this.props;
    const itemCount = articleIds ? articleIds.length : 0;
    return collection ? (
      <CollectionContainer>
        <ContainerHeadingPinline>
          <CollectionHeadingText>
            {collection.displayName}
          </CollectionHeadingText>
          {headlineContent && (
            <HeadlineContentContainer>
              {headlineContent}
            </HeadlineContentContainer>
          )}
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
      </CollectionContainer>
    ) : (
      <span>Waiting for collection</span>
    );
  }
}

const createMapStateToProps = () => {
  const selectArticlesInCollection = createArticlesInCollectionSelector();
  // $FlowFixMe
  return (state: State, props: ContainerProps): { collection: Collection } => {
    const sharedState = props.selectSharedState
      ? props.selectSharedState(state)
      : selectSharedState(state);
    return {
      collection: collectionSelectors.selectById(sharedState, props.id),
      articleIds: selectArticlesInCollection(sharedState, {
        collectionId: props.id,
        stage: props.browsingStage
      })
    };
  };
};

export default connect(createMapStateToProps)(CollectionDetail);
