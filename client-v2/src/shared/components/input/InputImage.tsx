import React from 'react';
import { theme as globalTheme, styled } from 'shared/constants/theme';
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
import { selectGridUrl } from 'selectors/configSelectors';
import { State } from 'types/State';
import { GridData, Criteria } from 'shared/types/Grid';
import { RubbishBinIcon, AddImageIcon } from '../icons/Icons';
import imageDragIcon from 'images/icons/image-drag-icon.svg';
import { DRAG_DATA_GRID_IMAGE_URL } from 'constants/image';
import ImageDragIntentIndicator from '../ImageDragIntentIndicator';
import { EditMode } from 'types/EditMode';
import { selectEditMode } from '../../../selectors/pathSelectors';

const ImageContainer = styled('div')<{
  small?: boolean;
}>`
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
  max-width: ${props => !props.small && '180px'};
  ${({ small }) =>
    small &&
    `min-width: 50px;
    padding: 40%;`}
  height: ${props => (props.small ? '0' : '115px')};
  transition: background-color 0.15s;
`;

const AddImageButton = styled(ButtonDefault)<{ small?: boolean }>`
  background-color: ${({ small, theme }) =>
    small ? theme.shared.colors.greyLight : `#5e5e5e50`};
  &:hover,
  &:active,
  &:hover:enabled,
  &:active:enabled {
    background-color: ${({ small, theme }) =>
      small ? theme.shared.colors.greyVeryLight : '#5e5e5e99'};
  }
  width: 100%;
  height: 100%;
  padding: 0;
  text-shadow: 0 0 2px black;
`;

const ImageComponent = styled.div<{ small: boolean }>`
  ${({ small }) =>
    small &&
    `position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;`}
  background-size: cover;
  flex-grow: 1;
  cursor: grab;
`;

const AddImageViaGridModalButton = styled.div`
  display: flex;
  height: 100%;
  justify-content: center;
  align-items: center;
  flex-grow: 1;
`;

const AddImageViaUrlInput = styled(InputContainer)`
  flex-grow: 0;
  margin-top: 5px;
`;

const ImageUrlInput = styled(InputBase)`
  border: none;
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

const InputImageContainer = styled(InputContainer)<{
  small: boolean;
  isHovering?: boolean;
}>`
  position: relative;
  ${props => !props.small && `padding: 5px;`}
  background-color: ${props => props.theme.shared.colors.greyLight};
  ${props =>
    props.isHovering &&
    `box-shadow inset 0 -10px 0 ${globalTheme.base.colors.highlightColor}`};
`;

export interface InputImageContainerProps {
  frontId: string;
  criteria?: Criteria;
  small?: boolean;
  defaultImageUrl?: string;
  useDefault?: boolean;
  message?: string;
  replaceImage: boolean;
  setDisplayImageReplaceToggle: (display: boolean) => void;
  setImageReplaceToggleValue: (value: boolean) => void;
}

type ComponentProps = InputImageContainerProps &
  WrappedFieldProps & { gridUrl: string | null; editMode: EditMode };

interface ComponentState {
  isHovering: boolean;
  modalOpen: boolean;
  imageSrc: string;
}

const dragImage = new Image();
dragImage.src = imageDragIcon;

class InputImage extends React.Component<ComponentProps, ComponentState> {
  public state = {
    isHovering: false,
    modalOpen: false,
    imageSrc: ''
  };

  public render() {
    const {
      small = false,
      input,
      gridUrl,
      useDefault,
      defaultImageUrl,
      message = 'Replace image',
      editMode
    } = this.props;

    if (!gridUrl) {
      return (
        <div>
          <code>gridUrl</code> config value missing
        </div>
      );
    }

    const gridSearchUrl =
      editMode === 'editions' ? `${gridUrl}` : `${gridUrl}?cropType=landscape`;
    const hasImage = !useDefault && !!input.value && !!input.value.thumb;
    const imageUrl =
      !useDefault && input.value && input.value.thumb
        ? input.value.thumb
        : defaultImageUrl;
    return (
      <InputImageContainer small={small} isHovering={this.state.isHovering}>
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
          <ImageContainer small={small}>
            <ImageComponent
              style={{
                backgroundImage: `url(${imageUrl}`
              }}
              draggable
              onDragStart={this.handleDragStart}
              onDrop={this.handleDrop}
              small={small}
            >
              {hasImage ? (
                <ButtonDelete
                  type="button"
                  priority="primary"
                  small={small}
                  onClick={this.handleDelete}
                >
                  <IconDelete small={small}>
                    <RubbishBinIcon size="s" />
                  </IconDelete>
                </ButtonDelete>
              ) : (
                <AddImageViaGridModalButton>
                  <AddImageButton
                    type="button"
                    onClick={this.openModal}
                    small={small}
                  >
                    <AddImageIcon size="l" />
                    {!!small ? null : <Label size="sm">{message}</Label>}
                  </AddImageButton>
                </AddImageViaGridModalButton>
              )}
            </ImageComponent>
            {!!small ? null : (
              <AddImageViaUrlInput>
                <ImageUrlInput
                  name="paste-url"
                  placeholder=" Paste crop url"
                  defaultValue={this.state.imageSrc}
                  onChange={this.handlePasteImgSrcChange}
                />
                <InputLabel hidden htmlFor="paste-url">
                  Paste crop url
                </InputLabel>
              </AddImageViaUrlInput>
            )}
          </ImageContainer>
        </DragIntentContainer>
        {this.state.isHovering && <ImageDragIntentIndicator />}
      </InputImageContainer>
    );
  }

  private handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    this.clearField();
    this.props.setImageReplaceToggleValue(false);
    this.props.setDisplayImageReplaceToggle(false);
  };

  private handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    const origin =
      (!this.props.useDefault && this.props.input.value.origin) ||
      this.props.defaultImageUrl;
    if (origin) {
      e.dataTransfer.setData(DRAG_DATA_GRID_IMAGE_URL, origin);
      e.dataTransfer.setDragImage(dragImage, -25, 50);
    }
  };

  private handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
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

  private handlePasteImgSrcChange = (e: React.FormEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.persist();
    this.setState(
      { imageSrc: e.currentTarget.value },
      this.validateAndGetImage
    );
  };

  private validateAndGetImage = () => {
    events.imageAdded(this.props.frontId, 'paste');

    validateImageSrc(
      this.state.imageSrc,
      this.props.frontId,
      this.props.criteria
    )
      .then(mediaItem => {
        this.props.input.onChange(mediaItem);
        this.props.setDisplayImageReplaceToggle(true);
      })
      .catch(err => {
        alert(err);
        // tslint:disable-next-line no-console
        console.log('@todo:handle error', err);
      });
    this.setState({ imageSrc: '' });
  };

  private clearField = () => this.props.input.onChange(null);

  private validMessage(data: GridData) {
    return data && data.crop && data.crop.data && data.image && data.image.data;
  }

  private onMessage = (event: MessageEvent) => {
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
        this.props.setDisplayImageReplaceToggle(true);
      })
      .catch(err => {
        alert(err);
        // tslint:disable-next-line no-console
        console.log('@todo:handle error', err);
      });
  };

  private closeModal = () => {
    this.setState({ modalOpen: false });
    window.removeEventListener('message', this.onMessage, false);
  };

  private openModal = () => {
    this.setState({ modalOpen: true });
    window.addEventListener('message', this.onMessage, false);
  };
}

const mapStateToProps = (state: State) => {
  return {
    gridUrl: selectGridUrl(state),
    editMode: selectEditMode(state)
  };
};

export default connect(mapStateToProps)(InputImage);
