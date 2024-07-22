import React, { useCallback } from 'react';
import {
  reduxForm,
  Field,
  InjectedFormProps,
  formValueSelector,
} from 'redux-form';
import { Card, CardSizes, ChefCardMeta, Palette } from '../../types/Collection';
import { Dispatch } from '../../types/Store';
import { State } from '../../types/State';
import Button from 'components/inputs/ButtonDefault';
import { selectCard } from 'selectors/shared';
import { FormContainer } from 'components/form/FormContainer';
import { FormContent } from 'components/form/FormContent';
import { CollectionEditedError } from 'components/form/CollectionEditedError';
import { TextOptionsInputGroup } from 'components/form/TextOptionsInputGroup';
import { FormButtonContainer } from 'components/form/FormButtonContainer';
import { useSelector } from 'react-redux';
import InputLabel from 'components/inputs/InputLabel';
import ButtonDefault from 'components/inputs/ButtonDefault';
import { useDispatch } from 'react-redux';
import { startOptionsModal } from 'actions/OptionsModal';
import { PaletteItem, createPaletteForm } from './PaletteForm';
import noop from 'lodash/noop';
import InputText from 'components/inputs/InputText';
import { RichTextInput } from 'components/inputs/RichTextInput';
import InputContainer from 'components/inputs/InputContainer';

interface FormProps {
  card: Card;
  initialValues: ChefCardMeta;
  size: CardSizes;
  onCancel: () => void;
  onSave: (meta: ChefCardMeta) => void;
  openPaletteModal: () => void;
  currentPalette: Palette;
}

type ComponentProps = FormProps &
  InjectedFormProps<ChefCardMeta, FormProps, {}>;

const Form = ({
  card,
  pristine,
  valid,
  size,
  handleSubmit,
  onCancel,
  openPaletteModal,
  currentPalette,
}: ComponentProps) => {
  return (
    <FormContainer
      data-testid="edit-form"
      topBorder={false}
      onClick={
        (e: React.MouseEvent) =>
          e.stopPropagation() /* Prevent clicks passing through the form */
      }
    >
      {!card && (
        <CollectionEditedError>
          {`This collection has been edited since you started editing this article. Your changes have not been saved. Please refresh the page to get the latest data.`}
        </CollectionEditedError>
      )}
      <FormContent size={size}>
        <TextOptionsInputGroup>
          <Field
            name="title"
            label="Title"
            rows="2"
            placeholder="Add a title"
            component={InputText}
          />
          <Field
            name="body"
            label="Body text"
            rows="2"
            placeholder="Add body text"
            originalValue=""
            component={RichTextInput}
          />
          <InputContainer>
            <InputLabel>Palette</InputLabel>
            {currentPalette ? (
              <PaletteItem
                id={currentPalette.paletteId}
                palette={currentPalette}
                onClick={openPaletteModal}
              />
            ) : (
              <p>
                No palette selected.{' '}
                <ButtonDefault type="button" onClick={openPaletteModal}>
                  Add a palette
                </ButtonDefault>
              </p>
            )}
          </InputContainer>
        </TextOptionsInputGroup>
      </FormContent>
      <FormButtonContainer>
        <Button onClick={onCancel} type="button" size="l">
          Cancel
        </Button>
        <Button
          priority="primary"
          onClick={handleSubmit}
          disabled={pristine || !card || !valid}
          size="l"
          data-testid="edit-form-save-button"
        >
          Save
        </Button>
      </FormButtonContainer>
    </FormContainer>
  );
};

const ConnectedFeastCollectionForm = reduxForm<ChefCardMeta, FormProps, {}>({
  destroyOnUnmount: true,
  onSubmit: (values: ChefCardMeta, dispatch: Dispatch, props: FormProps) =>
    dispatch(() => props.onSave(values)),
})(Form);

interface FeastCollectionMetaFormProps {
  cardId: string;
  form: string;
  onCancel: () => void;
  onSave: (meta: ChefCardMeta) => void;
  size: CardSizes;
}

export const FeastCollectionMetaForm = ({
  cardId,
  form,
  ...rest
}: FeastCollectionMetaFormProps) => {
  const valueSelector = formValueSelector(form);
  const card = useSelector((state: State) => selectCard(state, cardId));
  const palette = useSelector(
    (state: State) => valueSelector(state, 'palette') as Palette
  );

  const dispatch = useDispatch();
  const openPaletteModal = useCallback(
    () =>
      dispatch(
        startOptionsModal(
          'Select a palette',
          createPaletteForm(form, 'palette'),
          [{ buttonText: 'Done', callback: noop }],
          undefined,
          false
        )
      ),
    []
  );

  return (
    <ConnectedFeastCollectionForm
      card={card}
      initialValues={card.meta as ChefCardMeta}
      openPaletteModal={openPaletteModal}
      currentPalette={palette}
      form={form}
      {...rest}
    />
  );
};
