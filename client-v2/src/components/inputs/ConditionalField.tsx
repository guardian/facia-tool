import React from 'react';
import { Field } from 'redux-form';
import ConditionalComponent from 'components/layout/ConditionalComponent';
import { BaseFieldProps } from 'redux-form';

interface Props extends BaseFieldProps {
  permittedFields: string[];
}

const ConditionalField = <P extends {}>(props: Props & P) => (
  <ConditionalComponent
    name={props.name}
    permittedNames={props.permittedFields}
  >
    <Field<Props & P> {...props} />
  </ConditionalComponent>
);

export default ConditionalField;
