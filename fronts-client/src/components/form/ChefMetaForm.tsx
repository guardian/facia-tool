import React, { useCallback, useMemo } from 'react';
import {
  reduxForm,
  Field,
  InjectedFormProps,
  change,
  getFormValues,
  formValueSelector,
} from 'redux-form';
import { Card, CardSizes, ChefCardMeta } from '../../types/Collection';
import { Dispatch } from '../../types/Store';
import { selectors } from '../../bundles/chefsBundle';
import { State } from '../../types/State';
import { ChefCardFormData } from '../../util/form';
import Button from 'components/inputs/ButtonDefault';
import { selectCard } from 'selectors/shared';
import { FormContainer } from 'components/form/FormContainer';
import { FormContent } from 'components/form/FormContent';
import { CollectionEditedError } from 'components/form/CollectionEditedError';
import { TextOptionsInputGroup } from 'components/form/TextOptionsInputGroup';
import { FormButtonContainer } from 'components/form/FormButtonContainer';
import { Chef } from 'types/Chef';
import { useSelector } from 'react-redux';
import InputTextArea from 'components/inputs/InputTextArea';
import InputImage from 'components/inputs/InputImage';
import { defaultCardTrailImageCriteria } from 'constants/image';
import { ImageOptionsInputGroup } from './ImageOptionsInputGroup';
import Row from 'components/Row';
import { ImageRowContainer } from './ImageRowContainer';
import { ImageCol } from './ImageCol';
import InputLabel from 'components/inputs/InputLabel';
import ButtonDefault from 'components/inputs/ButtonDefault';
import { useDispatch } from 'react-redux';
import { startOptionsModal } from 'actions/OptionsModal';
import {
  ChefPalette,
  ChefPaletteId,
  chefPalettes,
} from 'constants/feastPalettes';
import { styled } from 'constants/theme';
import { noop } from 'lodash';
import { OptionsModalBodyProps } from 'types/Modals';

interface FormProps {
  card: Card;
  initialValues: ChefCardMeta;
  chef: Chef | undefined;
  chefWithoutOverrides: Chef | undefined;
  size: CardSizes;
  onCancel: () => void;
  onSave: (meta: ChefCardFormData) => void;
  openPaletteModal: () => void;
  currentPaletteId: ChefPaletteId;
}

type ComponentProps = FormProps &
  InjectedFormProps<ChefCardFormData, FormProps, {}>;

const Form = ({
  card,
  pristine,
  valid,
  size,
  handleSubmit,
  onCancel,
  chef,
  chefWithoutOverrides,
  openPaletteModal,
  currentPaletteId,
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
            name="bio"
            label="Bio"
            rows="2"
            placeholder={chef?.bio}
            component={InputTextArea}
            originalValue={chefWithoutOverrides?.bio}
            data-testid="edit-form-headline-field"
          />
          <InputLabel>Palette</InputLabel>
          {currentPaletteId ? (
            <PaletteItem
              id={currentPaletteId}
              palette={chefPalettes[currentPaletteId]}
            />
          ) : (
            <p>No palette selected</p>
          )}
          <ButtonDefault onClick={openPaletteModal} type="button">
            Change palette
          </ButtonDefault>
        </TextOptionsInputGroup>
        <ImageOptionsInputGroup size={size}>
          <ImageRowContainer size={size}>
            <Row>
              <ImageCol>
                <InputLabel htmlFor="image">Trail image</InputLabel>
                <Field
                  name={'image'}
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

const ConnectedChefForm = reduxForm<ChefCardFormData, FormProps, {}>({
  destroyOnUnmount: true,
  onSubmit: (values: ChefCardFormData, dispatch: Dispatch, props: FormProps) =>
    dispatch(() => {
      props.onSave(values);
    }),
})(Form);

interface ChefMetaFormProps {
  cardId: string;
  form: string;
  onCancel: () => void;
  onSave: (meta: ChefCardMeta) => void;
  size: CardSizes;
}

export const ChefMetaForm = ({ cardId, form, ...rest }: ChefMetaFormProps) => {
  const valueSelector = formValueSelector(form);
  const card = useSelector((state: State) => selectCard(state, cardId));
  const chefWithoutOverrides = useSelector((state: State) =>
    selectors.selectById(state, card.id)
  );
  const chef = useSelector((state: State) =>
    selectors.selectChefFromCard(state, cardId)
  );
  const paletteId = useSelector((state: State) =>
    valueSelector(state, 'paletteId')
  );

  const initialValues = useMemo(() => ({ bio: chef?.bio ?? '' }), [chef?.bio]);
  const dispatch = useDispatch();
  const openPaletteModal = useCallback(
    () =>
      dispatch(
        startOptionsModal(
          'Select a palette',
          createPaletteForm(form),
          [],
          noop,
          false
        )
      ),
    []
  );

  return (
    <ConnectedChefForm
      chef={chef}
      chefWithoutOverrides={chefWithoutOverrides}
      card={card}
      initialValues={initialValues}
      openPaletteModal={openPaletteModal}
      currentPaletteId={paletteId}
      form={form}
      {...rest}
    />
  );
};

const createPaletteForm =
  (formName: string) =>
  ({ onCancel }: OptionsModalBodyProps) => {
    const dispatch = useDispatch();
    const currentPaletteId = useSelector((state: State) => {
      const formValues = getFormValues(formName)(state) as {
        paletteId: string;
      };
      return formValues['paletteId'];
    });
    const setPaletteOption = useCallback(
      (paletteName: keyof typeof chefPalettes) => {
        dispatch(change(formName, 'paletteId', paletteName));
        dispatch(
          change(
            formName,
            'foregroundHex',
            chefPalettes[paletteName].foregroundHex
          )
        );
        dispatch(
          change(
            formName,
            'backgroundHex',
            chefPalettes[paletteName].backgroundHex
          )
        );

        onCancel();
      },
      [formName]
    );

    return (
      <PaletteList>
        {Object.entries(chefPalettes).map(([name, palette]) => (
          <PaletteItem
            palette={palette}
            key={name}
            id={name as ChefPaletteId}
            onClick={(name) => setPaletteOption(name as ChefPaletteId)}
            isSelected={name === currentPaletteId}
          />
        ))}
      </PaletteList>
    );
  };

const PaletteItem = ({
  id,
  palette,
  onClick = noop,
  isSelected = false,
}: {
  id: ChefPaletteId;
  palette: ChefPalette;
  onClick?: (paletteId: ChefPaletteId) => void;
  isSelected?: boolean;
}) => {
  return (
    <PaletteOption key={id} onClick={() => onClick(id)} isSelected={isSelected}>
      <PaletteHeading>{id}</PaletteHeading>
      <PaletteSwatch colors={[palette.backgroundHex, palette.foregroundHex]} />
    </PaletteOption>
  );
};

const PaletteHeading = styled.h3`
  margin-top: 0;
`;

const PaletteOption = styled.div<{ isSelected: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 100px;
  width: min-content;
  padding: 10px;
  margin: 5px 5px 5px 0;
  border: 2px solid ${({ isSelected }) => (isSelected ? 'darkblue' : '#ccc')};
  border-radius: 5px;
  cursor: pointer;
`;

const PaletteList = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const PaletteSwatch = ({ colors }: { colors: string[] }) => (
  <PaletteContainer borderColor={colors[0]}>
    {colors.map((color) => (
      <PaletteColor key={color} color={color} />
    ))}
  </PaletteContainer>
);

const PaletteContainer = styled.div<{ borderColor: string | undefined }>`
  display: flex;
  width: 50px;
  height: 50px;
  border-radius: 5px;
  border: ${({ borderColor }) =>
    borderColor ? `2px solid ${borderColor}` : 'none'};
  overflow: hidden;
`;

const PaletteColor = styled.div<{ color: string }>`
  flex-grow: 1;
  background-color: ${({ color }) => color};
  height: 100%;
  min-width: 10px;
`;
