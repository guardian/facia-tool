import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import distanceFromNow from 'date-fns/distance_in_words_to_now';
import upperFirst from 'lodash/upperFirst';

import ShortVerticalPinline from './layout/ShortVerticalPinline';
import ContainerHeadingPinline from './typography/ContainerHeadingPinline';
import { Collection, CollectionItemSets } from '../types/Collection';
import ButtonCircularCaret from './input/ButtonCircularCaret';
import { State as SharedState } from '../types/State';
import { State as RootState } from '../../types/State';
import { CollectionConfig } from '../../types/FaciaApi';
import {
  selectSharedState,
  createArticlesInCollectionSelector
} from '../selectors/shared';
import { getCollectionConfig } from '../../selectors/frontsSelectors';
import { selectors as collectionSelectors } from '../bundles/collectionsBundle';
import FadeIn from './animation/FadeIn';
import ContentContainer from './layout/ContentContainer';

interface ContainerProps {
  id: string;
  selectSharedState?: (state: any) => SharedState;
  browsingStage: CollectionItemSets;
}

type Props = ContainerProps & {
  collection: Collection;
  config: CollectionConfig;
  articleIds?: string[];
  headlineContent: React.ReactNode;
  metaContent: React.ReactNode;
  children: React.ReactNode;
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

const ConfigContentContainer = styled('span')`
  position: relative;
  font-family: TS3TextSans;
  font-size: 14px;
  font-weight: bold;
  margin: 0 0;
  padding: 0 25px;
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
  public state = {
    isOpen: true
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
      config,
      children
    }: Props = this.props;
    const itemCount = articleIds ? articleIds.length : 0;
    return collection ? (
      <CollectionContainer>
        <ContainerHeadingPinline>
          <CollectionHeadingText>
            {collection.displayName}
          </CollectionHeadingText>
          <ConfigContentContainer>
            {config.platform ? `${config.platform} only` : null}
          </ConfigContentContainer>
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
  return (state: RootState, props: ContainerProps) => {
    const sharedState = props.selectSharedState
      ? props.selectSharedState(state)
      : selectSharedState(state);
    return {
      collection: collectionSelectors.selectById(sharedState, props.id),
      config: getCollectionConfig(state, props.id),
      articleIds: selectArticlesInCollection(sharedState, {
        collectionId: props.id,
        collectionSet: props.browsingStage
      })
    };
  };
};

export default connect(createMapStateToProps)(CollectionDetail);
