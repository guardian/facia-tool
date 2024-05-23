import React, { useMemo } from 'react';
import { reduxForm, Field, InjectedFormProps } from 'redux-form';
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

type FormProps = {
  card: Card;
  initialValues: ChefCardMeta;
  chef: Chef | undefined;
  chefWithoutOverrides: Chef | undefined;
  size: CardSizes;
  onCancel: () => void;
  onSave: (meta: ChefCardFormData) => void;
};

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

export const ChefMetaForm = ({ cardId, ...rest }: ChefMetaFormProps) => {
  const card = useSelector((state: State) => selectCard(state, cardId));
  const chefWithoutOverrides = useSelector((state: State) =>
    selectors.selectById(state, card.id)
  );
  const chef = useSelector((state: State) =>
    selectors.selectChefFromCard(state, cardId)
  );

  const initialValues = useMemo(() => ({ bio: chef?.bio ?? '' }), [chef?.bio]);

  return (
    <ConnectedChefForm
      chef={chef}
      chefWithoutOverrides={chefWithoutOverrides}
      card={card}
      initialValues={initialValues}
      {...rest}
    />
  );
};
