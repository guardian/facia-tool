import React from 'react';
import { styled } from 'shared/constants/theme';
import { connect } from 'react-redux';
import upperFirst from 'lodash/upperFirst';

import CollectionItemContainer from '../collectionItem/CollectionItemContainer';
import CollectionItemMetaContainer from '../collectionItem/CollectionItemMetaContainer';
import CollectionItemMetaHeading from '../collectionItem/CollectionItemMetaHeading';
import { ThumbnailSmall } from '../image/Thumbnail';
import { HoverActionsButtonWrapper } from '../input/HoverActionButtonWrapper';
import {
  HoverDeleteButton,
  HoverAddToClipboardButton,
  HoverViewButton,
  HoverOphanButton
} from '../input/HoverActionButtons';
import { HoverActionsAreaOverlay } from '../CollectionHoverItems';
import { ArticleFragment, CollectionItemSizes } from 'shared/types/Collection';
import {
  selectSharedState,
  selectArticleFragment,
  createSelectArticleFromArticleFragment
} from '../../selectors/shared';
import { State } from '../../types/State';
import CollectionItemHeading from '../collectionItem/CollectionItemHeading';
import CollectionItemContent from '../collectionItem/CollectionItemContent';
import CollectionItemBody from '../collectionItem/CollectionItemBody';
import CollectionItemMetaContent from '../collectionItem/CollectionItemMetaContent';
import urls from 'shared/constants/url';
import CollectionItemHeadingContainer from '../collectionItem/CollectionItemHeadingContainer';
import CollectionItemSettingsDisplay from '../collectionItem/CollectionItemSettingsDisplay';
import { distanceInWordsStrict } from 'date-fns';
import { DerivedArticle } from 'shared/types/Article';
import { ImageMetadataContainer } from '../image/ImageMetaDataContainer';
import { theme } from 'constants/theme';
import ArticleGraph from '../article/ArticleGraph';
import { selectFeatureValue } from 'shared/redux/modules/featureSwitches/selectors';
import PageViewDataWrapper from '../PageViewDataWrapper';
import ImageAndGraphWrapper from '../image/ImageAndGraphWrapper';

const SnapLinkBodyContainer = styled(CollectionItemBody)`
  justify-content: space-between;
  border-top-color: ${theme.shared.base.colors.borderColor};
`;

const SnapLinkURL = styled.p`
  font-size: 12px;
  word-break: break-all;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;

interface ContainerProps {
  selectSharedState?: (state: any) => State;
  onDragStart?: (d: React.DragEvent<HTMLElement>) => void;
  onDrop?: (d: React.DragEvent<HTMLElement>) => void;
  onDelete?: (uuid: string) => void;
  onAddToClipboard?: (uuid: string) => void;
  onClick?: () => void;
  id: string;
  collectionId?: string;
  frontId: string;
  draggable?: boolean;
  size?: CollectionItemSizes;
  textSize?: CollectionItemSizes;
  showMeta?: boolean;
  fade?: boolean;
  children?: React.ReactNode;
  isUneditable?: boolean;
  canShowPageViewData: boolean;
}

interface SnapLinkProps extends ContainerProps {
  articleFragment: ArticleFragment;
  article: DerivedArticle | undefined;
  featureFlagPageViewData: boolean;
}

const SnapLink = ({
  id,
  fade,
  size = 'default',
  textSize = 'default',
  showMeta = true,
  onDelete,
  onAddToClipboard,
  children,
  articleFragment,
  isUneditable,
  article,
  collectionId,
  frontId,
  canShowPageViewData = true,
  featureFlagPageViewData,
  ...rest
}: SnapLinkProps) => {
  const headline =
    articleFragment.meta.headline ||
    (articleFragment.meta.customKicker
      ? `{ ${articleFragment.meta.customKicker} }`
      : 'No headline');

  const normaliseSnapUrl = (href: string) => {
    if (href && !/^https?:\/\//.test(href)) {
      return 'https://' + urls.base.mainDomain + href;
    }
    return href;
  };

  const urlPath =
    articleFragment.meta.href && normaliseSnapUrl(articleFragment.meta.href);

  const now = Date.now();

  return (
    <CollectionItemContainer {...rest}>
      <SnapLinkBodyContainer data-testid="snap" size={size} fade={fade}>
        {showMeta && (
          <CollectionItemMetaContainer size={size}>
            <CollectionItemMetaHeading>Snap link</CollectionItemMetaHeading>
            <CollectionItemMetaContent>
              {upperFirst(
                articleFragment.meta.snapCss || articleFragment.meta.snapType
              )}
            </CollectionItemMetaContent>
            {!!articleFragment.frontPublicationDate && (
              <CollectionItemMetaContent title="The time elapsed since this card was created in the tool.">
                {distanceInWordsStrict(
                  now,
                  new Date(articleFragment.frontPublicationDate)
                )}
              </CollectionItemMetaContent>
            )}
          </CollectionItemMetaContainer>
        )}
        <CollectionItemContent textSize={textSize}>
          <CollectionItemSettingsDisplay
            isBreaking={articleFragment.meta.isBreaking}
            showByline={articleFragment.meta.showByline}
            showQuotedHeadline={articleFragment.meta.showQuotedHeadline}
            showLargeHeadline={articleFragment.meta.showLargeHeadline}
            isBoosted={articleFragment.meta.isBoosted}
          />
          <CollectionItemHeadingContainer size={size}>
            {!showMeta && (
              <CollectionItemMetaHeading>Snap link </CollectionItemMetaHeading>
            )}
            <CollectionItemHeading html>{headline}</CollectionItemHeading>
            <SnapLinkURL>
              {articleFragment.meta.snapUri && (
                <>
                  <strong>snap uri:&nbsp;</strong>
                  {articleFragment.meta.snapUri}
                  &nbsp;
                </>
              )}
              <strong>url:&nbsp;</strong>
              <a href={urlPath} target="_blank">
                {articleFragment.meta.href}
              </a>
            </SnapLinkURL>
          </CollectionItemHeadingContainer>
        </CollectionItemContent>
        <ImageAndGraphWrapper size={size}>
          {featureFlagPageViewData && canShowPageViewData && collectionId && (
            <PageViewDataWrapper data-testid="page-view-graph">
              <ArticleGraph
                articleId={id}
                collectionId={collectionId}
                frontId={frontId}
              />
            </PageViewDataWrapper>
          )}
          <ThumbnailSmall
            imageHide={article && article.imageHide}
            url={article && article.imageReplace ? article.thumbnail : ''}
          />
          <ImageMetadataContainer
            imageSlideshowReplace={article && article.imageSlideshowReplace}
            imageReplace={article && article.imageReplace}
            imageCutoutReplace={article && article.imageCutoutReplace}
          />
        </ImageAndGraphWrapper>
        <HoverActionsAreaOverlay
          disabled={isUneditable}
          justify={'space-between'}
        >
          <HoverActionsButtonWrapper
            buttons={[
              { text: 'View', component: HoverViewButton },
              { text: 'Ophan', component: HoverOphanButton },
              { text: 'Clipboard', component: HoverAddToClipboardButton },
              { text: 'Delete', component: HoverDeleteButton }
            ]}
            buttonProps={{
              isLive: true, // it should not be possible for a snap link to be anything other than live?
              urlPath,
              onAddToClipboard,
              onDelete,
              isSnapLink: true
            }}
            size={size}
            toolTipPosition={'top'}
            toolTipAlign={'right'}
          />
        </HoverActionsAreaOverlay>
      </SnapLinkBodyContainer>
      {children}
    </CollectionItemContainer>
  );
};

const mapStateToProps = () => {
  const selectArticle = createSelectArticleFromArticleFragment();
  return (state: State, props: ContainerProps) => {
    const sharedState = props.selectSharedState
      ? props.selectSharedState(state)
      : selectSharedState(state);
    const article = selectArticle(sharedState, props.id);
    return {
      articleFragment: selectArticleFragment(sharedState, props.id),
      article,
      featureFlagPageViewData: selectFeatureValue(
        selectSharedState(state),
        'page-view-data-visualisation'
      )
    };
  };
};

export default connect(mapStateToProps)(SnapLink);
