import React from 'react';
import { WrappedFieldProps } from 'redux-form';
import { StyledProps } from 'styled-components';
import clamp from 'lodash/clamp';

import InputLabel from './InputLabel';
import InputContainer from './InputContainer';
import { RewindIcon } from '../icons/Icons';
import { styled } from 'constants/theme';
import { runRules } from './richtext/cleanerHelpers';
import { onKeyPressRules } from './richtext/cleanerRules';

type Props = {
  label?: string;
  // If provided, the user can revert to this value by clicking the 'rewind' button.
  originalValue?: string;
  component: React.Component<
    React.HTMLAttributes<HTMLInputElement> & StyledProps<any>
  >;
  labelContent?: React.Component<{}>;
  type?: string;
} & WrappedFieldProps;

interface State {
  inputHeight: number | string;
}

const RewindButton = styled.button.attrs({
  type: 'button',
})`
  background: transparent;
  align-self: center;
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

const TextInputLabel = styled(InputLabel)`
  display: ${(props) => (props.hidden ? 'none' : 'flex')};
  align-items: flex-end;
`;

const InputComponentContainer = styled.div`
  position: relative;
  &:hover {
    ${RewindButton} {
      display: block;
    }
  }
`;

const createResizeableTextInput = (
  Component: React.ComponentType<any>,
  type?: string,
  maxAutoResizeHeight: number = 120
) => {
  return class ResizeableTextInput extends React.Component<Props, State> {
    private inputElement: React.RefObject<HTMLInputElement>;
    constructor(props: Props) {
      super(props);
      this.inputElement = React.createRef();
      this.state = { inputHeight: 'auto' };
    }

    public componentDidMount() {
      this.updateHeight();
    }

    public componentDidUpdate(prevProps: Props) {
      if (prevProps.input.value !== this.props.input.value) {
        this.updateHeight();
      }
    }

    public updateHeight() {
      if (
        this.inputElement.current &&
        this.inputElement.current.type === 'textarea'
      ) {
        this.setState({
          inputHeight: clamp(
            this.inputElement.current.scrollHeight,
            0,
            maxAutoResizeHeight
          ),
        });
      }
    }

    public render() {
      const { label, input, originalValue, labelContent, ...rest } = this.props;
      return (
        <InputContainer>
          {label && (
            <TextInputLabel htmlFor={label}>
              <span>{label}</span>
              {originalValue && input.value !== originalValue && (
                <RewindButton onClick={() => input.onChange(originalValue)}>
                  <RewindIcon />
                </RewindButton>
              )}
              {labelContent}
            </TextInputLabel>
          )}
          <InputComponentContainer>
            <Component
              ref={this.inputElement}
              style={{ height: this.state.inputHeight }}
              id={label}
              {...input}
              {...rest}
              onChange={this.onChange}
              type={type}
            />
          </InputComponentContainer>
        </InputContainer>
      );
    }

    private onChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
      const { current } = this.inputElement;
      if (!current) {
        return;
      }

      // We mutate our input imperatively to ensure that asynchronous state updates
      // (for example, from redux) do not disturb the cursor state.

      const { value, selectionEnd } = e.target as HTMLInputElement;
      const { cleanedText, offset } = this.cleanText(value, selectionEnd || 0);

      if (cleanedText !== value) {
        const caretStart = (current.selectionStart || 0) - offset;
        const caretEnd = (current.selectionEnd || 0) - offset;
        current.value = cleanedText;
        current.setSelectionRange(caretStart, caretEnd);
      }
      this.props.input.onChange(e);
    };

    private cleanText = (text: string, selectionEnd: number) => {
      // We only apply the keypress rules to the last character typed – see Prosemirror's
      // `InputRule` for more detail (https://github.com/ProseMirror/prosemirror-inputrules).
      const before = text.substring(0, selectionEnd);
      const after = text.substring(selectionEnd);
      const cleanedBefore = runRules(onKeyPressRules)(before);
      const cleanedText = cleanedBefore + after;
      const offset = before.length - cleanedBefore.length;

      return { cleanedText, offset };
    };
  };
};

export { createResizeableTextInput };
