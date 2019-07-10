import React from 'react';
import { WrappedFieldProps } from 'redux-form';
import { StyledProps } from 'styled-components';

import InputLabel from './InputLabel';
import InputContainer from './InputContainer';
import { RewindIcon } from '../icons/Icons';
import { styled } from 'constants/theme';

type Props = {
  label?: string;
  // If provided, the user can revert to this value by clicking the 'rewind' button.
  originalValue?: string;
  component: React.Component<
    React.HTMLAttributes<HTMLInputElement> & StyledProps<any>
  >;
  type?: string;
} & WrappedFieldProps;

interface State {
  inputHeight: number;
}

const RewindButton = styled.button.attrs({
  type: 'button'
})`
  background: transparent;
  display: inline-block;
  border: none;
  opacity: 0.5;
  cursor: pointer;
  &:hover {
    opacity: 1;
  }
  &:active,
  &:focus {
    outline: none;
  }
`;

const InputComponentContainer = styled.div`
  position: relative;
  &:hover {
    ${RewindButton} {
      display: block;
    }
  }
`;

export default (
  Component: new (props: any) => React.Component<
    React.HTMLAttributes<HTMLInputElement> & StyledProps<any>
  >,
  type?: string
) => {
  return class extends React.Component<Props, State> {
    private inputElement: React.RefObject<HTMLInputElement>;
    constructor(props: Props) {
      super(props);
      this.inputElement = React.createRef();
      this.state = { inputHeight: 36 };
    }

    public componentDidMount() {
      this.updateHeight();
    }

    public componentDidUpdate(prevProps: Props) {
      if (prevProps !== this.props) {
        this.updateHeight();
      }
    }

    public updateHeight() {
      this.setState({
        inputHeight: this.inputElement.current
          ? this.inputElement.current.scrollHeight
          : this.state.inputHeight
      });
    }

    public render() {
      const { label, input, originalValue, ...rest } = this.props;
      return (
        <InputContainer>
          {label && (
            <InputLabel htmlFor={label}>
              {label}
              {originalValue && input.value !== originalValue && (
                <RewindButton onClick={() => input.onChange(originalValue)}>
                  <RewindIcon />
                </RewindButton>
              )}
            </InputLabel>
          )}
          <InputComponentContainer>
            <Component
              innerRef={this.inputElement}
              style={{ height: this.state.inputHeight }}
              id={label}
              {...input}
              {...rest}
              type={type}
            />
          </InputComponentContainer>
        </InputContainer>
      );
    }
  };
};
