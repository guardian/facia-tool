import React from 'react';
import { Field } from 'redux-form';
import ConditionalComponent from 'components/layout/ConditionalComponent';
import { BaseFieldProps } from 'redux-form';

interface Props extends BaseFieldProps {
  permittedFields?: string[];
  container?: React.ComponentType;
  // @TODO – a hack to get around some odd type conflicts w/ React 18.
  component: any;
}

const ConditionalField = <P extends {}>(props: Props & P) => {
  const FieldComponent = <Field<Props & P> {...props} />;
  const Component = props.Container ? (
    <props.Container>{FieldComponent}</props.Container>
  ) : (
    FieldComponent
  );
  return (
    <ConditionalComponent
      name={props.name}
      permittedNames={props.permittedFields}
    >
      {Component}
    </ConditionalComponent>
  );
};

export default ConditionalField;
