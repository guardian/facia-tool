// @flow

import React from 'react';

import type { AlsoOnDetail } from 'types/Collection';
import Button from 'shared/components/input/ButtonDefault';

type AlsoOnNotificationProps = {
  alsoOn: AlsoOnDetail
};

type ComponentState = {
  showFrontDetails: boolean
};

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
            <div>
              Warning: also on
              {alsoOn.priorities.map((priority, index) => (
                <span key={priority}>
                  {' '}
                  {priority}
                  {index !== alsoOn.priorities.length - 1 && ','}
                </span>
              ))}{' '}
              fronts.
            </div>
          )}
          {!alsoOn.meritsWarning && <div>Also on</div>}
          <Button
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

export default AlsoOnNotification;
