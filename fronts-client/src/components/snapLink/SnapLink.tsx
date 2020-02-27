import React from 'react';
import { styled } from 'constants/theme';
import { connect } from 'react-redux';
import upperFirst from 'lodash/upperFirst';

import CardContainer from 'components/card/CardContainer';
import CardMetaContainer from 'components/card/CardMetaContainer';
import CardMetaHeading from 'components/card/CardMetaHeading';
import { ThumbnailSmall } from 'components/image/Thumbnail';
import { HoverActionsButtonWrapper } from 'components/inputs/HoverActionButtonWrapper';
import {
  HoverDeleteButton,
  HoverAddToClipboardButton,
  HoverViewButton,
  HoverOphanButton
} from '../inputs/HoverActionButtons';
import { HoverActionsAreaOverlay } from '../CollectionHoverItems';
import { Card, CardSizes } from 'types/Collection';
import {
  selectCard,
  createSelectArticleFromCard
} from '../../selectors/shared';
import { State } from 'types/State';
import CardHeading from '../card/CardHeading';
import CardContent from '../card/CardContent';
import CardBody from 'components/card/CardBody';
import CardMetaContent from '../card/CardMetaContent';
import url from 'constants/url';
import CardHeadingContainer from '../card/CardHeadingContainer';
import CardSettingsDisplay from '../card/CardSettingsDisplay';
import { distanceInWordsStrict } from 'date-fns';
import { DerivedArticle } from 'types/Article';
import { ImageMetadataContainer } from 'components/image/ImageMetaDataContainer';
import { theme } from 'constants/theme';
import ArticleGraph from '../article/ArticleGraph';
import { selectFeatureValue } from 'redux/modules/featureSwitches/selectors';
import ImageAndGraphWrapper from 'components/image/ImageAndGraphWrapper';
import { ThumbnailCutout } from 'components/image/Thumbnail';
import PageViewDataWrapper from 'components/PageViewDataWrapper';

const SnapLinkBodyContainer = styled(CardBody)`
  justify-content: space-between;
  border-top-color: ${theme.base.colors.borderColor};
`;

const SnapLinkURL = styled.p`
  font-size: 12px;
  word-break: break-all;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;

interface ContainerProps {
  onDragStart?: (d: React.DragEvent<HTMLElement>) => void;
  onDrop?: (d: React.DragEvent<HTMLElement>) => void;
  onDelete?: (uuid: string) => void;
  onAddToClipboard?: (uuid: string) => void;
  onClick?: () => void;
  id: string;
  collectionId?: string;
  frontId: string;
  draggable?: boolean;
  size?: CardSizes;
  textSize?: CardSizes;
  showMeta?: boolean;
  fade?: boolean;
  children?: React.ReactNode;
  isUneditable?: boolean;
  canShowPageViewData: boolean;
}

interface SnapLinkProps extends ContainerProps {
  card: Card;
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
  card,
  isUneditable,
  article,
  collectionId,
  frontId,
  canShowPageViewData = true,
  featureFlagPageViewData,
  ...rest
}: SnapLinkProps) => {
  const headline =
    card.meta.headline ||
    (card.meta.customKicker ? `{ ${card.meta.customKicker} }` : 'No headline');

  const normaliseSnapUrl = (href: string) => {
    if (href && !/^https?:\/\//.test(href)) {
      return 'https://' + url.base.mainDomain + href;
    }
    return href;
  };

  const urlPath = card.meta.href && normaliseSnapUrl(card.meta.href);

  const now = Date.now();

  return (
    <CardContainer {...rest}>
      <SnapLinkBodyContainer data-testid="snap" size={size} fade={fade}>
        {showMeta && (
          <CardMetaContainer size={size}>
            <CardMetaHeading>Snap link</CardMetaHeading>
            <CardMetaContent>
              {upperFirst(card.meta.snapCss || card.meta.snapType)}
            </CardMetaContent>
            {!!card.frontPublicationDate && (
              <CardMetaContent title="The time elapsed since this card was created in the tool.">
                {distanceInWordsStrict(
                  now,
                  new Date(card.frontPublicationDate)
                )}
              </CardMetaContent>
            )}
          </CardMetaContainer>
        )}
        <CardContent textSize={textSize}>
          <CardSettingsDisplay
            isBreaking={card.meta.isBreaking}
            showByline={card.meta.showByline}
            showQuotedHeadline={card.meta.showQuotedHeadline}
            showLargeHeadline={card.meta.showLargeHeadline}
            isBoosted={card.meta.isBoosted}
          />
          <CardHeadingContainer size={size}>
            {!showMeta && <CardMetaHeading>Snap link </CardMetaHeading>}
            <CardHeading data-testid="headline" html>
              {headline}
            </CardHeading>
            <SnapLinkURL>
              {card.meta.snapType !== 'html' && card.meta.href && (
                <>
                  <strong>url:&nbsp;</strong>
                  <a href={urlPath} target="_blank">
                    {card.meta.href}
                  </a>
                  &nbsp;
                </>
              )}
              {card.meta.snapUri && (
                <>
                  <strong>snap uri:&nbsp;</strong>
                  {card.meta.snapUri}
                </>
              )}
            </SnapLinkURL>
          </CardHeadingContainer>
        </CardContent>
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
          {article && (
            <div>
              <ThumbnailSmall
                imageHide={article.imageHide}
                url={article.thumbnail}
              />
              {article.cutoutThumbnail ? (
                <ThumbnailCutout src={article.cutoutThumbnail} />
              ) : null}
              <ImageMetadataContainer
                imageSlideshowReplace={article && article.imageSlideshowReplace}
                imageReplace={article && article.imageReplace}
                imageCutoutReplace={article && article.imageCutoutReplace}
              />
            </div>
          )}
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
    </CardContainer>
  );
};

const mapStateToProps = () => {
  const selectArticle = createSelectArticleFromCard();
  return (state: State, props: ContainerProps) => {
    const article = selectArticle(state, props.id);
    const getState = (s: any) => s;

    return {
      card: selectCard(state, props.id),
      article,
      featureFlagPageViewData: selectFeatureValue(
        getState(state),
        'page-view-data-visualisation'
      )
    };
  };
};

export default connect(mapStateToProps)(SnapLink);
