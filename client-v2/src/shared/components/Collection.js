// @flow

import React, { type Node as ReactNode } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import distanceFromNow from 'date-fns/distance_in_words_to_now';

import ContainerHeadingPinline from './typography/ContainerHeadingPinline';
import type { Collection } from '../types/Collection';
import ButtonCircularCaret from './input/ButtonCircularCaret';
import type { State } from '../types/State';
import { selectSharedState } from '../selectors/shared';
import { selectors as collectionSelectors } from '../bundles/collectionsBundle';
import FadeIn from './animation/FadeIn';
import ContentContainer from './layout/ContentContainer';

type ContainerProps = {
  id: string, // eslint-disable-line react/no-unused-prop-types
  selectSharedState?: (state: any) => State // eslint-disable-line react/no-unused-prop-types
};

type Props = ContainerProps & {
  collection: Collection,
  headlineContent: ReactNode,
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

const HeadlineMetaContainer = styled('div')`
  position: relative;
  margin-left: auto;
  font-family: TS3TextSans;
  font-size: 12px;
  font-weight: normal;
`;

const UpdatedByContainer = styled('span')`
  margin-right: 6px;
`;

const CollectionHeadingText = styled('span')`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
`;

class CollectionDetail extends React.Component<Props, { isOpen: boolean }> {
  state = {
    isOpen: true
  };

  toggleVisibility = () => {
    this.setState({ isOpen: !this.state.isOpen });
  };

  render() {
    const { collection, headlineContent, children }: Props = this.props;
    return collection ? (
      <CollectionContainer>
        <ContainerHeadingPinline>
          <CollectionHeadingText>
            {collection.displayName}
          </CollectionHeadingText>
          <HeadlineMetaContainer>
            <UpdatedByContainer>
              <b>{collection.updatedBy}</b>
              &nbsp;
              {collection.lastUpdated &&
                `${distanceFromNow(collection.lastUpdated)} ago`}
            </UpdatedByContainer>
            <ButtonCircularCaret
              active={this.state.isOpen}
              onClick={this.toggleVisibility}
            />
          </HeadlineMetaContainer>
          {headlineContent && (
            <HeadlineContentContainer>
              {headlineContent}
            </HeadlineContentContainer>
          )}
        </ContainerHeadingPinline>
        {this.state.isOpen && <FadeIn>{children}</FadeIn>}
      </CollectionContainer>
    ) : (
      <span>Waiting for collection</span>
    );
  }
}

const mapStateToProps = (
  state: State,
  props: ContainerProps
): { collection: Collection } => ({
  collection: collectionSelectors.selectById(
    props.selectSharedState
      ? props.selectSharedState(state)
      : selectSharedState(state),
    props.id
  )
});

export default connect(mapStateToProps)(CollectionDetail);
