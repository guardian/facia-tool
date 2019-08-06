import React from 'react';
import { connect } from 'react-redux';
import {
  reduxForm,
  FieldArray,
  InjectedFormProps,
  formValueSelector,
  WrappedFieldArrayProps,
  Field,
  EventWithDataHandler
} from 'redux-form';
import { styled } from 'constants/theme';
import Button from 'shared/components/input/ButtonDefault';
import ContentContainer from 'shared/components/layout/ContentContainer';
import ContainerHeadingPinline from 'shared/components/typography/ContainerHeadingPinline';
import {
  createSelectArticleFromArticleFragment,
  selectSharedState,
  selectArticleTag,
  selectExternalArticleFromArticleFragment
} from 'shared/selectors/shared';
import { createSelectFormFieldsForCollectionItem } from 'selectors/formSelectors';
import { ArticleFragmentMeta, ArticleTag } from 'shared/types/Collection';
import InputText from 'shared/components/input/InputText';
import InputTextArea from 'shared/components/input/InputTextArea';
import InputCheckboxToggle from 'shared/components/input/InputCheckboxToggle';
import InputImage from 'shared/components/input/InputImage';
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
  getCapiValuesForArticleFields
} from 'util/form';
import { CapiFields } from 'util/form';
import { Dispatch } from 'types/Store';
import { articleFragmentImageCriteria as imageCriteria } from 'constants/image';
import { selectors as collectionSelectors } from 'shared/bundles/collectionsBundle';
import { getContributorImage } from 'util/CAPIUtils';

interface ComponentProps extends ContainerProps {
  articleExists: boolean;
  collectionId: string | null;
  getLastUpdatedBy: (id: string) => string | null;
  articleFragmentId: string;
  showKickerTag: boolean;
  showKickerSection: boolean;
  kickerOptions: ArticleTag;
  cutoutImage?: string;
}

type Props = ComponentProps &
  InterfaceProps &
  InjectedFormProps<
    ArticleFragmentFormData,
    ComponentProps & InterfaceProps,
    {}
  >;

export const formMinWidth = 300;

const FormContainer = styled(ContentContainer.withComponent('form'))`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: ${formMinWidth}px;
  max-width: 380px;
  margin-left: 10px;
  margin-top: 10px;
  height: calc(100% - 10px);
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

const SlideshowRow = styled(Row)`
  margin-top: 10px;
  margin-bottom: 5px;
`;

const SlideshowLabel = styled('div')`
  font-size: 12px;
  color: ${({ theme }) => theme.shared.colors.greyMedium};
`;

const ImageWrapper = styled('div')`
  transition: opacity 0.15s;
  opacity: ${(props: { faded: boolean }) => (props.faded ? 0.6 : 1)};
`;

const CollectionEditedError = styled.div`
  background-color: yellow;
  margin-bottom: 1em;
  padding: 1em;
`;

type RenderSlideshowProps = WrappedFieldArrayProps<ImageData> & {
  frontId: string;
};

const RenderSlideshow = ({ fields, frontId }: RenderSlideshowProps) => (
  <>
    {fields.map((name, index) => (
      <Col key={`${name}-${index}`}>
        <Field
          name={name}
          component={InputImage}
          small
          criteria={imageCriteria}
          frontId={frontId}
        />
      </Col>
    ))}
  </>
);

const getInputId = (articleFragmentId: string, label: string) =>
  `${articleFragmentId}-${label}`;

interface FormComponentState {
  lastKnownCollectionId: string | null;
}

class FormComponent extends React.Component<Props, FormComponentState> {
  public static getDerivedStateFromProps(props: Props) {
    return props.collectionId
      ? { lastKnownCollectionId: props.collectionId }
      : {};
  }

  public state: FormComponentState = {
    lastKnownCollectionId: null
  };

  private allImageFields = [
    'imageHide',
    'imageCutoutReplace',
    'imageSlideshowReplace',
    'imageReplace'
  ];

  public render() {
    const {
      articleFragmentId,
      change,
      kickerOptions,
      handleSubmit,
      imageSlideshowReplace,
      imageHide,
      imageCutoutReplace,
      cutoutImage,
      imageReplace,
      onCancel,
      articleCapiFieldValues,
      pristine,
      showByline,
      editableFields,
      showKickerTag,
      showKickerSection,
      frontId,
      articleExists
    } = this.props;

    return (
      <FormContainer onSubmit={handleSubmit} data-testid="edit-form">
        <CollectionHeadingPinline>
          Edit
          <ButtonContainer>
            <Button onClick={onCancel} type="button" size="l">
              Cancel
            </Button>
            <Button
              priority="primary"
              onClick={handleSubmit}
              disabled={pristine || !articleExists}
              size="l"
              data-testid="edit-form-save-button"
            >
              Save
            </Button>
          </ButtonContainer>
        </CollectionHeadingPinline>
        {!articleExists && (
          <CollectionEditedError>
            {this.state.lastKnownCollectionId &&
              `This collection has been edited by ${this.props.getLastUpdatedBy(
                this.state.lastKnownCollectionId
              )} since you started editing this article. Your changes have not been saved.`}
          </CollectionEditedError>
        )}
        <FormContent>
          <InputGroup>
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
                  size="s"
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
              )}{' '}
              {kickerOptions.sectionName && (
                <Field
                  permittedFields={editableFields}
                  name="showKickerSection"
                  component={InputButton}
                  selected={showKickerSection}
                  size="s"
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
              name="headline"
              label="Headline"
              placeholder={articleCapiFieldValues.headline}
              component={InputTextArea}
              useHeadlineFont
              originalValue={articleCapiFieldValues.headline}
              data-testid="edit-form-headline-field"
            />
            <ConditionalField
              permittedFields={editableFields}
              name="trailText"
              label="Trail text"
              component={InputTextArea}
              placeholder={articleCapiFieldValues.trailText}
              originalValue={articleCapiFieldValues.trailText}
            />
            <ConditionalField
              permittedFields={editableFields}
              name="sportScore"
              label="Sport Score"
              component={InputText}
              placeholder=""
              originalValue={''}
            />
            <ConditionalField
              permittedFields={editableFields}
              name="isBoosted"
              component={InputCheckboxToggle}
              label="Boost"
              id={getInputId(articleFragmentId, 'boost')}
              type="checkbox"
            />
            <ConditionalField
              permittedFields={editableFields}
              name="showQuotedHeadline"
              component={InputCheckboxToggle}
              label="Quote headline"
              id={getInputId(articleFragmentId, 'quote-headline')}
              type="checkbox"
            />
            <ConditionalField
              permittedFields={editableFields}
              name="showLargeHeadline"
              component={InputCheckboxToggle}
              label="Large headline"
              id={getInputId(articleFragmentId, 'large-headline')}
              type="checkbox"
            />
            <ConditionalField
              permittedFields={editableFields}
              name="isBreaking"
              component={InputCheckboxToggle}
              label="Breaking News"
              id={getInputId(articleFragmentId, 'breaking-news')}
              type="checkbox"
              dataTestId="edit-form-breaking-news-toggle"
            />
            <ConditionalField
              permittedFields={editableFields}
              name="showByline"
              component={InputCheckboxToggle}
              label="Show Byline"
              id={getInputId(articleFragmentId, 'show-byline')}
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
                originalValue={articleCapiFieldValues.byline}
              />
            )}
            <ConditionalField
              permittedFields={editableFields}
              name="showLivePlayable"
              component={InputCheckboxToggle}
              label="Show updates"
              id={getInputId(articleFragmentId, 'show-updates')}
              type="checkbox"
            />
            <ConditionalField
              permittedFields={editableFields}
              name="showMainVideo"
              component={InputCheckboxToggle}
              label="Show video"
              id={getInputId(articleFragmentId, 'show-video')}
              type="checkbox"
            />
          </InputGroup>
          <RowContainer>
            <Row>
              <Col>
                <ImageWrapper faded={imageHide}>
                  <ConditionalField
                    permittedFields={editableFields}
                    name={this.getImageFieldName()}
                    component={InputImage}
                    disabled={imageHide}
                    criteria={imageCriteria}
                    frontId={frontId}
                    defaultImageUrl={
                      imageCutoutReplace
                        ? cutoutImage
                        : articleCapiFieldValues.thumbnail
                    }
                    useDefault={!imageCutoutReplace && !imageReplace}
                    message={imageCutoutReplace ? 'Add cutout' : 'Add image'}
                    onChange={this.handleImageChange}
                  />
                </ImageWrapper>
              </Col>
              <Col>
                <InputGroup>
                  <ConditionalField
                    permittedFields={editableFields}
                    name="imageReplace"
                    component={InputCheckboxToggle}
                    label="Replace media"
                    id={getInputId(articleFragmentId, 'image-replace')}
                    type="checkbox"
                    default={false}
                    onChange={_ => this.changeImageField('imageReplace')}
                  />
                </InputGroup>
                <InputGroup>
                  <ConditionalField
                    permittedFields={editableFields}
                    name="imageHide"
                    component={InputCheckboxToggle}
                    label="Hide media"
                    id={getInputId(articleFragmentId, 'hide-media')}
                    type="checkbox"
                    default={false}
                    onChange={_ => this.changeImageField('imageHide')}
                  />
                </InputGroup>
                <InputGroup>
                  <ConditionalField
                    permittedFields={editableFields}
                    name="imageCutoutReplace"
                    component={InputCheckboxToggle}
                    label="Use cutout"
                    id={getInputId(articleFragmentId, 'use-cutout')}
                    type="checkbox"
                    default={false}
                    onChange={_ => this.changeImageField('imageCutoutReplace')}
                  />
                </InputGroup>
              </Col>
            </Row>
          </RowContainer>
          <InputGroup>
            <ConditionalField
              permittedFields={editableFields}
              name="imageSlideshowReplace"
              component={InputCheckboxToggle}
              label="Slideshow"
              id={getInputId(articleFragmentId, 'slideshow')}
              type="checkbox"
              onChange={_ => this.changeImageField('imageSlideshowReplace')}
            />
          </InputGroup>
          {imageSlideshowReplace && (
            <RowContainer>
              <SlideshowRow>
                <FieldArray
                  name="slideshow"
                  frontId={frontId}
                  component={RenderSlideshow}
                />
              </SlideshowRow>
              <SlideshowLabel>Drag and drop up to five images</SlideshowLabel>
            </RowContainer>
          )}
        </FormContent>
      </FormContainer>
    );
  }

  private changeImageField = (fieldToSet: string) => {
    this.allImageFields.forEach(field => {
      if (field === fieldToSet) {
        this.props.change(field, true);
      } else {
        this.props.change(field, false);
      }
    });
  };

  private getImageFieldName = () => {
    if (this.props.imageCutoutReplace) {
      return 'cutoutImage';
    }
    return 'primaryImage';
  };

  private handleImageChange: EventWithDataHandler<React.ChangeEvent<any>> = (
    e,
    ...args: [any?, any?, string?]
  ) => {
    // If we don't already have an image override enabled, enable the default imageReplace property.
    // This saves the user a click; adding an image without enabling would be very unusual.
    if (!this.props.imageCutoutReplace && !this.props.imageReplace) {
      this.changeImageField('imageReplace');
    }
    this.props.change(this.getImageFieldName(), e);
  };
}

const ArticleFragmentForm = reduxForm<
  ArticleFragmentFormData,
  ComponentProps & InterfaceProps,
  {}
>({
  destroyOnUnmount: true,
  onSubmit: (
    values: ArticleFragmentFormData,
    dispatch: Dispatch,
    props: ComponentProps & InterfaceProps
  ) => {
    // By using a thunk, we get access to the application state. We could use
    // mergeProps, or thread state through the component, to achieve the same
    // result -- this seemed to be the most concise way.
    dispatch((_, getState) => {
      const meta: ArticleFragmentMeta = getArticleFragmentMetaFromFormValues(
        getState(),
        props.articleFragmentId,
        values
      );
      props.onSave(meta);
    });
  }
})(FormComponent);

interface ContainerProps {
  articleExists: boolean;
  collectionId: string | null;
  getLastUpdatedBy: (collectionId: string) => string | null;
  imageSlideshowReplace: boolean;
  imageCutoutReplace: boolean;
  imageHide: boolean;
  kickerOptions: ArticleTag;
  showByline: boolean;
  editableFields?: string[];
  showKickerTag: boolean;
  showKickerSection: boolean;
  articleCapiFieldValues: CapiFields;
  imageReplace: boolean;
}

interface InterfaceProps {
  form: string;
  articleFragmentId: string;
  isSupporting?: boolean;
  onCancel: () => void;
  onSave: (meta: ArticleFragmentMeta) => void;
  frontId: string;
}

const formContainer: React.SFC<ContainerProps & InterfaceProps> = props => (
  <ArticleFragmentForm {...props} />
);

const createMapStateToProps = () => {
  const selectArticle = createSelectArticleFromArticleFragment();
  const selectFormFields = createSelectFormFieldsForCollectionItem();
  return (
    state: State,
    { articleFragmentId, isSupporting = false }: InterfaceProps
  ) => {
    const externalArticle = selectExternalArticleFromArticleFragment(
      selectSharedState(state),
      articleFragmentId
    );
    const selectValue = formValueSelector(articleFragmentId);
    const article = selectArticle(selectSharedState(state), articleFragmentId);
    const parentCollectionId =
      collectionSelectors.selectParentCollectionOfArticleFragment(
        selectSharedState(state),
        articleFragmentId
      ) || null;
    const parentCollection = parentCollectionId
      ? collectionSelectors.selectById(
          selectSharedState(state),
          parentCollectionId
        )
      : null;

    function getLastUpdatedBy(collectionId: string) {
      const collection = collectionSelectors.selectById(
        selectSharedState(state),
        collectionId
      );
      if (!collection) {
        return null;
      }
      return collection.updatedBy || null;
    }

    return {
      articleExists: !!article,
      collectionId: (parentCollection && parentCollection.id) || null,
      getLastUpdatedBy,
      initialValues: getInitialValuesForArticleFragmentForm(article),
      articleCapiFieldValues: getCapiValuesForArticleFields(externalArticle),
      editableFields:
        article && selectFormFields(state, article.uuid, isSupporting),
      kickerOptions: article
        ? selectArticleTag(selectSharedState(state), articleFragmentId)
        : {},
      imageSlideshowReplace: selectValue(state, 'imageSlideshowReplace'),
      imageHide: selectValue(state, 'imageHide'),
      imageReplace: selectValue(state, 'imageReplace'),
      imageCutoutReplace: selectValue(state, 'imageCutoutReplace'),
      showByline: selectValue(state, 'showByline'),
      showKickerTag: selectValue(state, 'showKickerTag'),
      showKickerSection: selectValue(state, 'showKickerSection'),
      cutoutImage: externalArticle
        ? getContributorImage(externalArticle)
        : undefined
    };
  };
};

export {
  getArticleFragmentMetaFromFormValues,
  getInitialValuesForArticleFragmentForm
};

export default connect<ContainerProps, {}, InterfaceProps, State>(
  createMapStateToProps
)(formContainer);
