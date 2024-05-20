import React from 'react';
import { connect } from 'react-redux';
import { reduxForm, Field, InjectedFormProps } from 'redux-form';
import { Card, CardSizes, RecipeCardMeta } from '../../types/Collection';
import { Dispatch } from '../../types/Store';
import { selectors } from '../../bundles/recipesBundle';
import { State } from '../../types/State';
import { RecipeCardFormData } from '../../util/form';
import Button from 'components/inputs/ButtonDefault';
import InputText from 'components/inputs/InputText';
import { selectCard } from 'selectors/shared';
import { Recipe } from 'types/Recipe';
import { FormContainer } from 'components/form/FormContainer';
import { FormContent } from 'components/form/FormContent';
import { CollectionEditedError } from 'components/form/CollectionEditedError';
import { TextOptionsInputGroup } from 'components/form/TextOptionsInputGroup';
import { FormButtonContainer } from 'components/form/FormButtonContainer';

type FormProps = {
  card: Card;
  initialValues: {
    title: string;
  };
  recipe?: Recipe;
  size: CardSizes;
  onCancel: () => void;
  onSave: (meta: RecipeCardFormData) => void;
};

type ComponentProps = FormProps &
  InjectedFormProps<RecipeCardFormData, FormProps, {}>;

const Form = ({
  card,
  pristine,
  valid,
  size,
  handleSubmit,
  onCancel,
  initialValues,
  recipe,
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
            placeholder={recipe?.title}
            component={InputText}
            originalValue={initialValues.title}
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

const ConnectedRecipeForm = reduxForm<RecipeCardFormData, FormProps, {}>({
  destroyOnUnmount: true,
  onSubmit: (
    values: RecipeCardFormData,
    dispatch: Dispatch,
    props: FormProps
  ) =>
    dispatch(() => {
      props.onSave(values);
    }),
})(Form);

interface InterfaceProps {
  form: string;
  cardId: string;
  isSupporting?: boolean;
  onCancel: () => void;
  onSave: (meta: RecipeCardMeta) => void;
  frontId: string;
  size?: string;
}

const mapStateToProps = (state: State, { cardId }: InterfaceProps) => {
  const card = selectCard(state, cardId);
  const recipe = selectors.selectRecipeFromCard(state, cardId);
  return {
    recipe,
    card,
    initialValues: {
      title: recipe?.title ?? '',
    },
  };
};

export const RecipeMetaForm = connect(mapStateToProps)(ConnectedRecipeForm);
