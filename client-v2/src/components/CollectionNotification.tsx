import React from 'react';
import { styled } from 'constants/theme';

import { AlsoOnDetail } from 'types/Collection';
import Button from 'shared/components/input/ButtonDefault';

interface CollectionNotificationProps {
  alsoOn: AlsoOnDetail;
  displayEditWarning: boolean;
}

interface ComponentState {
  showFrontDetails: boolean;
}

const WarningText = styled('span')`
  font-weight: bold;
  color: ${({ theme }) => theme.shared.colors.orangeDark};
`;

const ToggleDetailsButton = Button.extend`
  position: relative;
  z-index: 5;
`;

const AlsoOnLinksWrapper = styled('div')`
  position: relative;
  z-index: 5;
`;

class CollectionNotification extends React.Component<
  CollectionNotificationProps,
  ComponentState
> {
  public state = {
    showFrontDetails: false
  };

  public render() {
    const { alsoOn, displayEditWarning } = this.props;
    if (displayEditWarning) {
      return (
        <div>
          <WarningText>
            Warning: do not change or delete this container. Please speak to
            Central Production.
          </WarningText>
        </div>
      );
    }

    if (alsoOn.fronts.length > 0) {
      return (
        <div>
          {alsoOn.meritsWarning && (
            <span>
              <WarningText>Warning</WarningText>
              <br />
              Also on{' '}
              {alsoOn.priorities.map((priority, index) => (
                <strong key={priority}>
                  {' '}
                  {priority}
                  {index !== alsoOn.priorities.length - 1 && ','}
                </strong>
              ))}{' '}
              fronts.
            </span>
          )}
          {!alsoOn.meritsWarning && <span>Also on other fronts.</span>}
          &nbsp;
          <ToggleDetailsButton
            tabIndex={-1}
            size="s"
            onClick={e => {
              e.stopPropagation();
              return this.setState({
                showFrontDetails: !this.state.showFrontDetails
              });
            }}
          >
            {this.state.showFrontDetails ? 'Hide Details' : 'Show More'}
          </ToggleDetailsButton>
          {this.state.showFrontDetails && (
            <AlsoOnLinksWrapper>
              {alsoOn.fronts.map(front => (
                <div key={front.id}>{front.id}</div>
              ))}
            </AlsoOnLinksWrapper>
          )}
        </div>
      );
    }
    return null;
  }
}

export default CollectionNotification;
