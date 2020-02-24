import React from 'react';
import { styled, theme } from 'constants/theme';

import CardBody from 'components/card/CardBody';
import ButtonCircularCaret from 'components/inputs/ButtonCircularCaret';
import CardContainer from 'components/card/CardContainer';
import CardContent from 'components/card/CardContent';
import CardMetaContainer from 'components/card/CardMetaContainer';
import DragIntentContainer from 'components/DragIntentContainer';
import { dragEventIsBlacklisted } from 'lib/dnd/Level';
import { collectionDropTypeBlacklist } from 'constants/fronts';

const SublinkCardBody = styled(CardBody)<{
  dragHoverActive: boolean;
}>`
  display: flex;
  min-height: 30px;
  border-top: 1px solid ${theme.colors.greyLightPinkish};
  background-color: ${({ dragHoverActive }) =>
    dragHoverActive ? theme.card.backgroundHover : theme.colors.white};
  flex-direction: row;
  span {
    font-size: 12px;
    font-weight: normal;
  }
  :hover {
    background-color: ${theme.card.backgroundHover};
  }
`;

const SublinkCardContent = styled(CardContent)<{
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
            delay={100}
            filterRegisterEvent={this.dragEventNotBlacklisted}
            onIntentConfirm={() => {
              toggleShowArticleSublinks();
            }}
          >
            <CardContainer
              draggable={false}
              onClick={toggleShowArticleSublinks}
            >
              <SublinkCardBody dragHoverActive={this.state.dragHoverActive}>
                {!isClipboard && <CardMetaContainer />}
                <SublinkCardContent displaySize="small" showMeta={isClipboard}>
                  <span>
                    {numSupportingArticles} sublink
                    {numSupportingArticles > 1 && 's'}
                    <ButtonCircularCaret
                      openDir={showArticleSublinks ? 'up' : 'down'}
                      clear={true}
                    />
                  </span>
                </SublinkCardContent>
              </SublinkCardBody>
            </CardContainer>
          </DragIntentContainer>
        )}
      </>
    );
  }

  private dragEventNotBlacklisted = (e: React.DragEvent) =>
    !dragEventIsBlacklisted(e, collectionDropTypeBlacklist);
}

export default Sublinks;
