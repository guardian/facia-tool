import React, { useCallback } from 'react';
import {
	reduxForm,
	Field,
	InjectedFormProps,
	formValueSelector,
	getFormValues,
	change,
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
import { PaletteForm, PaletteItem } from './PaletteForm';
import noop from 'lodash/noop';
import InputText from 'components/inputs/InputText';
import InputContainer from 'components/inputs/InputContainer';
import {
	feastCollectionPalettes,
	DefaultCustomPaletteFeastCollection,
	PaletteOption,
	CustomPaletteId,
} from 'constants/feastPalettes';
import { get } from 'lodash';
import InputBase from 'components/inputs/InputBase';
import { TextInputLabel } from 'components/inputs/CreateResizeableTextInput';
import { PaletteItemContainer } from './PaletteItemContainer';

interface FormProps {
	card: Card;
	initialValues: FeastCollectionCardMeta;
	size: CardSizes;
	onCancel: () => void;
	onSave: (meta: FeastCollectionCardMeta) => void;
	openPaletteModal: () => void;
	currentTheme: FeastCollectionCardMeta['feastCollectionTheme'];
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
			<FormContent size={size} marginBottom="40px">
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
							<PaletteItemContainer onClick={openPaletteModal}>
								{currentTheme.lightPalette && (
									<PaletteItem
										palette={currentTheme.lightPalette}
										imageURL={currentTheme.imageURL}
									/>
								)}
								{currentTheme.darkPalette && (
									<PaletteItem
										palette={currentTheme.darkPalette}
										imageURL={currentTheme.imageURL}
									/>
								)}
							</PaletteItemContainer>
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
		props: FormProps,
	) => dispatch(() => props.onSave(values)),
})(Form);

interface FeastCollectionMetaFormProps {
	cardId: string;
	form: string;
	onCancel: () => void;
	onSave: (meta: FeastCollectionCardMeta) => void;
	size: CardSizes;
}

const formPaletteToPaletteOption = (
	theme: FeastCollectionCardMeta['feastCollectionTheme'],
): PaletteOption | undefined => {
	if (!theme) {
		return;
	}

	const maybePresetPalette = feastCollectionPalettes.find(
		(p) => p.id === theme?.id,
	);

	return (
		maybePresetPalette ?? {
			id: CustomPaletteId,
			name: 'Custom',
			palettes: {
				light: theme.lightPalette,
				dark: theme.darkPalette,
			},
			imageURL: theme.imageURL,
		}
	);
};

const paletteOptionToFormPalette = (
	paletteOption: PaletteOption,
): FeastCollectionCardMeta['feastCollectionTheme'] => {
	return {
		id: paletteOption.id,
		lightPalette: paletteOption.palettes.light,
		darkPalette: paletteOption.palettes.dark,
		imageURL: paletteOption.imageURL,
	};
};

const FeastCollectionPaletteForm = (formName: string) => () => {
	const dispatch = useDispatch();
	const fieldName = 'feastCollectionTheme';

	const currentPaletteOption = useSelector((state: State) => {
		const formValues = getFormValues(formName)(state) as {
			[T: string]: FeastCollectionCardMeta['feastCollectionTheme'];
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
		<>
			<PaletteForm
				currentPaletteOption={currentPaletteOption}
				defaultCustomPaletteOption={DefaultCustomPaletteFeastCollection}
				paletteOptions={feastCollectionPalettes}
				onChange={setPaletteOption}
			/>
			{currentPaletteOption?.id === CustomPaletteId && (
				<InputContainer>
					<TextInputLabel htmlFor="custom-image-url">
						<span>Custom image URL</span>
					</TextInputLabel>
					<InputBase
						id="custom-image-url"
						type="text"
						value={currentPaletteOption?.imageURL || ''}
						onChange={(e) => {
							e.preventDefault();
							setPaletteOption({
								...currentPaletteOption,
								imageURL: e.target.value,
							});
						}}
					/>
				</InputContainer>
			)}
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
			valueSelector(
				state,
				'feastCollectionTheme',
			) as FeastCollectionCardMeta['feastCollectionTheme'],
	);

	const dispatch = useDispatch();
	const openPaletteModal = useCallback(
		() =>
			dispatch(
				startOptionsModal(
					'Select palettes',
					FeastCollectionPaletteForm(form),
					[{ buttonText: 'Done', callback: noop }],
					undefined,
					false,
				),
			),
		[],
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
