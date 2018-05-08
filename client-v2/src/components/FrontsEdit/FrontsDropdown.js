// @flow

import React from 'react';
import styled from 'styled-components';
import type { RouterHistory } from 'react-router-dom';
import type { FrontConfig } from 'services/faciaApi';

type Props = {
  fronts: Array<FrontConfig>,
  frontId: ?string,
  history: RouterHistory,
  priority: string
};

const DropDownSelector = styled('select')`
  padding: 10px;
  margin-left: 5px;
  margin-top: 10px;
  border: 1px solid;
  height: 30px;
  font-size: 16px;
`;

const selectFront = (
  frontId: string,
  history: RouterHistory,
  priority: string
) => {
  const encodedUri = encodeURIComponent(frontId);
  history.push(`/${priority}/${encodedUri}`);
};

const renderSelectPrompt = (frontId: ?string) => {
  if (!frontId) {
    return <option value="">Choose a front...</option>;
  }
  return null;
};

const FrontsDropDown = (props: Props) => {
  if (!props.fronts) {
    return <div>Loading</div>;
  }

  return (
    <DropDownSelector
      value={props.frontId}
      onChange={e => selectFront(e.target.value, props.history, props.priority)}
    >
      {renderSelectPrompt(props.frontId)}
      {props.fronts.map(front => (
        <option value={front.id} key={front.id}>
          {front.id}
        </option>
      ))}
    </DropDownSelector>
  );
};

export type { Props };
export default FrontsDropDown;
