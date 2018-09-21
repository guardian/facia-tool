// @flow

import * as React from 'react';
import styled from 'styled-components';
import { type FieldProps } from 'redux-form';

import deleteIcon from '../../images/icons/delete-copy.svg';
import ButtonPrimary from './ButtonPrimary';
import InputContainer from './InputContainer';
import { validateImageEvent } from '../../util/validateImageSrc';

const ImageContainer = styled('div')`
  position: relative;
  width: 100%;
  max-width: ${props => (props.size === 'small' ? '100px' : '180px')};
  height: ${props => (props.size === 'small' ? '60px' : '115px')};
  background-color: ${props => (props.isHovering ? '#bbb' : '#ccc')};
  background-size: cover;
  transition: background-color 0.15s;
`;

const ButtonDelete = ButtonPrimary.extend`
  position: absolute;
  display: block;
  top: calc(50% - 12px);
  left: calc(50% - 12px);
  height: 24px;
  width: 24px;
  text-align: center;
  padding: 0;
  border-radius: 24px;
`;

const DeleteIcon = styled('img')`
  display: block;
  position: absolute;
  height: 10px;
  width: 10px;
  top: 7px;
  left: 7px;
`;

const AddIcon = DeleteIcon.extend`
  transform: rotate(45deg);
`;

type Props = {|
  criteria?: {
    minHeight?: string,
    minWidth?: string,
    widthAspectRatio?: number,
    heightAspectRatio?: number
  }
|} & FieldProps;
type State = {| isHovering: boolean |};

class InputImage extends React.Component<Props, State> {
  state = {
    isHovering: false
  };

  handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    this.setState({ isHovering: true });
  };
  handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    this.setState({ isHovering: false });
  };
  handleDragOver = (e: SyntheticEvent<HTMLElement>) => e.preventDefault();
  handleDrop = (e: SyntheticDragEvent<HTMLElement>) => {
    e.preventDefault();
    e.persist();
    validateImageEvent(e, '@todo:frontId')
      .then(this.props.input.onChange)
      .catch(err => console.log('@todo:handle error', err));
  };
  handleAdd = (e: Event) => {
    // @todo: grid integration
  };
  clearField = () => this.props.input.onChange(null);

  render() {
    return (
      <InputContainer>
        <ImageContainer
          onDragEnter={this.handleDragEnter}
          onDragLeave={this.handleDragLeave}
          onDragOver={this.handleDragOver}
          onDrop={this.handleDrop}
          isHovering={this.state.isHovering}
          {...this.props}
          style={{
            backgroundImage:
              this.props.input.value && `url(${this.props.input.value.src}`
          }}
        >
          <ButtonDelete type="button">
            {this.props.input.value ? (
              <DeleteIcon src={deleteIcon} onClick={this.clearField} />
            ) : (
              <AddIcon src={deleteIcon} onClick={this.handleAdd} />
            )}
          </ButtonDelete>
        </ImageContainer>
      </InputContainer>
    );
  }
}

export default InputImage;
