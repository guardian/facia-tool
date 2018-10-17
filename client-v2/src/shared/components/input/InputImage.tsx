import React from 'react';
import styled from 'styled-components';
import { WrappedFieldProps } from 'redux-form';

import deleteIcon from '../../images/icons/delete-copy.svg';
import ButtonDefault from './ButtonDefault';
import InputContainer from './InputContainer';
import { validateImageEvent } from '../../util/validateImageSrc';

const ImageContainer = styled('div')<{
  size?: 'small';
  isHovering: boolean;
}>`
  position: relative;
  width: 100%;
  max-width: ${props => (props.size === 'small' ? '100px' : '180px')};
  height: ${props => (props.size === 'small' ? '60px' : '115px')};
  background-color: ${props => (props.isHovering ? '#bbb' : '#ccc')};
  background-size: cover;
  transition: background-color 0.15s;
`;

const ButtonDelete = styled(ButtonDefault)`
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

const IconDelete = styled('img')`
  display: block;
  position: absolute;
  height: 10px;
  width: 10px;
  top: 7px;
  left: 7px;
`;

const IconAdd = IconDelete.extend`
  transform: rotate(45deg);
`;

type Props = {
  frontId?: string;
  criteria?: {
    minHeight?: string;
    minWidth?: string;
    widthAspectRatio?: number;
    heightAspectRatio?: number;
  };
} & WrappedFieldProps;
interface State { isHovering: boolean }

class InputImage extends React.Component<Props, State> {
  public state = {
    isHovering: false
  };

  public handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    this.setState({ isHovering: true });
  };
  public handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    this.setState({ isHovering: false });
  };
  public handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();
  public handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.persist();
    validateImageEvent(e, '@todo:frontId')
      .then(this.props.input.onChange)
      // tslint:disable-next-line no-console
      .catch(err => console.log('@todo:handle error', err));
  };
  public handleAdd = () => {
    // @todo: grid integration
  };
  public clearField = () => this.props.input.onChange(null);

  public render() {
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
          <ButtonDelete type="button" priority="primary">
            {this.props.input.value ? (
              <IconDelete src={deleteIcon} onClick={this.clearField} />
            ) : (
              <IconAdd src={deleteIcon} onClick={this.handleAdd} />
            )}
          </ButtonDelete>
        </ImageContainer>
      </InputContainer>
    );
  }
}

export default InputImage;
