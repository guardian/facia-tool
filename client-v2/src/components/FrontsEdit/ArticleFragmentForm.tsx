import React from 'react';
import { connect } from 'react-redux';
import {
  reduxForm,
  FieldArray,
  InjectedFormProps,
  formValueSelector,
  WrappedFieldArrayProps,
  Field
} from 'redux-form';
import styled from 'styled-components';
import Button from 'shared/components/input/ButtonDefault';
import ContentContainer from 'shared/components/layout/ContentContainer';
import ContainerHeadingPinline from 'shared/components/typography/ContainerHeadingPinline';
import {
  createArticleFromArticleFragmentSelector,
  selectSharedState,
  articleTagSelector,
  externalArticleFromArticleFragmentSelector
} from 'shared/selectors/shared';
import { createSelectFormFieldsForCollectionItem } from 'selectors/formSelectors';
import { ArticleFragmentMeta, ArticleTag } from 'shared/types/Collection';
import InputText from 'shared/components/input/InputText';
import InputTextArea from 'shared/components/input/InputTextArea';
import HorizontalRule from 'shared/components/layout/HorizontalRule';
import InputCheckboxToggle from 'shared/components/input/InputCheckboxToggle';
import InputImage, {
  InputImageContainerProps
} from 'shared/components/input/InputImage';
import InputGroup from 'shared/components/input/InputGroup';
import InputButton from 'shared/components/input/InputButton';
import Row from '../Row';
import Col from '../Col';
import { State } from 'types/State';
import ConditionalField from 'components/inputs/ConditionalField';
import ConditionalComponent from 'components/layout/ConditionalComponent';
import {
  ArticleFragmentFormData,
  getArticleFragmentMetaFromFormValues,
  getInitialValuesForArticleFragmentForm,
  getCapiValuesForArticleTextFields
} from 'util/form';
import { CapiTextFields } from 'util/form';

interface ComponentProps extends ContainerProps {
  articleFragmentId: string;
  showKickerTag: boolean;
  showKickerSection: boolean;
  kickerOptions: ArticleTag;
}

type Props = ComponentProps &
  InjectedFormProps<ArticleFragmentFormData, ComponentProps, {}>;

const FormContainer = ContentContainer.withComponent('form').extend`
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 380px;
  margin-left: 10px;
  height: 100%;
`;

const FormContent = styled('div')`
  flex: 1;
  overflow-y: scroll;
`;

const CollectionHeadingPinline = ContainerHeadingPinline.extend`
  display: flex;
  margin-right: -11px;
  margin-bottom: 10px;
`;

const RowContainer = styled('div')`
  overflow: hidden;
`;

const ButtonContainer = styled('div')`
  margin-left: auto;
  line-height: 0;
`;

const SlideshowRow = Row.extend`
  margin-top: 10px;
  margin-bottom: 5px;
`;

const SlideshowLabel = styled('div')`
  font-size: 12px;
  color: #767676;
`;

const ImageWrapper = styled('div')`
  transition: opacity 0.15s;
  opacity: ${(props: { faded: boolean }) => (props.faded ? 0.6 : 1)};
`;

const imageCriteria = {
  minWidth: 400,
  widthAspectRatio: 5,
  heightAspectRatio: 3
};

const renderSlideshow = (
  { fields }: WrappedFieldArrayProps<ImageData>,
  frontId: string
) => (
  <>
    {fields.map((name, index) => (
      <Col key={`${name}-${index}`}>
        <Field<InputImageContainerProps>
          name={name}
          component={InputImage}
          size="small"
          criteria={imageCriteria}
          frontId={frontId}
        />
      </Col>
    ))}
  </>
);

const formComponent: React.StatelessComponent<Props> = ({
  change,
  kickerOptions,
  handleSubmit,
  imageSlideshowReplace,
  imageHide,
  imageCutoutReplace,
  onCancel,
  initialValues,
  articleCapiFieldValues,
  pristine,
  showByline,
  editableFields,
  reset,
  showKickerTag,
  showKickerSection,
  frontId
}) => (
  <FormContainer onSubmit={handleSubmit}>
    <CollectionHeadingPinline>
      Edit
      <ButtonContainer>
        <Button priority="primary" onClick={onCancel} type="button" size="l">
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={pristine} size="l">
          Save
        </Button>
      </ButtonContainer>
    </CollectionHeadingPinline>
    <FormContent>
      <InputGroup>
        <ConditionalField
          permittedFields={editableFields}
          name="headline"
          label="Headline"
          placeholder={articleCapiFieldValues.headline}
          component={InputTextArea}
          useHeadlineFont
          rows="2"
        />
        <ConditionalField
          permittedFields={editableFields}
          name="isBoosted"
          component={InputCheckboxToggle}
          label="Boost"
          type="checkbox"
        />
        <ConditionalField
          permittedFields={editableFields}
          name="showQuotedHeadline"
          component={InputCheckboxToggle}
          label="Quote headline"
          type="checkbox"
        />
        <ConditionalField
          permittedFields={editableFields}
          name="showBoostedHeadline"
          component={InputCheckboxToggle}
          label="Large headline"
          type="checkbox"
        />
        <ConditionalField
          permittedFields={editableFields}
          name="showLivePlayable"
          component={InputCheckboxToggle}
          label="Show updates"
          type="checkbox"
        />
        <ConditionalField
          permittedFields={editableFields}
          name="showMainVideo"
          component={InputCheckboxToggle}
          label="Show video"
          type="checkbox"
        />
        <ConditionalField
          permittedFields={editableFields}
          name="customKicker"
          label="Kicker"
          component={InputText}
          placeholder="Add custom kicker"
          useHeadlineFont
          format={value => {
            if (showKickerTag) {
              return kickerOptions.webTitle;
            }
            if (showKickerSection) {
              return kickerOptions.sectionName;
            }
            return value;
          }}
          onChange={e => {
            change('showKickerCustom', true);
            change('showKickerTag', false);
            change('showKickerSection', false);
            if (e) {
              change('customKicker', e.target.value);
            }
          }}
        />
        <ConditionalComponent
          name="customKicker"
          permittedNames={editableFields}
        >
          {kickerOptions.webTitle && (
            <Field
              permittedFields={editableFields}
              name="showKickerTag"
              component={InputButton}
              buttonText={kickerOptions.webTitle}
              selected={showKickerTag}
              onClick={() => {
                if (!showKickerTag) {
                  change('showKickerTag', true);
                  change('showKickerSection', false);
                  change('showKickerCustom', false);
                } else {
                  change('showKickerTag', false);
                }
              }}
            />
          )}
          {kickerOptions.sectionName && (
            <Field
              permittedFields={editableFields}
              name="showKickerSection"
              component={InputButton}
              selected={showKickerSection}
              buttonText={kickerOptions.sectionName}
              onClick={() => {
                if (!showKickerSection) {
                  change('showKickerSection', true);
                  change('showKickerTag', false);
                  change('showKickerCustom', false);
                } else {
                  change('showKickerSection', false);
                }
              }}
            />
          )}
        </ConditionalComponent>
        <ConditionalField
          permittedFields={editableFields}
          name="isBreaking"
          component={InputCheckboxToggle}
          label="Breaking News"
          type="checkbox"
        />
        <ConditionalField
          permittedFields={editableFields}
          name="showByline"
          component={InputCheckboxToggle}
          label="Show Byline"
          type="checkbox"
        />
        {showByline && (
          <ConditionalField
            permittedFields={editableFields}
            name="byline"
            label="Byline"
            component={InputText}
            placeholder={articleCapiFieldValues.byline}
            useHeadlineFont
          />
        )}
        <ConditionalField
          permittedFields={editableFields}
          name="trailText"
          label="Trail text"
          component={InputTextArea}
          placeholder={articleCapiFieldValues.trailText}
        />
      </InputGroup>
      <RowContainer>
        <Row>
          <Col>
            <ImageWrapper faded={imageHide}>
              <ConditionalField
                permittedFields={editableFields}
                name="primaryImage"
                component={InputImage}
                disabled={imageHide}
                criteria={imageCriteria}
                frontId={frontId}
              />
            </ImageWrapper>
          </Col>
          <Col>
            <InputGroup>
              <ConditionalField
                permittedFields={editableFields}
                name="imageHide"
                component={InputCheckboxToggle}
                label="Hide media"
                type="checkbox"
                default={false}
              />
            </InputGroup>
          </Col>
        </Row>
        <ConditionalComponent
          permittedNames={editableFields}
          name={['primaryImage', 'imageHide']}
        >
          <HorizontalRule />
        </ConditionalComponent>
        <Row>
          <Col>
            <ImageWrapper faded={!imageCutoutReplace}>
              <ConditionalField
                permittedFields={editableFields}
                name="cutoutImage"
                component={InputImage}
                disabled={imageHide}
                criteria={imageCriteria}
                frontId={frontId}
              />
            </ImageWrapper>
          </Col>
          <Col>
            <InputGroup>
              <ConditionalField
                permittedFields={editableFields}
                name="imageCutoutReplace"
                component={InputCheckboxToggle}
                label="Use cutout"
                type="checkbox"
                default={false}
              />
            </InputGroup>
          </Col>
        </Row>
      </RowContainer>
      <ConditionalComponent
        permittedNames={editableFields}
        name={['cutoutImage', 'imageCutoutReplace']}
      >
        <HorizontalRule />
      </ConditionalComponent>
      <InputGroup>
        <ConditionalField
          permittedFields={editableFields}
          name="imageSlideshowReplace"
          component={InputCheckboxToggle}
          label="Slideshow"
          type="checkbox"
        />
      </InputGroup>
      {imageSlideshowReplace && (
        <RowContainer>
          <SlideshowRow>
            <FieldArray<WrappedFieldArrayProps<ImageData>>
              name="slideshow"
              component={(args: WrappedFieldArrayProps<ImageData>) =>
                renderSlideshow(args, frontId)
              }
            />
          </SlideshowRow>
          <SlideshowLabel>Drag and drop up to five images</SlideshowLabel>
        </RowContainer>
      )}
    </FormContent>
  </FormContainer>
);

const ArticleFragmentForm = reduxForm<
  ArticleFragmentFormData,
  ComponentProps,
  {}
>({
  destroyOnUnmount: false,
  enableReinitialize: true,
  onSubmit: (values: ArticleFragmentFormData, _, props: ComponentProps) => {
    const meta: ArticleFragmentMeta = getArticleFragmentMetaFromFormValues(
      values
    );
    props.onSave(meta);
  }
})(formComponent);

interface ContainerProps extends InterfaceProps {
  imageSlideshowReplace: boolean;
  imageCutoutReplace: boolean;
  imageHide: boolean;
  kickerOptions: ArticleTag;
  showByline: boolean;
  editableFields: string[];
  showKickerTag: boolean;
  showKickerSection: boolean;
  articleCapiFieldValues: CapiTextFields;
}

interface InterfaceProps {
  form: string;
  articleFragmentId: string;
  isSupporting?: boolean;
  onCancel: () => void;
  onSave: (meta: ArticleFragmentMeta) => void;
  frontId: string;
}

const formContainer: React.SFC<ContainerProps> = props => (
  <ArticleFragmentForm {...props} />
);

const createMapStateToProps = () => {
  const selectArticle = createArticleFromArticleFragmentSelector();
  const selectFormFields = createSelectFormFieldsForCollectionItem();
  return (
    state: State,
    { articleFragmentId, isSupporting = false }: InterfaceProps
  ) => {
    const externalArticle = externalArticleFromArticleFragmentSelector(
      selectSharedState(state),
      articleFragmentId
    );
    const valueSelector = formValueSelector(articleFragmentId);
    const article = selectArticle(selectSharedState(state), articleFragmentId);

    return {
      initialValues: getInitialValuesForArticleFragmentForm(article),
      articleCapiFieldValues: getCapiValuesForArticleTextFields(
        externalArticle
      ),
      editableFields: article
        ? selectFormFields(state, article.uuid, isSupporting)
        : [],
      kickerOptions: article
        ? articleTagSelector(selectSharedState(state), articleFragmentId)
        : {},
      imageSlideshowReplace: valueSelector(state, 'imageSlideshowReplace'),
      imageHide: valueSelector(state, 'imageHide'),
      imageCutoutReplace: valueSelector(state, 'imageCutoutReplace'),
      showByline: valueSelector(state, 'showByline'),
      showKickerTag: valueSelector(state, 'showKickerTag'),
      showKickerSection: valueSelector(state, 'showKickerSection')
    };
  };
};

export {
  getArticleFragmentMetaFromFormValues,
  getInitialValuesForArticleFragmentForm
};

export default connect(createMapStateToProps)(formContainer);
