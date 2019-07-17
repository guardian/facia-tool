import React from 'react';
import { styled, theme } from 'constants/theme';

import CollectionItemBody from 'shared/components/collectionItem/CollectionItemBody';
import ButtonCircularCaret from 'shared/components/input/ButtonCircularCaret';
import CollectionItemContainer from 'shared/components/collectionItem/CollectionItemContainer';
import CollectionItemContent from 'shared/components/collectionItem/CollectionItemContent';
import CollectionItemMetaContainer from 'shared/components/collectionItem/CollectionItemMetaContainer';
import DragIntentContainer from 'shared/components/DragIntentContainer';
import { dragEventIsBlacklisted } from 'lib/dnd/Level';
import { collectionDropTypeBlacklist } from 'constants/fronts';

const SublinkCollectionItemBody = styled(CollectionItemBody)<{
  dragHoverActive: boolean;
}>`
  display: flex;
  min-height: 30px;
  border-top: 1px solid ${theme.shared.colors.greyLightPinkish};
  background-color: ${({ dragHoverActive }) =>
    dragHoverActive
      ? theme.shared.collectionItem.backgroundHover
      : theme.shared.colors.white};
  flex-direction: row;
  span {
    font-size: 12px;
    font-weight: normal;
  }
  :hover {
    background-color: ${theme.shared.collectionItem.backgroundHover};
  }
`;

const SublinkCollectionItemContent = styled(CollectionItemContent)<{
  showMeta: boolean;
}>`
  width: ${({ showMeta: showMeta }) =>
    showMeta ? `auto` : `calc(100% - 100px)`};
  padding-left: 8px;
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
            delay={600}
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
              >
                {!isClipboard && <CollectionItemMetaContainer />}
                <SublinkCollectionItemContent
                  displaySize="small"
                  showMeta={isClipboard}
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
    !dragEventIsBlacklisted(e, collectionDropTypeBlacklist);
}

export default Sublinks;
