import React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { WrappedFieldProps } from 'redux-form';
import deleteIcon from '../../images/icons/delete-copy.svg';
import ButtonDefault from './ButtonDefault';
import InputContainer from './InputContainer';
import { validateImageEvent, validateMediaItem } from '../../util/validateImageSrc';
import { GridModal } from 'components/GridModal';
import { gridUrlSelector } from 'selectors/configSelectors';
import { State } from 'types/State';
import { GridData, Criteria } from 'shared/types/Grid';

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

export interface InputImageContainerProps {
  frontId: string,
  criteria?: Criteria,
  size?: 'small'
}

type ComponentProps = InputImageContainerProps & WrappedFieldProps & { gridUrl: string | null }

interface ComponentState { isHovering: boolean, modalOpen: boolean }

class InputImage extends React.Component<ComponentProps, ComponentState> {
  public state = {
    isHovering: false,
    modalOpen: false
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
    validateImageEvent(e, this.props.frontId, this.props.criteria)
      .then(this.props.input.onChange)
      .catch(err => {
        alert(err);
        // tslint:disable-next-line no-console
        console.log('@todo:handle error', err)
      });

  };
  public handleAdd = () => {
    // @todo: grid integration
  };
  public clearField = () => this.props.input.onChange(null);

  public validMessage(data: GridData) {
    return data &&
           data.crop &&
           data.crop.data &&
           data.image &&
           data.image.data;
  }

  public onMessage = (event: MessageEvent) => {
    if (event.origin !== this.props.gridUrl) {
      // Log: did not come from the grid
      return;
    }

    const data: GridData = event.data;

    if (!data) {
      // TODO Log did not get data
      return;
    }

    if (!this.validMessage(data)) {
      // TODO Log not a valid message
      return;
    }

    this.closeModal();
    const crop = data.crop.data;
    const gridImage = data.image.data;
    const imageOrigin = `${this.props.gridUrl}/images/${gridImage.id}`;


    return validateMediaItem(crop, imageOrigin, this.props.frontId, this.props.criteria)
    .then(mediaItem => {
      this.props.input.onChange(mediaItem);
    })
    .catch(err => {
      alert(err);
        // tslint:disable-next-line no-console
        console.log('@todo:handle error', err)
    });
  };

  public closeModal = () => {
    this.setState({ modalOpen: false });
    window.removeEventListener('message', this.onMessage, false);
  };

  public openModal = () => {
    this.setState({ modalOpen: true });
    window.addEventListener('message', this.onMessage, false);
  };

  public render() {
    const gridSearchUrl = `${this.props.gridUrl}?cropType=landscape`;
    return (
      <InputContainer>
        <GridModal
          url={gridSearchUrl}
          isOpen={this.state.modalOpen}
          onClose={this.closeModal}
          onMessage={this.onMessage}
        />
        <ImageContainer
          onClick={this.openModal}
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
              <IconDelete
                src={deleteIcon}
                onClick={(event) => {
                  event.stopPropagation();
                  this.clearField()
                }}
              />
            ) : (
              <IconAdd src={deleteIcon} onClick={this.handleAdd} />
            )}
          </ButtonDelete>
        </ImageContainer>
      </InputContainer>
    );
  }
}

const mapStateToProps = (state: State) => {
  return {
    gridUrl: gridUrlSelector(state)
  };
};

export default connect(mapStateToProps)(InputImage);
