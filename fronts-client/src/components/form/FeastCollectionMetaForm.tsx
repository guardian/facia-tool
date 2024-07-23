import React, { useCallback } from 'react';
import {
  reduxForm,
  Field,
  InjectedFormProps,
  formValueSelector,
} from 'redux-form';
import {
  Card,
  CardSizes,
  FeastCollectionCardMeta,
} from '../../types/Collection';
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
import InputContainer from 'components/inputs/InputContainer';
import { ImageOptionsInputGroup } from './ImageOptionsInputGroup';
import { ImageRowContainer } from './ImageRowContainer';
import Row from 'components/Row';
import { ImageCol } from './ImageCol';
import InputImage from 'components/inputs/InputImage';
import { defaultCardTrailImageCriteria } from 'constants/image';

interface FormProps {
  card: Card;
  initialValues: FeastCollectionCardMeta;
  size: CardSizes;
  onCancel: () => void;
  onSave: (meta: FeastCollectionCardMeta) => void;
  openPaletteModal: () => void;
  currentTheme: FeastCollectionCardMeta['theme'];
}

type ComponentProps = FormProps &
  InjectedFormProps<FeastCollectionCardMeta, FormProps, {}>;

const Form = ({
  card,
  pristine,
  valid,
  size,
  handleSubmit,
  onCancel,
  openPaletteModal,
  currentTheme,
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
          <InputContainer>
            <InputLabel>Palette</InputLabel>
            {currentTheme ? (
              <>
                {currentTheme.lightPalette && (
                  <PaletteItem
                    id={currentTheme.lightPalette.paletteId}
                    palette={currentTheme.lightPalette}
                    onClick={openPaletteModal}
                  />
                )}
                {currentTheme.darkPalette && (
                  <PaletteItem
                    id={currentTheme.darkPalette.paletteId}
                    palette={currentTheme.darkPalette}
                    onClick={openPaletteModal}
                  />
                )}
              </>
            ) : (
              <p>
                No palettes selected.{' '}
                <ButtonDefault type="button" onClick={openPaletteModal}>
                  Add a palette
                </ButtonDefault>
              </p>
            )}
          </InputContainer>
        </TextOptionsInputGroup>
        <ImageOptionsInputGroup size={size}>
          <ImageRowContainer size={size}>
            <Row>
              <ImageCol>
                <InputLabel htmlFor="feastCollectionImageOverride">
                  Replace image
                </InputLabel>
                <Field
                  name="feastCollectionImageOverride"
                  component={InputImage}
                  criteria={defaultCardTrailImageCriteria}
                />
              </ImageCol>
            </Row>
          </ImageRowContainer>
        </ImageOptionsInputGroup>
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

const ConnectedFeastCollectionForm = reduxForm<
  FeastCollectionCardMeta,
  FormProps,
  {}
>({
  destroyOnUnmount: true,
  onSubmit: (
    values: FeastCollectionCardMeta,
    dispatch: Dispatch,
    props: FormProps
  ) => dispatch(() => props.onSave(values)),
})(Form);

interface FeastCollectionMetaFormProps {
  cardId: string;
  form: string;
  onCancel: () => void;
  onSave: (meta: FeastCollectionCardMeta) => void;
  size: CardSizes;
}

const createFeastCollectionPaletteForm = (form: string) => () => {
  const LightPaletteForm = createPaletteForm(form, 'theme.lightPalette');
  const DarkPaletteForm = createPaletteForm(form, 'theme.darkPalette');

  return (
    <>
      <h2>Light palette</h2>
      <LightPaletteForm />
      <h2>Dark palette</h2>
      <DarkPaletteForm />
    </>
  );
};

export const FeastCollectionMetaForm = ({
  cardId,
  form,
  ...rest
}: FeastCollectionMetaFormProps) => {
  const valueSelector = formValueSelector(form);
  const card = useSelector((state: State) => selectCard(state, cardId));
  const theme = useSelector(
    (state: State) =>
      valueSelector(state, 'theme') as FeastCollectionCardMeta['theme']
  );

  const dispatch = useDispatch();
  const openPaletteModal = useCallback(
    () =>
      dispatch(
        startOptionsModal(
          'Select palettes',
          createFeastCollectionPaletteForm(form),
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
      initialValues={card.meta as FeastCollectionCardMeta}
      openPaletteModal={openPaletteModal}
      currentTheme={theme}
      form={form}
      {...rest}
    />
  );
};
