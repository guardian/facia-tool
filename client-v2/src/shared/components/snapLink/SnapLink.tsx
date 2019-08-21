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

const SnapLinkBodyContainer = styled(CollectionItemBody)`
  justify-content: space-between;
  border-top-color: ${({ theme }) => theme.shared.base.colors.borderColor};
`;

const SnapLinkURL = styled('p')`
  font-size: 12px;
  word-break: break-all;
`;

const ImageWrapper = styled('div')``;

interface ContainerProps {
  selectSharedState?: (state: any) => State;
  onDragStart?: (d: React.DragEvent<HTMLElement>) => void;
  onDragOver?: (d: React.DragEvent<HTMLElement>) => void;
  onDrop?: (d: React.DragEvent<HTMLElement>) => void;
  onDelete?: (uuid: string) => void;
  onAddToClipboard?: (uuid: string) => void;
  onClick?: () => void;
  id: string;
  draggable?: boolean;
  size?: CollectionItemSizes;
  textSize?: CollectionItemSizes;
  showMeta?: boolean;
  fade?: boolean;
  children?: React.ReactNode;
  isUneditable?: boolean;
}

interface SnapLinkProps extends ContainerProps {
  articleFragment: ArticleFragment;
  article: DerivedArticle | undefined;
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
              {upperFirst(articleFragment.meta.snapType)}
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
              url: &nbsp;
              <a href={urlPath} target="_blank">
                {urlPath}
              </a>
            </SnapLinkURL>
          </CollectionItemHeadingContainer>
        </CollectionItemContent>
        <ImageWrapper>
          <ThumbnailSmall
            imageHide={article && article.imageHide}
            url={article && article.imageReplace ? article.imageSrcThumb : ''}
          />
          <ImageMetadataContainer
            imageSlideshowReplace={article && article.imageSlideshowReplace}
            imageReplace={article && article.imageReplace}
            imageCutoutReplace={article && article.imageCutoutReplace}
          />
        </ImageWrapper>
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

const mapStateToProps = (
  state: State,
  props: ContainerProps
): {
  articleFragment: ArticleFragment;
  article: DerivedArticle | undefined;
} => {
  const sharedState = props.selectSharedState
    ? props.selectSharedState(state)
    : selectSharedState(state);
  const selectArticle = createSelectArticleFromArticleFragment();
  const article = selectArticle(sharedState, props.id);
  return {
    articleFragment: selectArticleFragment(sharedState, props.id),
    article
  };
};

export default connect(mapStateToProps)(SnapLink);
