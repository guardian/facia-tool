// @flow

import React from 'react';
import ContentContainer from 'shared/components/layout/ContentContainer';
import ContainerHeadingPinline from 'shared/components/typography/ContainerHeadingPinline';
import ButtonPrimary from 'shared/components/input/ButtonPrimary';
import ButtonDefault from 'shared/components/input/ButtonDefault';
import styled from 'styled-components';

const CollectionFormContainer = ContentContainer.extend`
  flex: 1;
  width: 390px;
  margin-left: 10px;
`;

const CollectionHeadingPinline = ContainerHeadingPinline.extend`
  display: flex;
  margin-right: -11px;
`;

const ButtonContainer = styled('div')`
  margin-left: auto;
  line-height: 0;
`;

export default () => (
  <CollectionFormContainer>
    <CollectionHeadingPinline>
      Edit
      <ButtonContainer>
        <ButtonPrimary>Cancel</ButtonPrimary>
        <ButtonDefault>Save</ButtonDefault>
      </ButtonContainer>
    </CollectionHeadingPinline>
  </CollectionFormContainer>
);
