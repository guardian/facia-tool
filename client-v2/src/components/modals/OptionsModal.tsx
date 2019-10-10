import React from 'react';
import ButtonDefault from 'shared/components/input/ButtonDefault';
import { OptionsModalProps } from '../../types/Modals';
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
import { StyledModal, Actions } from './StyledModal';

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
        zIndex: 1000
      }
    }}
    isOpen={isOpen}
    onRequestClose={onCancel}
  >
    <h1 data-testid="options-modal">{title}</h1>
    {description &&
      (typeof description === 'string' ? <p>{description}</p> : description)}
    <Actions>
      {showCancelButton && (
        <ButtonDefault size="l" inline onClick={onCancel}>
          Cancel
        </ButtonDefault>
      )}
      {options &&
        options.map(option => (
          <ButtonDefault
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
