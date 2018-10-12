

import React from 'react';
import styled from 'styled-components';

import type { AlsoOnDetail } from 'types/Collection';
import ButtonSmall from 'shared/components/input/ButtonSmall';

type AlsoOnNotificationProps = {
  alsoOn: AlsoOnDetail
};

type ComponentState = {
  showFrontDetails: boolean
};

const WarningText = styled('span')`
  font-weight: bold;
  color: #e05e00;
`;

class AlsoOnNotification extends React.Component<
  AlsoOnNotificationProps,
  ComponentState
> {
  state = {
    showFrontDetails: false
  };

  render() {
    const { alsoOn } = this.props;
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
          <ButtonSmall
            size="xs"
            onClick={() =>
              this.setState({ showFrontDetails: !this.state.showFrontDetails })
            }
          >
            {this.state.showFrontDetails ? 'Hide Details' : 'Show More'}
          </ButtonSmall>
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

export default AlsoOnNotification;
