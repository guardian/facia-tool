import React from 'react';
import { Field } from 'redux-form';
import ConditionalComponent from 'components/layout/ConditionalComponent';
import { BaseFieldProps } from 'redux-form';

interface Props extends BaseFieldProps {
  permittedFields?: string[];
  container?: React.ComponentType;
}

const ConditionalField = <P extends {}>({
  container: Container,
  ...rest
}: Props & P) => {
  const FieldComponent = <Field<Props & P> {...rest} />;
  const Component = Container ? (
    <Container>{FieldComponent}</Container>
  ) : (
    FieldComponent
  );
  return (
    <ConditionalComponent
      name={rest.name}
      permittedNames={rest.permittedFields}
    >
      {Component}
    </ConditionalComponent>
  );
};

export default ConditionalField;
