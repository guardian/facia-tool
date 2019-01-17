import React from 'react';
import { WrappedFieldProps } from 'redux-form';
import Button from 'shared/components/input/ButtonDefault';

type Props = {
  buttonText: string;
} & WrappedFieldProps;

export default ({ buttonText, ...rest }: Props) => (
  <Button type="button" priority="muted" pill {...rest}>
    {buttonText}
  </Button>
);
