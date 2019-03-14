import React from 'react';
import { theme, styled } from 'shared/constants/theme';
import { connect } from 'react-redux';
import { WrappedFieldProps } from 'redux-form';
import { events } from 'services/GA';

import ButtonDefault from './ButtonDefault';
import InputContainer from './InputContainer';
import InputBase from './InputBase';
import InputLabel from './InputLabel';
import DragIntentContainer from '../DragIntentContainer';
import { GridModal } from 'components/GridModal';
import {
  validateImageEvent,
  validateMediaItem,
  validateImageSrc
} from '../../util/validateImageSrc';
import { gridUrlSelector } from 'selectors/configSelectors';
import { State } from 'types/State';
import { GridData, Criteria } from 'shared/types/Grid';
import { RubbishBinIcon, AddImageIcon } from '../icons/Icons';

const ImageContainer = styled('div')<{
  size?: 'small';
  isHovering?: boolean;
}>`
  position: relative;
  width: 100%;
  max-width: ${props => (props.size === 'small' ? '100px' : '180px')};
  height: ${props => (props.size === 'small' ? '60px' : '115px')};
  background-size: cover;
  transition: background-color 0.15s;
  border-left: ${props =>
    props.isHovering
      ? `4px solid ${theme.base.colors.highlightColor}`
      : 'none'};
`;

const AddImageViaGridModalButton = styled(ButtonDefault)`
  height: 50%;
  width: 100%;
  border-bottom: ${props =>
    `1px solid ${props.theme.shared.base.colors.backgroundColor}`};
  background-color: ${props => props.theme.shared.colors.greyLight};
  :hover {
    background-color: ${props => props.theme.shared.colors.greyLightPinkish};
  }
`;

const AddImageViaUrlInput = styled(InputContainer)`
  padding: 11px 5px 5px 5px;
  height: 50%;
  background-color: ${props => props.theme.shared.colors.greyLight};
`;

const ImageUrlInput = styled(InputBase)`
  ::placeholder {
    font-size: 12px;
  }
`;

const Label = styled(InputLabel)`
  cursor: pointer;
  display: inline-block;
  color: ${props => props.theme.shared.base.colors.textLight};
  padding-inline-start: 5px;
  vertical-align: super;
`;

const ButtonDelete = styled(ButtonDefault)`
  position: absolute;
  display: block;
  top: 6px;
  right: 6px;
  height: 32px;
  width: 32px;
  text-align: center;
  padding: 0;
  border-radius: 24px;
`;

const IconDelete = styled('div')`
  display: block;
  position: absolute;
  height: 14px;
  width: 14px;
  top: 9px;
  left: 9px;
`;

export interface InputImageContainerProps {
  frontId: string;
  criteria?: Criteria;
  size?: 'small';
}

type ComponentProps = InputImageContainerProps &
  WrappedFieldProps & { gridUrl: string | null };

interface ComponentState {
  isHovering: boolean;
  modalOpen: boolean;
  imageSrc: string;
}

class InputImage extends React.Component<ComponentProps, ComponentState> {
  public state = {
    isHovering: false,
    modalOpen: false,
    imageSrc: ''
  };

  public handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    events.imageAdded(this.props.frontId, 'drop');
    e.preventDefault();
    e.persist();
    validateImageEvent(e, this.props.frontId, this.props.criteria)
      .then(this.props.input.onChange)
      .catch(err => {
        alert(err);
        // tslint:disable-next-line no-console
        console.log('@todo:handle error', err);
      });
  };

  public handlePasteImgSrcInputChange = (
    e: React.FormEvent<HTMLInputElement>
  ) => {
    e.preventDefault();
    this.setState({ imageSrc: e.currentTarget.value });
  };

  public handlePasteImgSrcInputSubmit = (e: React.KeyboardEvent) => {
    events.imageAdded(this.props.frontId, 'paste');
    e.persist();
    if (e.keyCode === 13) {
      e.preventDefault();
      validateImageSrc(
        this.state.imageSrc,
        this.props.frontId,
        this.props.criteria
      )
        .then(mediaItem => {
          this.props.input.onChange(mediaItem);
        })
        .catch(err => {
          alert(err);
          // tslint:disable-next-line no-console
          console.log('@todo:handle error', err);
        });
      this.setState({ imageSrc: '' });
    }
  };

  public handleAdd = () => {
    // @todo: grid integration
  };
  public clearField = () => this.props.input.onChange(null);

  public validMessage(data: GridData) {
    return data && data.crop && data.crop.data && data.image && data.image.data;
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

    return validateMediaItem(
      crop,
      imageOrigin,
      this.props.frontId,
      this.props.criteria
    )
      .then(mediaItem => {
        events.imageAdded(this.props.frontId, 'click to modal');
        this.props.input.onChange(mediaItem);
      })
      .catch(err => {
        alert(err);
        // tslint:disable-next-line no-console
        console.log('@todo:handle error', err);
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
        <DragIntentContainer
          active
          onIntentConfirm={() => this.setState({ isHovering: true })}
          onDragIntentStart={() => this.setState({ isHovering: true })}
          onDragIntentEnd={() => this.setState({ isHovering: false })}
        >
          <ImageContainer
            onDrop={this.handleDrop}
            isHovering={this.state.isHovering}
            {...this.props}
            style={{
              backgroundImage:
                this.props.input.value && `url(${this.props.input.value.thumb}`
            }}
          >
            {!!this.props.input.value && !!this.props.input.value.thumb ? (
              <ButtonDelete type="button" priority="primary">
                {this.props.input.value ? (
                  <IconDelete
                    onClick={event => {
                      event.stopPropagation();
                      this.clearField();
                    }}
                  >
                    <RubbishBinIcon size="s" />
                  </IconDelete>
                ) : null}
              </ButtonDelete>
            ) : (
              <>
                <AddImageViaGridModalButton
                  type="button"
                  priority="muted"
                  onClick={this.openModal}
                >
                  <AddImageIcon size="l" />
                  <Label size="sm">Add image</Label>
                </AddImageViaGridModalButton>

                <AddImageViaUrlInput>
                  <ImageUrlInput
                    name="paste-url"
                    placeholder="Paste URL or embed code"
                    defaultValue={this.state.imageSrc}
                    onKeyDown={this.handlePasteImgSrcInputSubmit}
                    onChange={this.handlePasteImgSrcInputChange}
                  />
                  <InputLabel hidden htmlFor="paste-url">
                    Paste URL or embed code
                  </InputLabel>
                </AddImageViaUrlInput>
              </>
            )}
          </ImageContainer>
        </DragIntentContainer>
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
