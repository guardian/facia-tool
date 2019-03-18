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
  small?: boolean;
  isHovering?: boolean;
}>`
  position: relative;
  width: 100%;
  max-width: ${props => (props.small ? '100px' : '180px')};
  height: ${props => (props.small ? '60px' : '115px')};
  background-size: cover;
  transition: background-color 0.15s;
  border-left: ${props =>
    props.isHovering
      ? `4px solid ${theme.base.colors.highlightColor}`
      : 'none'};
`;

const AddImageViaGridModalButton = styled(ButtonDefault)<{
  small?: boolean;
}>`
  height: ${props => (!!props.small ? '100%' : '50%')};
  background-size: cover;
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

const ButtonDelete = styled(ButtonDefault)<{
  small?: boolean;
}>`
  position: absolute;
  display: block;
  top: ${props => (props.small ? '2px' : '6px')};
  right: ${props => (props.small ? '2px' : '6px')};
  height: ${props => (props.small ? '24px' : '32px')};
  width: ${props => (props.small ? '24px' : '32px')};
  text-align: center;
  padding: 0;
  border-radius: 24px;
`;

const IconDelete = styled('div')<{
  small?: boolean;
}>`
  display: block;
  position: absolute;
  height: 14px;
  width: 14px;
  top: ${props => (props.small ? '5px' : '9px')};
  left: ${props => (props.small ? '5px' : '9px')};
`;

export interface InputImageContainerProps {
  frontId: string;
  criteria?: Criteria;
  small?: boolean;
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

  public handlePasteImgSrcChange = (e: React.FormEvent<HTMLInputElement>) => {
    e.preventDefault();
    this.setState({ imageSrc: e.currentTarget.value });
  };

  public handlePasteImgSrcSubmit = (keyCode: number) => (
    e: React.KeyboardEvent
  ) => {
    events.imageAdded(this.props.frontId, 'paste');
    e.persist();
    if (e.keyCode === keyCode) {
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
    const { small, input, gridUrl } = this.props;
    const gridSearchUrl = `${gridUrl}?cropType=landscape`;
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
            small={small}
            style={{
              backgroundImage: input.value && `url(${input.value.thumb}`
            }}
          >
            {!!input.value && !!input.value.thumb ? (
              <ButtonDelete type="button" priority="primary" small={small}>
                {input.value ? (
                  <IconDelete
                    small={small}
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
                  small={small}
                >
                  <AddImageIcon size="l" />
                  {!!small ? null : <Label size="sm">Add image</Label>}
                </AddImageViaGridModalButton>

                {!!small ? null : (
                  <AddImageViaUrlInput>
                    <ImageUrlInput
                      name="paste-url"
                      placeholder=" Paste crop url from Grid"
                      defaultValue={this.state.imageSrc}
                      onKeyDown={this.handlePasteImgSrcSubmit(13)}
                      onChange={this.handlePasteImgSrcChange}
                    />
                    <InputLabel hidden htmlFor="paste-url">
                      Paste crop url from Grid
                    </InputLabel>
                  </AddImageViaUrlInput>
                )}
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
