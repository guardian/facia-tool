import React from 'react';
import { styled } from 'shared/constants/theme';

import CollectionItemBody from 'shared/components/collectionItem/CollectionItemBody';
import ButtonCircularCaret from 'shared/components/input/ButtonCircularCaret';
import CollectionItemContainer from 'shared/components/collectionItem/CollectionItemContainer';
import CollectionItemContent from 'shared/components/collectionItem/CollectionItemContent';
import CollectionItemMetaContainer from 'shared/components/collectionItem/CollectionItemMetaContainer';
import DragIntentContainer from 'shared/components/DragIntentContainer';
import { collectionDropZoneBlacklist } from 'constants/fronts';
import { dragEventIsBlacklisted } from 'lib/dnd/Level';

const SublinkCollectionItemBody = styled(CollectionItemBody)<{
  dragHoverActive: boolean;
  isClipboard: boolean;
}>`
  display: flex;
  min-height: 30px;
  border: ${({ isClipboard }) => (isClipboard ? 'none' : '1px solid #c9c9c9')};
  background-color: ${({ isClipboard, dragHoverActive }) =>
    dragHoverActive ? `#ededed` : isClipboard ? '#f6f6f6' : '#fff'};
  flex-direction: ${({ isClipboard }) => (isClipboard ? 'column' : 'row')};
  span {
    font-size: 12px;
    font-weight: bold;
  }
  :hover {
    background-color: #ededed;
  }
`;

const SublinkCollectionItemContent = styled(CollectionItemContent)<{
  isClipboard: boolean;
}>`
  width: ${({ isClipboard }) => (isClipboard ? `auto` : `calc(100% - 100px)`)};
  padding-left: ${({ isClipboard }) => (isClipboard ? `2px` : `8px`)};
`;

const SupportingDivider = styled('hr')`
  border: 0;
  border-top: 1px solid #ccc;
  margin: 0.5em 0 0.25em;
  width: 50%;
`;

interface SublinkProps {
  numSupportingArticles: number;
  toggleShowArticleSublinks: (e?: React.MouseEvent) => void;
  showArticleSublinks: boolean;
  parentId: string;
}

class Sublinks extends React.Component<SublinkProps> {
  public state = {
    dragHoverActive: false
  };

  public render() {
    const {
      numSupportingArticles,
      toggleShowArticleSublinks,
      showArticleSublinks,
      parentId
    } = this.props;

    const isClipboard = parentId === 'clipboard';
    return (
      <>
        {numSupportingArticles > 0 && (
          <DragIntentContainer
            active={!showArticleSublinks}
            onDragIntentStart={() => {
              this.setState({ dragHoverActive: true });
            }}
            onDragIntentEnd={() => {
              this.setState({ dragHoverActive: false });
            }}
            delay={300}
            filterRegisterEvent={this.dragEventNotBlacklisted}
            onIntentConfirm={() => {
              toggleShowArticleSublinks();
            }}
          >
            <CollectionItemContainer
              draggable={false}
              onClick={toggleShowArticleSublinks}
            >
              <SublinkCollectionItemBody
                dragHoverActive={this.state.dragHoverActive}
                isClipboard={isClipboard}
              >
                {!isClipboard && <CollectionItemMetaContainer />}
                {isClipboard && <SupportingDivider />}
                <SublinkCollectionItemContent
                  displaySize="small"
                  displayType="default"
                  isClipboard={isClipboard}
                >
                  <span>
                    {numSupportingArticles} sublink
                    {numSupportingArticles > 1 && 's'}
                    <ButtonCircularCaret
                      openDir={showArticleSublinks ? 'up' : 'down'}
                      clear={true}
                    />
                  </span>
                </SublinkCollectionItemContent>
              </SublinkCollectionItemBody>
            </CollectionItemContainer>
          </DragIntentContainer>
        )}
      </>
    );
  }

  private dragEventNotBlacklisted = (e: React.DragEvent) =>
    !dragEventIsBlacklisted(e, collectionDropZoneBlacklist);
}

export default Sublinks;
