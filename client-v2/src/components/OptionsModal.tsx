import React from 'react';
import ButtonDefault from 'shared/components/input/ButtonDefault';
import { OptionsModalProps } from '../types/Modals';
import { State } from 'types/State';
import {
  selectOptionsModalIsOpen,
  selectOptionsModalDescription,
  selectOptionsModalTitle,
  selectOptionsModalShowCancelButton,
  selectOptionsModalOptions
} from 'selectors/modalSelectors';
import { connect } from 'react-redux';
import { Dispatch } from 'types/Store';
import { endOptionsModal } from 'actions/OptionsModal';
import Modal from 'react-modal';
import { styled, theme } from 'constants/theme';

const StyledModal = styled(Modal)`
  font-size: 14px;
  background: ${theme.shared.base.colors.backgroundColorLight};
  outline: none;
  padding: 20px;
  min-height: 200px;
  max-height: calc(100vh - 40px);
  width: 50%;
  margin: 20px auto;
  overflow: scroll;
`;

const Actions = styled.div`
  border-top: solid 1px ${theme.shared.base.colors.borderColor};
  margin-top: 1.5em;
  padding-top: 1.5em;
  text-align: right;
`;

const OptionsModal = ({
  title,
  description,
  isOpen,
  options,
  onCancel,
  showCancelButton
}: OptionsModalProps) => (
  <StyledModal
    style={{
      overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        zIndex: 1000,
        backdropFilter: 'blur(10px)'
      }
    }}
    isOpen={isOpen}
    onRequestClose={onCancel}
  >
    <h1 data-testid="options-modal" style={{ margin: 0 }}>
      {title}
    </h1>
    {description &&
      (typeof description === 'string' ? <p>{description}</p> : description)}
    <Actions>
      {showCancelButton && (
        <ButtonDefault
          data-testid="options-modal-cancel"
          size="l"
          inline
          onClick={onCancel}
        >
          Cancel
        </ButtonDefault>
      )}
      {options &&
        options.map(option => (
          <ButtonDefault
            data-testid={`options-modal-${option.buttonText
              .toLocaleLowerCase()
              .replace(' ', '-')}`}
            size="l"
            inline
            priority="primary"
            onClick={() => {
              option.callback();
              onCancel();
            }}
            key={option.buttonText}
          >
            {option.buttonText}
          </ButtonDefault>
        ))}
    </Actions>
  </StyledModal>
);

const mapStateToProps = (state: State) => ({
  isOpen: selectOptionsModalIsOpen(state),
  title: selectOptionsModalTitle(state),
  description: selectOptionsModalDescription(state),
  options: selectOptionsModalOptions(state),
  showCancelButton: selectOptionsModalShowCancelButton(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onCancel: () => dispatch(endOptionsModal())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OptionsModal);
