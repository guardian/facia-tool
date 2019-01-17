import React from 'react';
import styled from 'styled-components';

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
  color: #e05e00;
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
          <Button
            size="s"
            onClick={() =>
              this.setState({ showFrontDetails: !this.state.showFrontDetails })
            }
          >
            {this.state.showFrontDetails ? 'Hide Details' : 'Show More'}
          </Button>
          {this.state.showFrontDetails && (
            <div>
              {alsoOn.fronts.map(front => (
                <div key={front.id}>
                  <a href={`/v2/${front.priority}/${front.id}`}>{front.id}</a>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    return null;
  }
}

export default CollectionNotification;
