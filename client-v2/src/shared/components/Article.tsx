import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import distanceInWords from 'date-fns/distance_in_words_to_now';
import noop from 'lodash/noop';
import startCase from 'lodash/startCase';

import ShortVerticalPinline from 'shared/components/layout/ShortVerticalPinline';
import toneColorMap from 'shared/util/toneColorMap';
import { HoverActionsButtonWrapper } from 'shared/components/input/HoverActionButtonWrapper';
import {
  HoverDeleteButton,
  HoverViewButton,
  HoverOphanButton
} from 'shared/components/input/HoverActionButtons';

import {
  createArticleFromArticleFragmentSelector,
  selectSharedState
} from '../selectors/shared';
import { State } from '../types/State';
import { DerivedArticle } from '../types/Article';

interface ArticleComponentProps {
  id: string;
  draggable?: boolean;
  fade?: boolean;
  onDragStart?: (d: React.DragEvent<HTMLElement>) => void;
  onDragOver?: (d: React.DragEvent<HTMLElement>) => void;
  onDrop?: (d: React.DragEvent<HTMLElement>) => void;
  onDelete?: (uuid: string) => void;
  onClick?: () => void;
}

interface ContainerProps extends ArticleComponentProps {
  selectSharedState?: (state: any) => State;
}

type ComponentProps = {
  article: DerivedArticle | void;
  size?: 'default' | 'small';
  children: ReactNode;
} & ContainerProps;

const HoverActionsAreaOverlay = styled('div')`
  display: flex;
  justify-content: space-between;
  padding: 4px 8px;
`;

const HideMetaDataOnToolTipDisplay = styled('div')<{
  size?: string; // Article Component size
}>`
  background-color: #ededed;
  position: absolute;

  width: 70px;
  height: ${({ size }) => (size === 'small' ? '90%' : '180%')};
  margin: 2px;
  bottom: 0;
  left: 0;
  right: 0;
`;

const Thumbnail = styled('div')`
  width: 130px;
  height: 83px;
  background-size: cover;
`;

const Tone = styled('div')`
  padding-top: 2px;
  font-size: 12px;
  font-family: TS3TextSans-Bold;
`;

const ArticleContainer = styled('div')`
  background-color: #fff;
`;

const ArticleBodyContainer = styled('div')<{
  transitionTime?: number;
  fade?: boolean;
}>`
  display: flex;
  position: relative;
  border-top: 1px solid #333;
  min-height: 35px;
  cursor: pointer;
  position: relative;
  opacity: ${({ fade }) => (fade ? 0.5 : 1)};

  ${HoverActionsAreaOverlay} {
    bottom: 0;
    left: 0;
    right: 0;
    position: absolute;
    visibility: hidden;
    transition: opacity ${({ transitionTime }) => transitionTime}s,
      visibility 0s linear ${({ transitionTime }) => transitionTime}s;
    opacity: 0;
    ${HideMetaDataOnToolTipDisplay} {
      visibility: hidden;
    }
  }

  ${Tone} {
    transition: color ${({ transitionTime }) => transitionTime}s;
  }

  ${Thumbnail} {
    transition: opacity ${({ transitionTime }) => transitionTime}s;
  }

  :hover {
    background-color: #ededed;

    ${Tone} {
      color: #999;
    }

    ${Thumbnail} {
      opacity: 0.2;
    }

    ${HoverActionsAreaOverlay} {
      transition-delay: 0s;
      visibility: visible;
      opacity: 1;
      ${HideMetaDataOnToolTipDisplay} {
        visibility: visible;
      }
    }
  }
`;

ArticleBodyContainer.defaultProps = {
  transitionTime: 0.3
};

const ArticleMetaContainer = styled('div')`
  position: relative;
  width: 80px;
  padding: 0px 8px;
`;

const ArticleContentContainer = styled('div')`
  position: relative;
  width: calc(100% - 210px);
  margin-top: 2px;
  padding: 0 8px;
`;

const KickerHeading = styled('span')`
  font-size: 16px;
  font-family: GHGuardianHeadline-Bold;
`;

const ArticleHeading = styled('span')`
  font-size: 16px;
  font-family: GhGuardianHeadline-Medium;
`;

const ArticleHeadingSmall = ArticleHeading.extend`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Trail = styled('div')`
  width: 100%;
  margin-top: 3px;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: TS3TextSans;
`;

const ArticleHeadingContainerSmall = styled('div')`
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const FirstPublished = styled('div')`
  font-size: 12px;
  margin: 2px 0;
`;

const ArticleComponent = ({
  article,
  size = 'default',
  fade = false,
  draggable = false,
  onDragStart = noop,
  onDragOver = noop,
  onDrop = noop,
  onDelete = noop,
  onClick = noop,
  children
}: ComponentProps) => {
  if (!article) {
    return null;
  }
  const ArticleHeadingContainer =
    size === 'small' ? ArticleHeadingContainerSmall : React.Fragment;
  return (
    <ArticleContainer
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={onClick}
    >
      <ArticleBodyContainer
        fade={fade}
        key={article.headline}
        style={{
          borderTopColor:
            size === 'default' ? toneColorMap[article.tone] : '#c9c9c9'
        }}
      >
        <ArticleMetaContainer>
          {size === 'default' && <Tone>{startCase(article.tone)}</Tone>}
          {article.firstPublicationDate && (
            <FirstPublished>
              {distanceInWords(new Date(article.firstPublicationDate))}
            </FirstPublished>
          )}
          <ShortVerticalPinline />
        </ArticleMetaContainer>
        <ArticleContentContainer>
          <ArticleHeadingContainer>
            <KickerHeading style={{ color: toneColorMap[article.tone] }}>
              {article.kicker}
            </KickerHeading>
            &nbsp;
            {size === 'default' ? (
              <ArticleHeading>{article.headline}</ArticleHeading>
            ) : (
              <ArticleHeadingSmall>{article.headline}</ArticleHeadingSmall>
            )}
          </ArticleHeadingContainer>
          {size === 'default' &&
            article.trailText && <Trail>{article.trailText}</Trail>}
          <div>
            {!article.isLive &&
              (article.firstPublicationDate ? 'Taken Down' : 'Draft')}
          </div>
        </ArticleContentContainer>
        {size === 'default' && (
          <Thumbnail
            style={{
              backgroundImage: `url('${article.thumbnail}')`
            }}
          />
        )}
        <HoverActionsAreaOverlay>
          <HoverActionsButtonWrapper
            buttons={[
              { text: 'View', component: HoverViewButton },
              { text: 'Ophan', component: HoverOphanButton }
            ]}
            buttonProps={{
              isLive: article.isLive,
              urlPath: article.urlPath,
              onDelete
            }}
            size={size}
            toolTipPosition={'top'}
            toolTipAlign={'left'}
          />
          <HoverActionsButtonWrapper
            buttons={[{ text: 'Delete', component: HoverDeleteButton }]}
            buttonProps={{
              isLive: article.isLive,
              urlPath: article.urlPath,
              onDelete
            }}
            size={size}
            toolTipPosition={'top'}
            toolTipAlign={'right'}
          />
          <HideMetaDataOnToolTipDisplay size={size} className="tada" />
        </HoverActionsAreaOverlay>
      </ArticleBodyContainer>
      {children}
    </ArticleContainer>
  );
};

const createMapStateToProps = () => {
  const articleSelector = createArticleFromArticleFragmentSelector();
  return (
    state: State,
    props: ContainerProps
  ): { article: DerivedArticle | void } => ({
    article: articleSelector(
      props.selectSharedState
        ? props.selectSharedState(state)
        : selectSharedState(state),
      props.id
    )
  });
};

export { ArticleComponentProps };

export default connect(createMapStateToProps)(ArticleComponent);
