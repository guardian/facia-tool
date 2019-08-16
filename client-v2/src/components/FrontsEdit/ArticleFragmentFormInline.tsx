import React, { SyntheticEvent } from 'react';
import { connect } from 'react-redux';
import {
  reduxForm,
  InjectedFormProps,
  formValueSelector,
  Field,
  EventWithDataHandler,
  WrappedFieldArrayProps,
  FieldArray
} from 'redux-form';
import { styled } from 'constants/theme';
import Button from 'shared/components/input/ButtonDefault';
import ContentContainer from 'shared/components/layout/ContentContainer';
import {
  createSelectArticleFromArticleFragment,
  selectSharedState,
  selectExternalArticleFromArticleFragment,
  selectArticleTag
} from 'shared/selectors/shared';
import { createSelectFormFieldsForCollectionItem } from 'selectors/formSelectors';
import { ArticleFragmentMeta, ArticleTag } from 'shared/types/Collection';
import InputText from 'shared/components/input/InputText';
import InputTextArea from 'shared/components/input/InputTextArea';
import InputCheckboxToggleInline from 'shared/components/input/InputCheckboxToggleInline';
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
  getCapiValuesForArticleFields,
  shouldRenderField
} from 'util/form';
import { CapiFields } from 'util/form';
import { Dispatch } from 'types/Store';
import {
  articleFragmentImageCriteria,
  editionsArticleFragmentImageCriteria
} from 'constants/image';
import { selectors as collectionSelectors } from 'shared/bundles/collectionsBundle';
import { getContributorImage } from 'util/CAPIUtils';
import { EditMode } from 'types/EditMode';
import { selectEditMode } from 'selectors/pathSelectors';
import console = require('console');

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

type RenderSlideshowProps = WrappedFieldArrayProps<ImageData> & {
  frontId: string;
};

const FormContainer = styled(ContentContainer.withComponent('form'))`
  display: flex;
  flex-direction: column;
  flex: 1;
  background-color: ${({ theme }) => theme.base.colors.formBackground};
`;

const FormContent = styled('div')`
  flex: 1;
`;

const RowContainer = styled('div')`
  overflow: hidden;
`;

const ButtonContainer = styled('div')`
  margin-left: auto;
  margin-right: -10px;
  margin-bottom: -10px;
`;

const SlideshowRow = styled(Row)`
  margin-top: 10px;
  margin-bottom: 5px;
`;

const SlideshowLabel = styled('div')`
  font-size: 12px;
  color: ${({ theme }) => theme.shared.colors.greyMedium};
  margin-bottom: 12px;
`;

const ImageCol = styled(Col)`
  flex: initial;
  flex-shrink: 0;
  transition: opacity 0.15s;
  opacity: ${(props: { faded: boolean }) => (props.faded ? 0.6 : 1)};
`;

const CollectionEditedError = styled.div`
  background-color: yellow;
  margin-bottom: 1em;
  padding: 1em;
`;

const FieldsContainerWrap = styled(Row)`
  flex-wrap: wrap;
  padding-bottom: 4px;
  border-bottom: 1px solid
    ${({ theme }) => theme.shared.base.colors.borderColor};
`;

const SlideshowCol = styled(Col)`
  max-width: 100px;
  min-width: 0;
`;

const RenderSlideshow = ({ fields, frontId }: RenderSlideshowProps) => (
  <>
    {fields.map((name, index) => (
      <SlideshowCol key={`${name}-${index}`}>
        <Field
          name={name}
          component={InputImage}
          small
          criteria={articleFragmentImageCriteria}
          frontId={frontId}
        />
      </SlideshowCol>
    ))}
  </>
);

const CheckboxFieldsContainer: React.SFC<{
  children: Array<React.ReactElement<{ name: string }>>;
  editableFields: string[];
}> = ({ children, editableFields }) => {
  const childrenToRender = children.filter(child =>
    shouldRenderField(child.props.name, editableFields)
  );
  return (
    <FieldsContainerWrap>
      {childrenToRender.map(child => {
        return <FieldContainer key={child.props.name}>{child}</FieldContainer>;
      })}
    </FieldsContainerWrap>
  );
};

const FieldContainer = styled(Col)`
  flex-basis: calc(100% / 4);
  min-width: 125px; /* Prevents labels breaking across lines */
  margin-bottom: 8px;
`;

const KickerSuggestionsContainer = styled.div`
  flex-wrap: wrap;
  justify-content: flex-end;
  padding-left: 5px;
  display: flex;
  margin-left: auto;
  font-size: 12px;
  font-weight: normal;
`;

const getInputId = (articleFragmentId: string, label: string) =>
  `${articleFragmentId}-${label}`;

interface FormComponentState {
  lastKnownCollectionId: string | null;
  displayImageReplaceToggle: boolean;
}

class FormComponent extends React.Component<Props, FormComponentState> {
  public static getDerivedStateFromProps(props: Props) {
    return props.collectionId
      ? { lastKnownCollectionId: props.collectionId }
      : {};
  }

  public state: FormComponentState = {
    lastKnownCollectionId: null,
    displayImageReplaceToggle: false
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
      imageHide,
      articleCapiFieldValues,
      pristine,
      showByline,
      editableFields = [],
      showKickerTag,
      showKickerSection,
      frontId,
      articleExists,
      imageReplace,
      imageCutoutReplace,
      cutoutImage,
      imageSlideshowReplace,
      isBreaking,
      editMode
    } = this.props;

    const isEditionsMode = editMode === 'editions';

    const setCustomKicker = (customKickerValue: string) => {
      change('customKicker', customKickerValue);
      change('showKickerCustom', true);

      // kicker suggestions now set the value of `customKicker` rather than set a flag
      // set the old flags to false
      ['showKickerTag', 'showKickerSection'].forEach(field =>
        change(field, false)
      );
    };

    const getKickerContents = () => {
      return (
        <>
          <span>Suggestions&nbsp;</span>
          {kickerOptions.webTitle && (
            <Field
              name="showKickerTag"
              component={InputButton}
              buttonText={kickerOptions.webTitle}
              selected={showKickerTag}
              size="s"
              onClick={() => setCustomKicker(kickerOptions.webTitle!)}
            />
          )}
          &nbsp;
          {kickerOptions.sectionName && (
            <Field
              name="showKickerSection"
              component={InputButton}
              selected={showKickerSection}
              size="s"
              buttonText={kickerOptions.sectionName}
              onClick={() => setCustomKicker(kickerOptions.sectionName!)}
            />
          )}
        </>
      );
    };

    const hasKickerSuggestions = !!(
      kickerOptions.webTitle || kickerOptions.sectionName
    );

    return (
      <FormContainer
        data-testid="edit-form"
        onClick={
          (e: React.MouseEvent) =>
            e.stopPropagation() /* Prevent clicks passing through the form */
        }
      >
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
              name="customKicker"
              label="Kicker"
              component={InputText}
              disabled={isBreaking}
              title={
                isBreaking
                  ? "You cannot edit the kicker if the 'Breaking News' toggle is set."
                  : ''
              }
              labelContent={
                hasKickerSuggestions ? (
                  <KickerSuggestionsContainer>
                    {getKickerContents()}
                  </KickerSuggestionsContainer>
                ) : (
                  undefined
                )
              }
              placeholder="Add custom kicker"
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
                if (e) {
                  setCustomKicker(e.target.value);
                }
              }}
            />
            {shouldRenderField('headline', editableFields) && (
              <Field
                permittedFields={editableFields}
                name="headline"
                label="Headline"
                placeholder={articleCapiFieldValues.headline}
                component={InputTextArea}
                rows="2"
                originalValue={articleCapiFieldValues.headline}
                data-testid="edit-form-headline-field"
              />
            )}
            <CheckboxFieldsContainer editableFields={editableFields}>
              <Field
                name="isBoosted"
                component={InputCheckboxToggleInline}
                label="Boost"
                id={getInputId(articleFragmentId, 'boost')}
                type="checkbox"
              />
              <Field
                name="showLargeHeadline"
                component={InputCheckboxToggleInline}
                label="Large headline"
                id={getInputId(articleFragmentId, 'large-headline')}
                type="checkbox"
              />
              <Field
                name="showQuotedHeadline"
                component={InputCheckboxToggleInline}
                label="Quote headline"
                id={getInputId(articleFragmentId, 'quote-headline')}
                type="checkbox"
              />
              <Field
                name="isBreaking"
                component={InputCheckboxToggleInline}
                label="Breaking News"
                id={getInputId(articleFragmentId, 'breaking-news')}
                type="checkbox"
                dataTestId="edit-form-breaking-news-toggle"
              />
              <Field
                name="showByline"
                component={InputCheckboxToggleInline}
                label="Show Byline"
                id={getInputId(articleFragmentId, 'show-byline')}
                type="checkbox"
              />
              <Field
                name="showLivePlayable"
                component={InputCheckboxToggleInline}
                label="Show updates"
                id={getInputId(articleFragmentId, 'show-updates')}
                type="checkbox"
              />
              <Field
                name="showMainVideo"
                component={InputCheckboxToggleInline}
                label="Show video"
                id={getInputId(articleFragmentId, 'show-video')}
                type="checkbox"
              />
            </CheckboxFieldsContainer>
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
              name="trailText"
              component={InputTextArea}
              placeholder={articleCapiFieldValues.trailText}
              originalValue={articleCapiFieldValues.trailText}
              label="Trail text"
            />
            <ConditionalField
              permittedFields={editableFields}
              name="sportScore"
              label="Sport Score"
              component={InputText}
              placeholder=""
              originalValue={''}
            />
          </InputGroup>
          <RowContainer>
            <Row>
              <ImageCol faded={imageHide}>
                <ConditionalField
                  permittedFields={editableFields}
                  name={this.getImageFieldName()}
                  component={InputImage}
                  disabled={imageHide}
                  criteria={
                    isEditionsMode
                      ? editionsArticleFragmentImageCriteria
                      : articleFragmentImageCriteria
                  }
                  frontId={frontId}
                  defaultImageUrl={
                    imageCutoutReplace
                      ? cutoutImage
                      : articleCapiFieldValues.thumbnail
                  }
                  useDefault={!imageCutoutReplace && !imageReplace}
                  message={imageCutoutReplace ? 'Add cutout' : 'Replace image'}
                  onChange={this.handleImageChange}
                  setDisplayImageReplaceToggle={
                    this.setDisplayImageReplaceToggle
                  }
                />
              </ImageCol>
              <Col flex={2}>
                <InputGroup>
                  <ConditionalField
                    permittedFields={editableFields}
                    name="imageHide"
                    component={InputCheckboxToggleInline}
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
                    component={InputCheckboxToggleInline}
                    label="Use cutout"
                    id={getInputId(articleFragmentId, 'use-cutout')}
                    type="checkbox"
                    default={false}
                    onChange={_ => this.changeImageField('imageCutoutReplace')}
                  />
                </InputGroup>
                <InputGroup>
                  <ConditionalField
                    permittedFields={editableFields}
                    name="imageSlideshowReplace"
                    component={InputCheckboxToggleInline}
                    label="Slideshow"
                    id={getInputId(articleFragmentId, 'slideshow')}
                    type="checkbox"
                    onChange={_ =>
                      this.changeImageField('imageSlideshowReplace')
                    }
                  />
                </InputGroup>
                {this.state.displayImageReplaceToggle && (
                  <InputGroup>
                    <ConditionalField
                      permittedFields={editableFields}
                      name="imageReplace"
                      component={InputCheckboxToggleInline}
                      label="Use original image"
                      id={getInputId(articleFragmentId, 'image-replace')}
                      type="checkbox"
                      default={true}
                      onChange={_ => this.changeImageField('imageReplace')}
                    />
                  </InputGroup>
                )}
              </Col>
            </Row>
            <ConditionalComponent
              permittedNames={editableFields}
              name={['primaryImage', 'imageHide']}
            />
          </RowContainer>
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
        <ButtonContainer>
          <Button onClick={this.handleCancel} type="button" size="l">
            Cancel
          </Button>
          <Button
            priority="primary"
            onClick={this.handleSubmit}
            disabled={pristine || !articleExists}
            size="l"
            data-testid="edit-form-save-button"
          >
            Save
          </Button>
        </ButtonContainer>
      </FormContainer>
    );
  }

  private handleSubmit = (e: SyntheticEvent<any>) => {
    e.stopPropagation();
    this.props.handleSubmit(e);
  };

  private handleCancel = (e: SyntheticEvent<any>) => {
    e.stopPropagation();
    this.props.onCancel();
  };

  private getImageFieldName = () => {
    if (this.props.imageCutoutReplace) {
      return 'cutoutImage';
    }
    return 'primaryImage';
  };

  private setDisplayImageReplaceToggle = (display: boolean) => {
    console.log('display image replace toggle got hit', display);
    this.setState({ displayImageReplaceToggle: display });
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

  private changeImageField = (fieldToSet: string) => {
    this.allImageFields.forEach(field => {
      if (field === fieldToSet) {
        if (fieldToSet === 'imageReplace') {
          // this.setState({ displayImageReplaceToggle: true });
          this.props.change(field, false);
        } else {
          this.props.change(field, true);
        }
      } else {
        this.props.change(field, false);
      }
    });
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
  isBreaking: boolean;
  editMode: EditMode;
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
    const valueSelector = formValueSelector(articleFragmentId);
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
      imageSlideshowReplace: valueSelector(state, 'imageSlideshowReplace'),
      imageHide: valueSelector(state, 'imageHide'),
      imageReplace: valueSelector(state, 'imageReplace'),
      imageCutoutReplace: valueSelector(state, 'imageCutoutReplace'),
      showByline: valueSelector(state, 'showByline'),
      showKickerTag: valueSelector(state, 'showKickerTag'),
      showKickerSection: valueSelector(state, 'showKickerSection'),
      isBreaking: valueSelector(state, 'isBreaking'),
      cutoutImage: externalArticle
        ? getContributorImage(externalArticle)
        : undefined,
      editMode: selectEditMode(state)
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
