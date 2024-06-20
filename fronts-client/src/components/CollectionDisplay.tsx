import React from 'react';
import { connect } from 'react-redux';
import { styled } from 'constants/theme';
import distanceFromNow from 'date-fns/distance_in_words_to_now';
import upperFirst from 'lodash/upperFirst';
import { oc } from 'ts-optchain';

import ShortVerticalPinline from './layout/ShortVerticalPinline';
import ContainerHeadingPinline from './typography/ContainerHeadingPinline';
import {
  Collection,
  CardSets,
  Collection as CollectionType,
} from '../types/Collection';
import DragIntentContainer from './DragIntentContainer';
import ButtonCircularCaret, {
  ButtonCircularWithTransition,
} from './inputs/ButtonCircularCaret';
import type { State } from 'types/State';

import { createSelectArticlesInCollection } from '../selectors/shared';
import { selectors as collectionSelectors } from '../bundles/collectionsBundle';
import FadeIn from './animation/FadeIn';
import ContentContainer, {
  contentContainerMargin,
} from './layout/ContentContainer';
import { css } from 'styled-components';
import { events } from 'services/GA';
import CollectionMetaContainer from './collection/CollectionMetaContainer';
import { resetFocusState, setFocusState } from 'bundles/focusBundle';
import { Dispatch } from 'types/Store';
import { theme } from 'constants/theme';
import Button from 'components/inputs/ButtonDefault';
import { updateCollection as updateCollectionAction } from '../actions/Collections';
import { isMode } from '../selectors/pathSelectors';
import {
  COLLECTIONS_USING_PORTRAIT_TRAILS,
<<<<<<< HEAD
  portraitCardImageCriteria,
  SUPPORT_PORTRAIT_CROPS,
} from 'constants/image';
import { AspectRatioBadge } from './icons/AspectRatioBadge';
=======
  SUPPORT_PORTRAIT_CROPS,
} from 'constants/image';
import { CropIcon } from './icons/Icons';
>>>>>>> bcec3449ad (set criteria by collection type, style portrait thumbnails, validate on drop (#1591))

export const createCollectionId = ({ id }: Collection, frontId: string) =>
  `front-${frontId}-collection-${id}`;

interface ContainerProps {
  id: string;
  browsingStage: CardSets;
  frontId: string;
}

type Props = ContainerProps & {
  collection: Collection | undefined;
  articleIds?: string[];
  headlineContent: React.ReactNode;
  metaContent: React.ReactNode;
  children: React.ReactNode;
  isUneditable?: boolean;
  underlyingCollection?: Collection;
  isLocked?: boolean;
  isOpen?: boolean;
  hasMultipleFrontsOpen?: boolean;
  onChangeOpenState?: (isOpen: boolean) => void;
  handleFocus: (id: string) => void;
  handleBlur: () => void;
  updateCollection: (
    collection: Collection,
    renamingCollection: boolean
  ) => void;
  isEditions: boolean;
};

interface CollectionState {
  displayName: string;
  hasDragOpenIntent: boolean;
  editingContainerName: boolean;
}

const CollectionContainer = styled(ContentContainer)<{
  hasMultipleFrontsOpen?: boolean;
}>`
  background-color: ${(props) => props.theme.collection.background};

  &:focus {
    border: 1px solid ${(props) => props.theme.base.colors.focusColor};
    border-top: none;
    outline: none;
  }
  padding-bottom: 0;
`;

const HeadlineContentContainer = styled.span`
  position: relative;
  margin-right: -11px;
  display: flex;
`;

export const HeadlineContentButton = styled(Button).attrs({ size: 's' })`
  color: #fff;
  padding: 0 5px;
  display: flex;
  align-items: center;
  margin-left: 5px;
`;

const CollectionDisabledTheme = styled.div`
  position: absolute;
  background-color: hsla(0, 0%, 100%, 0.3);
  height: 100%;
  width: 100%;
  top: 0;
  left: 0;
`;

const LockedCollectionFlag = styled.span`
  font-family: GHGuardianHeadline;
  font-size: 22px;
  color: ${theme.base.colors.text};
  height: 40px;
  line-height: 40px;
  border-bottom: 1px solid ${theme.base.colors.borderColor};
`;

const CollectionMetaBase = styled.span`
  position: relative;
  padding-top: 3px;
  padding-right: 20px;
`;

const CollectionMeta = styled(CollectionMetaBase)`
  padding-left: 10px;
  flex-grow: 1;
`;

const ItemCountMeta = CollectionMetaBase;

const CollectionHeadingSticky = styled.div`
  position: sticky;
  top: 0;
  background-color: ${theme.collection.background};
  box-shadow: 0 -1px 0 ${theme.base.colors.text};
  z-index: 20;
  margin: 0 -${contentContainerMargin};
  padding: 0 ${contentContainerMargin};
`;

const CollectionHeadingInner = styled(ContainerHeadingPinline)`
  border-bottom: 1px solid ${theme.base.colors.borderColor};
`;

const CollectionHeadlineWithConfigContainer = styled.div`
  flex-grow: 1;
  min-width: 0;
  flex-basis: 100%;
`;

const CollectionHeadingText = styled.div<{ isLoading: boolean }>`
  width: 100%;
  white-space: nowrap;
  ${({ isLoading }) =>
    isLoading &&
    css`
      color: ${theme.base.colors.textMuted};
    `} white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CollectionToggleContainer = styled.div`
  padding-top: 5px;
  max-width: 130px;
  display: flex;
  justify-content: flex-end;
  z-index: 2;
  :hover {
    ${ButtonCircularWithTransition} {
      background-color: ${theme.button.backgroundColorFocused};
    }
  }
`;

const CollectionConfigContainer = styled.div`
  display: inline-block;
  font-family: GHGuardianHeadline;
  font-size: 15px;
  color: ${theme.base.colors.text};
  white-space: nowrap;
  margin-left: 3px;
  vertical-align: bottom;
`;

const CollectionConfigText = styled.div`
  display: inline;
  font-weight: normal;
  font-style: normal;
`;

const CollectionConfigTextPipe = styled.span`
  color: ${theme.base.colors.borderColor};
`;

const CollectionShortVerticalPinline = styled(ShortVerticalPinline)`
  right: initial;
  left: 0;
`;

const TargetedTerritoryBox = styled.div`
  background-color: black;
  color: white;
  font-size: 15px;
  padding: 0 5px;
  span {
    font-size: 7px;
    vertical-align: middle;
  }
`;

const CollectionHeaderInput = styled.input`
  font-size: 22px;
  font-family: GHGuardianHeadline;
  font-weight: bold;
  width: 20em;
`;

class CollectionDisplay extends React.Component<Props, CollectionState> {
  public static defaultProps = {
    isUneditable: false,
    isOpen: true,
  };

  public state = {
    displayName: 'Loading...',
    hasDragOpenIntent: false,
    editingContainerName: false,
  };

  public toggleVisibility = () => {
    events.collectionToggleClicked(this.props.frontId);
    if (this.props.onChangeOpenState) {
      this.props.onChangeOpenState(!this.props.isOpen);
    }
  };

  public render() {
    const {
      id,
      collection,
      frontId,
      articleIds,
      headlineContent,
      metaContent,
      isUneditable,
      isLocked,
      hasMultipleFrontsOpen,
      children,
      handleFocus,
      handleBlur,
      isEditions,
    }: Props = this.props;
    const itemCount = articleIds ? articleIds.length : 0;
    const targetedTerritory = collection ? collection.targetedTerritory : null;
    const { displayName } = this.state;

    const usePortrait =
      SUPPORT_PORTRAIT_CROPS &&
      collection?.type &&
      COLLECTIONS_USING_PORTRAIT_TRAILS.includes(collection?.type);

    return (
      <CollectionContainer
        id={collection && createCollectionId(collection, frontId)}
        tabIndex={0}
        onFocus={() => handleFocus(id)}
        onBlur={handleBlur}
        hasMultipleFrontsOpen={hasMultipleFrontsOpen}
      >
        <CollectionHeadingSticky tabIndex={-1}>
          <CollectionHeadingInner>
<<<<<<< HEAD
            {usePortrait && <AspectRatioBadge {...portraitCardImageCriteria} />}
=======
            {usePortrait && (
              <CropIcon title={'uses portrait (5:4) image crops'} />
            )}
>>>>>>> bcec3449ad (set criteria by collection type, style portrait thumbnails, validate on drop (#1591))
            <CollectionHeadlineWithConfigContainer>
              {this.state.editingContainerName ? (
                <CollectionHeaderInput
                  data-testid="rename-front-input"
                  value={displayName}
                  autoFocus
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    this.setState({ displayName: e.target.value });
                  }}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === 'Enter') {
                      this.setName();
                    }
                  }}
                  onBlur={() => this.setName()}
                />
              ) : (
                <CollectionHeadingText
                  isLoading={!collection}
                  title={!!collection ? collection!.displayName : 'Loading …'}
                >
                  {!!collection ? collection!.displayName : 'Loading …'}
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
                    {targetedTerritory && (
                      <TargetedTerritoryBox>
                        {targetedTerritory}
                        <span> &nbsp;ONLY</span>
                      </TargetedTerritoryBox>
                    )}
                  </CollectionConfigContainer>
                </CollectionHeadingText>
              )}
            </CollectionHeadlineWithConfigContainer>
            {isLocked ? (
              <LockedCollectionFlag>Locked</LockedCollectionFlag>
            ) : headlineContent ? (
              <HeadlineContentContainer>
                {headlineContent}
                {isEditions && (
                  <HeadlineContentButton
                    priority="default"
                    onClick={this.startRenameContainer}
                    title="Rename this container in this issue."
                  >
                    Rename
                  </HeadlineContentButton>
                )}
              </HeadlineContentContainer>
            ) : null}
          </CollectionHeadingInner>
        </CollectionHeadingSticky>
        <DragIntentContainer
          delay={300}
          onIntentConfirm={this.toggleVisibility}
          onDragIntentStart={() => {
            this.setState({ hasDragOpenIntent: true });
          }}
          onDragIntentEnd={() => {
            this.setState({ hasDragOpenIntent: false });
          }}
          active={!this.props.isOpen}
        >
          <CollectionMetaContainer onClick={this.toggleVisibility}>
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
                    `${upperFirst(
                      distanceFromNow(collection.lastUpdated)
                    )} ago`}
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
                tabIndex={-1}
              />
            </CollectionToggleContainer>
          </CollectionMetaContainer>
        </DragIntentContainer>
        {this.props.isOpen && <FadeIn>{children}</FadeIn>}
        {isUneditable ? (
          <CollectionDisabledTheme className="DisabledTheme" />
        ) : null}
      </CollectionContainer>
    );
  }

  private getDisplayName = () => {
    const { collection } = this.props;
    return !!collection ? collection!.displayName : 'Loading...';
  };

  private startRenameContainer = () => {
    this.setState({
      displayName: this.getDisplayName(),
      editingContainerName: true,
    });
  };

  private setName = () => {
    const { collection } = this.props;
    collection!.displayName = this.state.displayName;
    this.setState({
      editingContainerName: false,
    });
    this.props.updateCollection(collection!, true);
  };
}

const createMapStateToProps = () => {
  const selectArticlesInCollection = createSelectArticlesInCollection();
  return (state: State, props: ContainerProps) => {
    return {
      collection: collectionSelectors.selectById(state, props.id),
      articleIds: selectArticlesInCollection(state, {
        collectionId: props.id,
        collectionSet: props.browsingStage,
        includeSupportingArticles: false,
      }),
      isEditions: isMode(state, 'editions'),
    };
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  handleBlur: () => dispatch(resetFocusState()),
  handleFocus: (collectionId: string) =>
    dispatch(setFocusState({ type: 'collection', collectionId })),
  updateCollection: (
    collection: CollectionType,
    renamingCollection: boolean
  ) => {
    dispatch(updateCollectionAction(collection, renamingCollection));
  },
});

export default connect(
  createMapStateToProps,
  mapDispatchToProps
)(CollectionDisplay);
