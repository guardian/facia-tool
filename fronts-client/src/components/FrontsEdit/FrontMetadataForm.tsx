import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { styled } from 'constants/theme';
import { theme } from 'constants/theme';
import Button from 'components/inputs/ButtonDefault';
import type { State } from 'types/State';
import type { Dispatch } from 'types/Store';
import type { FrontConfig, FrontConfigResponse } from 'types/FaciaApi';
import { selectFront } from 'selectors/shared';
import { selectCollectionConfig } from 'selectors/frontsSelectors';
import { saveFrontConfig } from 'actions/Fronts';
import { editorCloseEditMetadata } from 'bundles/frontsUI';
import { priorities as priorityMap } from 'constants/priorities';

// ---------------------------------------------------------------------------
// Styles — reuse the same grid pattern as CollectionMetadataForm
// ---------------------------------------------------------------------------

const FormContainer = styled.div`
	font-family: TS3TextSans;
	font-size: 13px;
	padding: 10px 12px;
	background: ${theme.base.colors.backgroundColorLight};
	border-bottom: 1px solid ${theme.base.colors.borderColor};
`;

const FormGrid = styled.div`
	display: grid;
	grid-template-columns: 160px 1fr;
	align-items: start;
	gap: 7px 8px;
`;

const FormLabel = styled.label`
	font-weight: bold;
	color: ${theme.base.colors.text};
	font-size: 12px;
	padding-top: 4px;
`;

const FormInput = styled.input`
	font-family: TS3TextSans;
	font-size: 12px;
	padding: 3px 5px;
	border: 1px solid ${theme.base.colors.borderColor};
	border-radius: 2px;
	width: 100%;
	box-sizing: border-box;
`;

const FormTextarea = styled.textarea`
	font-family: TS3TextSans;
	font-size: 12px;
	padding: 3px 5px;
	border: 1px solid ${theme.base.colors.borderColor};
	border-radius: 2px;
	width: 100%;
	box-sizing: border-box;
	resize: vertical;
	min-height: 50px;
`;

const FormSelect = styled.select`
	font-family: TS3TextSans;
	font-size: 12px;
	padding: 3px 5px;
	border: 1px solid ${theme.base.colors.borderColor};
	border-radius: 2px;
	width: 100%;
	box-sizing: border-box;
`;

const FormCheckbox = styled.input.attrs({ type: 'checkbox' })`
	margin: 4px 0 0;
	justify-self: start;
`;

const RadioGroup = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 6px 12px;
	padding-top: 2px;
`;

const RadioLabel = styled.label`
	font-size: 12px;
	font-family: TS3TextSans;
	display: flex;
	align-items: center;
	gap: 4px;
	cursor: pointer;
`;

const Divider = styled.div`
	grid-column: 1 / -1;
	border-top: 1px solid ${theme.base.colors.borderColor};
	margin: 3px 0;
`;

const ButtonRow = styled.div`
	grid-column: 1 / -1;
	display: flex;
	justify-content: flex-end;
	gap: 8px;
	margin-top: 6px;
`;

const SaveButton = styled(Button)`
	font-family: TS3TextSans;
	font-size: 12px;
	font-weight: bold;
	padding: 4px 12px;
`;

const CancelButton = styled(Button)`
	font-family: TS3TextSans;
	font-size: 12px;
	padding: 4px 12px;
`;

// ---------------------------------------------------------------------------
// Placeholder helpers (mirrors KO front.js placeholder computeds)
// ---------------------------------------------------------------------------

function toTitleCase(str: string): string {
	return str.replace(
		/\w\S*/g,
		(txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(),
	);
}

function asPath(id: string): string[] {
	return (id + '').split('/');
}

interface FrontPlaceholders {
	navSection: string;
	webTitle: string;
	title: string;
	description: string;
	onPageDescription: string;
}

function computePlaceholders(frontId: string): FrontPlaceholders {
	const path = asPath(frontId);
	// Without access to the editions list we default to treating the first
	// path segment as the nav section (matches non-editionalised fronts).
	// For editionalised fronts (e.g. uk/sport) path[1] is correct, but we
	// can't distinguish that here without a network call.
	const navSection = path[0] ?? '';
	const webTitle =
		toTitleCase(
			path
				.slice(path.length > 1 ? 1 : 0)
				.join(' ')
				.replace(/-/g, ' '),
		) || frontId;
	const title = webTitle + (navSection ? ' | ' + toTitleCase(navSection) : '');
	const description = `Latest ${webTitle} news, comment and analysis from the Guardian, the world\u2019s leading liberal voice`;
	return {
		navSection,
		webTitle,
		title,
		description,
		onPageDescription: description,
	};
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface OwnProps {
	frontId: string;
}

interface CollectionOption {
	id: string;
	displayName: string;
}

interface StateProps {
	front: FrontConfig | undefined;
	collectionOptions: CollectionOption[];
}

interface DispatchProps {
	saveFront: (front: FrontConfigResponse & { id: string }) => Promise<void>;
	close: () => void;
}

type Props = OwnProps & StateProps & DispatchProps;

interface FormState {
	isHidden: boolean;
	navSection: string;
	webTitle: string;
	title: string;
	description: string;
	onPageDescription: string;
	imageUrl: string;
	isImageDisplayed: boolean;
	priority: string;
	canonical: string;
}

const priorityKeys = Object.keys(priorityMap);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const FrontMetadataForm = ({
	front,
	collectionOptions,
	saveFront,
	close,
}: Props) => {
	const buildFormState = (f: FrontConfig | undefined): FormState => ({
		isHidden: f?.isHidden ?? false,
		navSection: f?.navSection ?? '',
		webTitle: f?.webTitle ?? '',
		title: f?.title ?? '',
		description: f?.description ?? '',
		onPageDescription: f?.onPageDescription ?? '',
		imageUrl: f?.imageUrl ?? '',
		isImageDisplayed: f?.isImageDisplayed ?? false,
		priority: f?.priority ?? '',
		canonical: f?.canonical ?? '',
	});

	const [form, setForm] = useState<FormState>(() => buildFormState(front));

	useEffect(() => {
		setForm(buildFormState(front));
	}, [front?.id]);

	const placeholders = computePlaceholders(front?.id ?? '');

	const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
		setForm((prev) => ({ ...prev, [key]: value }));

	const handleSave = async () => {
		if (!front) return;
		const resolvedPriority = form.priority || front.priority;
		const { priority: _priority, ...frontWithoutPriority } = front;
		await saveFront({
			...frontWithoutPriority,
			...(form.isHidden ? { isHidden: true } : {}),
			navSection: form.navSection || undefined,
			webTitle: form.webTitle || undefined,
			title: form.title || undefined,
			description: form.description || undefined,
			onPageDescription: form.onPageDescription || undefined,
			imageUrl: form.imageUrl || undefined,
			...(form.isImageDisplayed ? { isImageDisplayed: true } : {}),
			...(resolvedPriority !== 'editorial'
				? { priority: resolvedPriority }
				: {}),
			canonical: form.canonical || undefined,
		});
		close();
	};

	return (
		<FormContainer>
			<FormGrid>
				{/* Hidden */}
				<FormLabel htmlFor="fmf-hidden">Hidden</FormLabel>
				<FormCheckbox
					id="fmf-hidden"
					checked={form.isHidden}
					onChange={(e) => set('isHidden', e.target.checked)}
				/>

				<Divider />

				{/* Nav section */}
				<FormLabel htmlFor="fmf-navSection">Nav section</FormLabel>
				<FormInput
					id="fmf-navSection"
					type="text"
					value={form.navSection}
					placeholder={placeholders.navSection}
					onChange={(e) => set('navSection', e.target.value)}
				/>

				{/* Name */}
				<FormLabel htmlFor="fmf-webTitle">Name</FormLabel>
				<FormInput
					id="fmf-webTitle"
					type="text"
					value={form.webTitle}
					placeholder={placeholders.webTitle}
					onChange={(e) => set('webTitle', e.target.value)}
				/>

				{/* SEO title */}
				<FormLabel htmlFor="fmf-title">SEO title</FormLabel>
				<FormTextarea
					id="fmf-title"
					value={form.title}
					placeholder={placeholders.title}
					onChange={(e) => set('title', e.target.value)}
				/>

				{/* Meta description */}
				<FormLabel htmlFor="fmf-description">Meta description</FormLabel>
				<FormTextarea
					id="fmf-description"
					value={form.description}
					placeholder={placeholders.description}
					onChange={(e) => set('description', e.target.value)}
				/>

				{/* On-page description */}
				<FormLabel htmlFor="fmf-onPageDescription">
					On-page description
				</FormLabel>
				<FormTextarea
					id="fmf-onPageDescription"
					value={form.onPageDescription}
					placeholder={placeholders.onPageDescription}
					onChange={(e) => set('onPageDescription', e.target.value)}
				/>

				<Divider />

				{/* Image URL */}
				<FormLabel htmlFor="fmf-imageUrl">Image</FormLabel>
				<FormInput
					id="fmf-imageUrl"
					type="text"
					placeholder="Image URL, e.g. copied from Batch Uploader"
					value={form.imageUrl}
					onChange={(e) => {
						set('imageUrl', e.target.value);
						if (!e.target.value) set('isImageDisplayed', false);
					}}
				/>

				{/* Display image */}
				<FormLabel htmlFor="fmf-isImageDisplayed">Display image</FormLabel>
				<FormCheckbox
					id="fmf-isImageDisplayed"
					checked={form.isImageDisplayed}
					disabled={!form.imageUrl}
					onChange={(e) => set('isImageDisplayed', e.target.checked)}
				/>

				<Divider />

				{/* Type / priority */}
				<FormLabel>Type</FormLabel>
				<RadioGroup>
					{priorityKeys.map((p) => (
						<RadioLabel key={p}>
							<input
								type="radio"
								name={`fmf-priority-${front?.id}`}
								value={p}
								checked={form.priority === p}
								onChange={() => set('priority', p)}
							/>
							{p}
						</RadioLabel>
					))}
				</RadioGroup>

				<Divider />

				{/* Canonical container */}
				<FormLabel htmlFor="fmf-canonical">Canonical container</FormLabel>
				<FormSelect
					id="fmf-canonical"
					value={form.canonical}
					onChange={(e) => set('canonical', e.target.value)}
				>
					<option value="">Select a container</option>
					{collectionOptions.map(({ id, displayName }) => (
						<option key={id} value={id}>
							{displayName}
						</option>
					))}
				</FormSelect>

				<ButtonRow>
					<CancelButton priority="default" onClick={close}>
						Cancel
					</CancelButton>
					<SaveButton onClick={handleSave} disabled={!front}>
						Save metadata
					</SaveButton>
				</ButtonRow>
			</FormGrid>
		</FormContainer>
	);
};

// ---------------------------------------------------------------------------
// Redux
// ---------------------------------------------------------------------------

const mapStateToProps = (state: State, { frontId }: OwnProps): StateProps => {
	const front = selectFront(state, { frontId });
	const collectionOptions: CollectionOption[] = (front?.collections ?? []).map(
		(id) => ({
			id,
			displayName: selectCollectionConfig(state, id)?.displayName ?? id,
		}),
	);
	return { front, collectionOptions };
};

const mapDispatchToProps = (
	dispatch: Dispatch,
	{ frontId }: OwnProps,
): DispatchProps => ({
	saveFront: (front) => dispatch(saveFrontConfig(front)) as Promise<void>,
	close: () => dispatch(editorCloseEditMetadata(frontId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(FrontMetadataForm);
