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
import { styled, theme } from 'constants/theme';
import Button from 'shared/components/input/ButtonDefault';
import ContentContainer from 'shared/components/layout/ContentContainer';
import {
  createSelectArticleFromCard,
  selectSharedState,
  selectExternalArticleFromCard,
  selectArticleTag
} from 'shared/selectors/shared';
import { createSelectFormFieldsForCard } from 'selectors/formSelectors';
import { CardMeta, ArticleTag } from 'shared/types/Collection';
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
  CardFormData,
  ImageData,
  getCardMetaFromFormValues,
  getInitialValuesForCardForm,
  getCapiValuesForArticleFields,
  shouldRenderField
} from 'util/form';
import { CapiFields } from 'util/form';
import { Dispatch } from 'types/Store';
import {
  cardImageCriteria,
  editionsCardImageCriteria,
  editionsMobileCardImageCriteria,
  editionsTabletCardImageCriteria
} from 'constants/image';
import { selectors as collectionSelectors } from 'shared/bundles/collectionsBundle';
import { getContributorImage } from 'util/CAPIUtils';
import { EditMode } from 'types/EditMode';
import { selectEditMode } from 'selectors/pathSelectors';
import { ValidationResponse } from 'shared/util/validateImageSrc';
import InputLabel from 'shared/components/input/InputLabel';

interface ComponentProps extends ContainerProps {
  articleExists: boolean;
  collectionId: string | null;
  getLastUpdatedBy: (id: string) => string | null;
  cardId: string;
  showKickerTag: boolean;
  showKickerSection: boolean;
  pickedKicker: string | undefined;
  kickerOptions: ArticleTag;
  cutoutImage?: string;
  primaryImage: ValidationResponse | null;
  coverCardImageReplace?: boolean;
  coverCardMobileImage?: ImageData;
  coverCardTabletImage?: ImageData;
  size?: string;
}

type Props = ComponentProps &
  InterfaceProps &
  InjectedFormProps<CardFormData, ComponentProps & InterfaceProps, {}>;

type RenderSlideshowProps = WrappedFieldArrayProps<ImageData> & {
  frontId: string;
};

const FormContainer = styled(ContentContainer.withComponent('form'))`
  display: flex;
  flex-direction: column;
  flex: 1;
  background-color: ${theme.base.colors.formBackground};
`;

const FormContent = styled.div`
  flex: 3;
  display: flex;
  flex-direction: ${(props: { size?: string }) =>
    props.size !== 'wide' ? 'column' : 'row'};
`;

const RowContainer = styled.div`
  overflow: hidden;
`;

const TextOptionsContainer = styled(InputGroup)`
  flex: 2;
`;

const ImageOptionsContainer = styled.div`
  display: flex;
  height: fit-content;
  flex-wrap: wrap;
  flex: 1;
  flex-direction: column;
  min-width: 300px;
  margin-top: ${(props: { size?: string }) =>
    props.size !== 'wide' ? 0 : '6px'};
`;

const SlideshowRowContainer = styled(RowContainer)`
  flex: 1 1 auto;
  overflow: visible;
  margin-left: ${(props: { size?: string }) =>
    props.size !== 'wide' ? 0 : '10px'};
`;

const ImageRowContainer = styled(RowContainer)`
  flex: 1 1 auto;
  margin-left: ${(props: { size?: string }) =>
    props.size !== 'wide' ? 0 : '10px'};
`;

const ButtonContainer = styled.div`
  margin-left: auto;
  margin-right: -10px;
  margin-bottom: -10px;
`;

const SlideshowRow = styled(Row)`
  margin-top: 10px;
  margin-bottom: 5px;
`;

const SlideshowLabel = styled.div`
  font-size: 12px;
  color: ${theme.shared.colors.greyMedium};
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
  border-bottom: 1px solid ${theme.shared.base.colors.borderColor};
`;

const SlideshowCol = styled(Col)`
  max-width: 100px;
  min-width: 0;
`;

const ToggleCol = styled(Col)`
  margin-top: 24px;
`;

const RenderSlideshow = ({ fields, frontId }: RenderSlideshowProps) => (
  <>
    {fields.map((name, index) => (
      <SlideshowCol key={`${name}-${index}`}>
        <Field
          name={name}
          component={InputImage}
          small
          criteria={cardImageCriteria}
          frontId={frontId}
        />
      </SlideshowCol>
    ))}
  </>
);

const CheckboxFieldsContainer: React.SFC<{
  children: Array<React.ReactElement<{ name: string }>>;
  editableFields: string[];
  size?: string;
}> = ({ children, editableFields, size }) => {
  const childrenToRender = children.filter(child =>
    shouldRenderField(child.props.name, editableFields)
  );
  return (
    <FieldsContainerWrap>
      {childrenToRender.map(child => {
        return (
          <FieldContainer key={child.props.name} size={size}>
            {child}
          </FieldContainer>
        );
      })}
    </FieldsContainerWrap>
  );
};

const FieldContainer = styled(Col)`
  flex: ${(props: { size?: string }) =>
    props.size === 'wide' ? '0 0 auto' : 1};
  margin-bottom: 8px;
  white-space: nowrap;
  & label {
    padding-left: 3px;
    padding-right: 5px;
  }
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
const CardReplacementWarning = styled.div`
  color: red;
`;

const KickerSuggestionButton = styled(InputButton)`
  background: transparent;
  border: 1px solid ${theme.shared.colors.greyMediumLight};
  color: ${theme.shared.colors.blackDark};
  &:hover:enabled {
    background-color: ${theme.shared.colors.greyLight};
  }
`;

const getInputId = (cardId: string, label: string) => `${cardId}-${label}`;

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

  public render() {
    const {
      cardId,
      change,
      kickerOptions,
      pickedKicker,
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
      editMode,
      primaryImage,
      hasMainVideo,
      coverCardImageReplace,
      coverCardMobileImage,
      coverCardTabletImage
    } = this.props;

    const isEditionsMode = editMode === 'editions';

    const imageDefined = (img: ImageData | undefined) => img && img.src;

    const invalidCardReplacement = coverCardImageReplace
      ? !imageDefined(coverCardMobileImage) ||
        !imageDefined(coverCardTabletImage)
      : false;

    const setCustomKicker = (customKickerValue: string) => {
      change('customKicker', customKickerValue);
      change('showKickerCustom', true);

      // kicker suggestions now set the value of `customKicker` rather than set a flag
      // set the old flags to false
      ['showKickerTag', 'showKickerSection'].forEach(field =>
        change(field, false)
      );
    };

    const renderKickerSuggestion = (
      value: string,
      index: number,
      array: string[]
    ) => (
      <Field
        name={'kickerSuggestion' + value}
        key={'kickerSuggestion' + value}
        component={KickerSuggestionButton}
        buttonText={value}
        size="s"
        onClick={() => setCustomKicker(value)}
      />
    );

    const getKickerContents = () => {
      const uniqueKickerSuggestions = [
        ...new Set([
          pickedKicker || '',
          kickerOptions.webTitle || '',
          kickerOptions.sectionName || ''
        ])
      ];
      return (
        <>
          <span>Suggested:&nbsp;</span>
          {uniqueKickerSuggestions
            .filter(value => !!value)
            .map(renderKickerSuggestion)}
          <span>&nbsp;&nbsp;&nbsp;</span>
          <Field
            name={'clearKickerSuggestion'}
            key={'clearKickerSuggestion'}
            component={KickerSuggestionButton}
            buttonText={'Clear'}
            style={{ fontStyle: 'italic' }}
            size="s"
            onClick={() => setCustomKicker('')}
          />
        </>
      );
    };

    return (
      <FormContainer
        data-testid="edit-form"
        topBorder={false}
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
        <FormContent size={this.props.size}>
          <TextOptionsContainer>
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
                <KickerSuggestionsContainer>
                  {getKickerContents()}
                </KickerSuggestionsContainer>
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
            <CheckboxFieldsContainer
              editableFields={editableFields}
              size={this.props.size}
            >
              <Field
                name="isBoosted"
                component={InputCheckboxToggleInline}
                label="Boost"
                id={getInputId(cardId, 'boost')}
                type="checkbox"
              />
              <Field
                name="showLargeHeadline"
                component={InputCheckboxToggleInline}
                label="Large headline"
                id={getInputId(cardId, 'large-headline')}
                type="checkbox"
              />
              <Field
                name="showQuotedHeadline"
                component={InputCheckboxToggleInline}
                label="Quote headline"
                id={getInputId(cardId, 'quote-headline')}
                type="checkbox"
              />
              <Field
                name="isBreaking"
                component={InputCheckboxToggleInline}
                label="Breaking News"
                id={getInputId(cardId, 'breaking-news')}
                type="checkbox"
                dataTestId="edit-form-breaking-news-toggle"
              />
              <Field
                name="showByline"
                component={InputCheckboxToggleInline}
                label="Show Byline"
                id={getInputId(cardId, 'show-byline')}
                type="checkbox"
              />
              <Field
                name="showLivePlayable"
                component={InputCheckboxToggleInline}
                label="Show updates"
                id={getInputId(cardId, 'show-updates')}
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
          </TextOptionsContainer>
          <ImageOptionsContainer size={this.props.size}>
            <ImageRowContainer size={this.props.size}>
              <Row>
                <ImageCol faded={imageHide || !!coverCardImageReplace}>
                  <InputLabel htmlFor={this.getImageFieldName()}>
                    Trail image
                  </InputLabel>
                  <ConditionalField
                    permittedFields={editableFields}
                    name={this.getImageFieldName()}
                    component={InputImage}
                    disabled={imageHide || coverCardImageReplace}
                    criteria={
                      isEditionsMode
                        ? editionsCardImageCriteria
                        : cardImageCriteria
                    }
                    frontId={frontId}
                    defaultImageUrl={
                      imageCutoutReplace
                        ? cutoutImage
                        : articleCapiFieldValues.thumbnail
                    }
                    useDefault={!imageCutoutReplace && !imageReplace}
                    message={
                      imageCutoutReplace ? 'Add cutout' : 'Replace image'
                    }
                    hasVideo={hasMainVideo}
                    onChange={this.handleImageChange}
                  />
                </ImageCol>
                <ToggleCol flex={2}>
                  <InputGroup>
                    <ConditionalField
                      permittedFields={editableFields}
                      name="imageHide"
                      component={InputCheckboxToggleInline}
                      label="Hide media"
                      id={getInputId(cardId, 'hide-media')}
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
                      id={getInputId(cardId, 'use-cutout')}
                      type="checkbox"
                      default={false}
                      onChange={_ =>
                        this.changeImageField('imageCutoutReplace')
                      }
                    />
                  </InputGroup>
                  <InputGroup>
                    <ConditionalField
                      permittedFields={editableFields}
                      name="coverCardImageReplace"
                      id={getInputId(cardId, 'coverCardImageReplace')}
                      component={InputCheckboxToggleInline}
                      label="Replace Cover Card Image"
                      type="checkbox"
                      default={false}
                      onChange={_ =>
                        this.changeImageField('coverCardImageReplace')
                      }
                    />
                  </InputGroup>
                  <InputGroup>
                    <ConditionalField
                      permittedFields={editableFields}
                      name="showMainVideo"
                      component={InputCheckboxToggleInline}
                      label="Show video"
                      id={getInputId(cardId, 'show-video')}
                      type="checkbox"
                      onChange={_ => this.changeImageField('showMainVideo')}
                    />
                  </InputGroup>
                  <InputGroup>
                    <ConditionalField
                      permittedFields={editableFields}
                      name="imageSlideshowReplace"
                      component={InputCheckboxToggleInline}
                      label="Slideshow"
                      id={getInputId(cardId, 'slideshow')}
                      type="checkbox"
                      onChange={_ =>
                        this.changeImageField('imageSlideshowReplace')
                      }
                    />
                  </InputGroup>
                  {primaryImage && !!primaryImage.src && (
                    <InputGroup>
                      <ConditionalField
                        permittedFields={editableFields}
                        name="imageReplace"
                        component={InputCheckboxToggleInline}
                        label="Use replacement image"
                        id={getInputId(cardId, 'image-replace')}
                        type="checkbox"
                        default={false}
                        onChange={_ => this.changeImageField('imageReplace')}
                      />
                    </InputGroup>
                  )}
                </ToggleCol>
              </Row>
              <ConditionalComponent
                permittedNames={editableFields}
                name={['primaryImage', 'imageHide']}
              />
            </ImageRowContainer>
            {imageSlideshowReplace && (
              <SlideshowRowContainer size={this.props.size}>
                <SlideshowRow>
                  <FieldArray
                    name="slideshow"
                    frontId={frontId}
                    component={RenderSlideshow}
                  />
                </SlideshowRow>
                <SlideshowLabel>Drag and drop up to five images</SlideshowLabel>
              </SlideshowRowContainer>
            )}
          </ImageOptionsContainer>
          {isEditionsMode && coverCardImageReplace && (
            <RowContainer>
              <Row>
                <ImageCol faded={!coverCardImageReplace}>
                  <Field
                    name="coverCardMobileImage"
                    component={InputImage}
                    message="Add Mobile Card Image"
                    criteria={editionsMobileCardImageCriteria}
                    disabled={!coverCardImageReplace}
                  />
                </ImageCol>
                <ImageCol faded={!coverCardImageReplace}>
                  <Field
                    name="coverCardTabletImage"
                    component={InputImage}
                    message="Add Tablet Card Image"
                    criteria={editionsTabletCardImageCriteria}
                    disabled={!coverCardImageReplace}
                  />
                </ImageCol>
                <Col flex={2}>
                  {invalidCardReplacement && (
                    <CardReplacementWarning>
                      You must set both the mobile and tablet card overrides!
                    </CardReplacementWarning>
                  )}
                </Col>
              </Row>
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
            disabled={pristine || !articleExists || invalidCardReplacement}
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

  private handleImageChange: EventWithDataHandler<React.ChangeEvent<any>> = (
    e: unknown,
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
    const allImageFields = [
      'imageHide',
      'imageCutoutReplace',
      'imageSlideshowReplace',
      'imageReplace',
      'showMainVideo',
      'coverCardImageReplace'
    ];

    allImageFields.forEach(field => {
      if (field === fieldToSet) {
        this.props.change(field, true);
      } else {
        this.props.change(field, false);
      }
    });
  };
}

const CardForm = reduxForm<CardFormData, ComponentProps & InterfaceProps, {}>({
  destroyOnUnmount: true,
  onSubmit: (
    values: CardFormData,
    dispatch: Dispatch,
    props: ComponentProps & InterfaceProps
  ) => {
    // By using a thunk, we get access to the application state. We could use
    // mergeProps, or thread state through the component, to achieve the same
    // result -- this seemed to be the most concise way.
    dispatch((_, getState) => {
      const meta: CardMeta = getCardMetaFromFormValues(
        getState(),
        props.cardId,
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
  pickedKicker: string | undefined;
  showByline: boolean;
  editableFields?: string[];
  showKickerTag: boolean;
  showKickerSection: boolean;
  articleCapiFieldValues: CapiFields;
  imageReplace: boolean;
  isBreaking: boolean;
  editMode: EditMode;
  primaryImage: ValidationResponse | null;
  hasMainVideo: boolean;
}

interface InterfaceProps {
  form: string;
  cardId: string;
  isSupporting?: boolean;
  onCancel: () => void;
  onSave: (meta: CardMeta) => void;
  frontId: string;
  size?: string;
}

const formContainer: React.SFC<ContainerProps & InterfaceProps> = props => (
  <CardForm {...props} />
);

const createMapStateToProps = () => {
  const selectArticle = createSelectArticleFromCard();
  const selectFormFields = createSelectFormFieldsForCard();
  return (state: State, { cardId, isSupporting = false }: InterfaceProps) => {
    const externalArticle = selectExternalArticleFromCard(
      selectSharedState(state),
      cardId
    );
    const valueSelector = formValueSelector(cardId);
    const article = selectArticle(selectSharedState(state), cardId);
    const parentCollectionId =
      collectionSelectors.selectParentCollectionOfCard(
        selectSharedState(state),
        cardId
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
      hasMainVideo: !!article && !!article.hasMainVideo,
      collectionId: (parentCollection && parentCollection.id) || null,
      getLastUpdatedBy,
      initialValues: getInitialValuesForCardForm(article),
      articleCapiFieldValues: getCapiValuesForArticleFields(externalArticle),
      editableFields:
        article && selectFormFields(state, article.uuid, isSupporting),
      kickerOptions: article
        ? selectArticleTag(selectSharedState(state), cardId)
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
      editMode: selectEditMode(state),
      primaryImage: valueSelector(state, 'primaryImage'),
      coverCardImageReplace: valueSelector(state, 'coverCardImageReplace'),
      coverCardMobileImage: valueSelector(state, 'coverCardMobileImage'),
      coverCardTabletImage: valueSelector(state, 'coverCardTabletImage'),
      pickedKicker: !!article ? article.pickedKicker : undefined
    };
  };
};

export { getCardMetaFromFormValues, getInitialValuesForCardForm };

export default connect<ContainerProps, {}, InterfaceProps, State>(
  createMapStateToProps
)(formContainer);