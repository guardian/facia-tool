import React, { useCallback } from 'react';
import {
	reduxForm,
	Field,
	InjectedFormProps,
	formValueSelector,
	getFormValues,
	change,
} from 'redux-form';
import { Card, CardSizes, ChefCardMeta, Palette } from '../../types/Collection';
import { Dispatch } from '../../types/Store';
import { selectors } from '../../bundles/chefsBundle';
import { State } from '../../types/State';
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
import { squareImageCriteria } from 'constants/image';
import { ImageOptionsInputGroup } from './ImageOptionsInputGroup';
import Row from 'components/Row';
import { ImageRowContainer } from './ImageRowContainer';
import { ImageCol } from './ImageCol';
import InputLabel from 'components/inputs/InputLabel';
import ButtonDefault from 'components/inputs/ButtonDefault';
import { useDispatch } from 'react-redux';
import { startOptionsModal } from 'actions/OptionsModal';
import { PaletteForm, PaletteItem } from './PaletteForm';
import noop from 'lodash/noop';
import get from 'lodash/get';
import {
	chefPalettes,
	CustomPaletteId,
	DefaultCustomPaletteChef,
	PaletteOption,
} from 'constants/feastPalettes';
import { PaletteItemContainer } from './PaletteItemContainer';

interface FormProps {
	card: Card;
	initialValues: ChefCardMeta;
	chef: Chef | undefined;
	chefWithoutOverrides: Chef | undefined;
	size: CardSizes;
	onCancel: () => void;
	onSave: (meta: ChefCardMeta) => void;
	openPaletteModal: () => void;
	currentPalette: Palette | undefined;
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
	chef,
	chefWithoutOverrides,
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
			<FormContent size={size} marginBottom="40px">
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
					{currentPalette ? (
						<PaletteItemContainer onClick={openPaletteModal}>
							<PaletteItem size="s" palette={currentPalette} />
						</PaletteItemContainer>
					) : (
						<p>
							No palette selected.{' '}
							<ButtonDefault type="button" onClick={openPaletteModal}>
								Add a palette
							</ButtonDefault>
						</p>
					)}
				</TextOptionsInputGroup>
				<ImageOptionsInputGroup size={size}>
					<ImageRowContainer size={size}>
						<Row>
							<ImageCol>
								<InputLabel htmlFor="chefImageOverride">
									Replace image
								</InputLabel>
								<Field
									name="chefImageOverride"
									component={InputImage}
									criteria={squareImageCriteria}
									defaultImageUrl={chef?.bylineImageUrl}
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

const ConnectedChefForm = reduxForm<ChefCardMeta, FormProps, {}>({
	destroyOnUnmount: true,
	onSubmit: (values: ChefCardMeta, dispatch: Dispatch, props: FormProps) =>
		dispatch(() => props.onSave(values)),
})(Form);

interface ChefMetaFormProps {
	cardId: string;
	form: string;
	onCancel: () => void;
	onSave: (meta: ChefCardMeta) => void;
	size: CardSizes;
}

const formPaletteToPaletteOption = (
	theme: ChefCardMeta['chefTheme'] | undefined,
): PaletteOption | undefined => {
	if (!theme) {
		return;
	}

	const maybePresetPalette = chefPalettes.find((p) => p.id === theme?.id);

	return (
		maybePresetPalette ?? {
			id: CustomPaletteId,
			name: 'Custom',
			palettes: { default: theme.palette },
		}
	);
};

const paletteOptionToFormPalette = (
	paletteOption: PaletteOption,
): ChefCardMeta['chefTheme'] | undefined => {
	const palette = paletteOption.palettes.default;

	return palette
		? {
				id: paletteOption.id,
				palette,
			}
		: undefined;
};

const ChefPaletteForm = (formName: string) => () => {
	const dispatch = useDispatch();
	const fieldName = 'chefTheme';

	const currentPaletteOption = useSelector((state: State) => {
		const formValues = getFormValues(formName)(state) as {
			[T: string]: ChefCardMeta['chefTheme'];
		};
		if (!formValues) {
			return undefined;
		}

		return formPaletteToPaletteOption(get(formValues, fieldName));
	});

	const setPaletteOption = useCallback(
		(paletteOption: PaletteOption) => {
			dispatch(
				change(formName, fieldName, paletteOptionToFormPalette(paletteOption)),
			);
		},
		[formName],
	);

	return (
		<PaletteForm
			currentPaletteOption={currentPaletteOption}
			defaultCustomPaletteOption={DefaultCustomPaletteChef}
			paletteOptions={chefPalettes}
			onChange={setPaletteOption}
		/>
	);
};

export const ChefMetaForm = ({ cardId, form, ...rest }: ChefMetaFormProps) => {
	const valueSelector = formValueSelector(form);
	const card = useSelector((state: State) => selectCard(state, cardId));
	const chefWithoutOverrides = useSelector((state: State) =>
		selectors.selectById(state, card.id),
	);
	const chef = useSelector((state: State) =>
		selectors.selectChefFromCard(state, cardId),
	);
	const theme = useSelector(
		(state: State) =>
			valueSelector(state, 'chefTheme') as ChefCardMeta['chefTheme'],
	);

	const dispatch = useDispatch();
	const openPaletteModal = useCallback(
		() =>
			dispatch(
				startOptionsModal(
					'Select a palette',
					ChefPaletteForm(form),
					[{ buttonText: 'Done', callback: noop }],
					undefined,
					false,
				),
			),
		[],
	);

	return (
		<ConnectedChefForm
			chef={chef}
			chefWithoutOverrides={chefWithoutOverrides}
			card={card}
			// This cast should not be necessary once a card's meta and its cardType are linked in the Card type.
			initialValues={card.meta as ChefCardMeta}
			openPaletteModal={openPaletteModal}
			currentPalette={theme?.palette}
			form={form}
			{...rest}
		/>
	);
};
