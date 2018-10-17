import React from 'react';
import styled from 'styled-components';
import { ActionError } from 'types/Action';
import { error } from '../styleConstants';

interface Props {
  error: ActionError
}

const ErrorContainer = styled('div')`
  background-color: ${error.primary};
  font-weight: 50;
  padding: 5px;
`;

const ErrorBanner = (props: Props) => {
  if (props.error) {
    return <ErrorContainer>{props.error}</ErrorContainer>;
  }
  return null;
};

export default ErrorBanner;
