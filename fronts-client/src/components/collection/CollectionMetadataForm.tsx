import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { styled } from 'constants/theme';
import { theme } from 'constants/theme';
import Button from 'components/inputs/ButtonDefault';
import type { State } from 'types/State';
import type { Dispatch } from 'types/Store';
import type { Collection } from 'types/Collection';
import type { CollectionConfig } from 'types/FaciaApi';
import type { CollectionUpdateMode } from 'strategies/update-collection';
import {
	selectCollectionConfig,
	selectCollectionDisplayName,
} from 'selectors/frontsSelectors';
import { selectors as collectionSelectors } from 'bundles/collectionsBundle';
import { updateCollection as updateCollectionAction } from 'actions/Collections';
import { selectPriority } from 'selectors/pathSelectors';
import { editorCloseEditMetadata } from 'bundles/frontsUI';

const SCROLLABLE_OR_STATIC_TYPES = [
	'scrollable/small',
	'scrollable/medium',
	'static/medium/4',
];

const SUPPRESS_IMAGES_TYPES = [
	...SCROLLABLE_OR_STATIC_TYPES,
	'flexible/general',
];

const USER_VISIBILITIES = ['all', 'subscriber', 'non-subscriber'];

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const FormContainer = styled.div`
	font-family: TS3TextSans;
	font-size: 13px;
	padding: 10px 12px;
	background: ${theme.base.colors.backgroundColorLight};
	border-top: 1px solid ${theme.base.colors.borderColor};
`;

const FormGrid = styled.div`
	display: grid;
	grid-template-columns: 140px 1fr;
	align-items: center;
	gap: 6px 8px;
`;

const FormLabel = styled.label`
	font-weight: bold;
	color: ${theme.base.colors.text};
	font-size: 12px;
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
	margin: 0;
	justify-self: start;
`;

const Divider = styled.div`
	grid-column: 1 / -1;
	border-top: 1px solid ${theme.base.colors.borderColor};
	margin: 4px 0;
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
// Types
// ---------------------------------------------------------------------------

interface OwnProps {
	collectionId: string;
	frontId: string;
}

interface StateProps {
	collection: Collection | undefined;
	collectionConfig: CollectionConfig | undefined;
	displayName: string;
	priority: string;
}

interface DispatchProps {
	updateCollection: (
		collection: Collection,
		mode: CollectionUpdateMode,
	) => void;
	closeEditMetadata: () => void;
}

type Props = OwnProps & StateProps & DispatchProps;

interface FormState {
	displayName: string;
	href: string;
	description: string;
	userVisibility: string;
	targetedTerritory: string;
	showTags: boolean;
	showSections: boolean;
	hideKickers: boolean;
	showDateHeader: boolean;
	showLatestUpdate: boolean;
	excludeFromRss: boolean;
	hideShowMore: boolean;
	uneditable: boolean;
	displayEditWarning: boolean;
	suppressImages: boolean;
	maxItemsToDisplay: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const CollectionMetadataForm = ({
	collection,
	collectionConfig,
	displayName,
	priority,
	closeEditMetadata,
	updateCollection,
}: Props) => {
	const collectionType = collection?.type ?? collectionConfig?.type ?? '';

	const [form, setForm] = useState<FormState>({
		displayName: collection?.displayName ?? displayName,
		href: collectionConfig?.href ?? '',
		description: collectionConfig?.description ?? '',
		userVisibility: collectionConfig?.userVisibility ?? '',
		targetedTerritory: collection?.targetedTerritory ?? '',
		showTags: collectionConfig?.showTags ?? false,
		showSections: collectionConfig?.showSections ?? false,
		hideKickers: collectionConfig?.hideKickers ?? false,
		showDateHeader: collectionConfig?.showDateHeader ?? false,
		showLatestUpdate: collectionConfig?.showLatestUpdate ?? false,
		excludeFromRss: collectionConfig?.excludeFromRss ?? false,
		hideShowMore: collectionConfig?.hideShowMore ?? false,
		uneditable: collection?.uneditable ?? false,
		displayEditWarning:
			collection?.frontsToolSettings?.displayEditWarning ?? false,
		suppressImages: collection?.displayHints?.suppressImages ?? false,
		maxItemsToDisplay: String(
			collection?.displayHints?.maxItemsToDisplay ?? '',
		),
	});

	// Re-sync if the collection changes externally
	useEffect(() => {
		setForm({
			displayName: collection?.displayName ?? displayName,
			href: collectionConfig?.href ?? '',
			description: collectionConfig?.description ?? '',
			userVisibility: collectionConfig?.userVisibility ?? '',
			targetedTerritory: collection?.targetedTerritory ?? '',
			showTags: collectionConfig?.showTags ?? false,
			showSections: collectionConfig?.showSections ?? false,
			hideKickers: collectionConfig?.hideKickers ?? false,
			showDateHeader: collectionConfig?.showDateHeader ?? false,
			showLatestUpdate: collectionConfig?.showLatestUpdate ?? false,
			excludeFromRss: collectionConfig?.excludeFromRss ?? false,
			hideShowMore: collectionConfig?.hideShowMore ?? false,
			uneditable: collection?.uneditable ?? false,
			displayEditWarning:
				collection?.frontsToolSettings?.displayEditWarning ?? false,
			suppressImages: collection?.displayHints?.suppressImages ?? false,
			maxItemsToDisplay: String(
				collection?.displayHints?.maxItemsToDisplay ?? '',
			),
		});
	}, [collection?.id]);

	const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
		setForm((prev) => ({ ...prev, [key]: value }));

	const handleSave = () => {
		if (!collection) return;
		const maxItems = parseInt(form.maxItemsToDisplay, 10);
		updateCollection(
			{
				...collection,
				displayName: form.displayName.trim() || collection.displayName,
				uneditable: form.uneditable,
				targetedTerritory: form.targetedTerritory || undefined,
				frontsToolSettings: {
					...collection.frontsToolSettings,
					displayEditWarning: form.displayEditWarning,
				},
				displayHints: {
					...collection.displayHints,
					suppressImages: form.suppressImages,
					maxItemsToDisplay: isNaN(maxItems) ? undefined : maxItems,
				},
			},
			'overwrite',
		);
		closeEditMetadata();
	};

	const isScrollableOrStatic =
		SCROLLABLE_OR_STATIC_TYPES.includes(collectionType);
	const showSuppressImages = SUPPRESS_IMAGES_TYPES.includes(collectionType);
	const isEmail = priority === 'email';

	return (
		<FormContainer>
			<FormGrid>
				{/* Title */}
				<FormLabel htmlFor="cmf-title">Title</FormLabel>
				<FormInput
					id="cmf-title"
					type="text"
					value={form.displayName}
					onChange={(e) => set('displayName', e.target.value)}
				/>

				{/* Link URL */}
				<FormLabel htmlFor="cmf-href">Link URL</FormLabel>
				<FormInput
					id="cmf-href"
					type="text"
					value={form.href}
					onChange={(e) => set('href', e.target.value)}
				/>

				{/* Description — hidden for scrollable/static types */}
				{!isScrollableOrStatic && (
					<>
						<FormLabel htmlFor="cmf-description">Description</FormLabel>
						<FormInput
							id="cmf-description"
							type="text"
							value={form.description}
							onChange={(e) => set('description', e.target.value)}
						/>
					</>
				)}

				{/* Max items — email only */}
				{isEmail && (
					<>
						<FormLabel
							htmlFor="cmf-maxItems"
							title="Maximum number of items to include in email"
						>
							Max items to render
						</FormLabel>
						<FormInput
							id="cmf-maxItems"
							type="number"
							placeholder="6"
							value={form.maxItemsToDisplay}
							onChange={(e) => set('maxItemsToDisplay', e.target.value)}
						/>
					</>
				)}

				<Divider />

				{/* User visibility */}
				<FormLabel htmlFor="cmf-userVisibility">User visibility</FormLabel>
				<FormSelect
					id="cmf-userVisibility"
					value={form.userVisibility}
					onChange={(e) => set('userVisibility', e.target.value)}
				>
					<option value="">Select user visibility</option>
					{USER_VISIBILITIES.map((v) => (
						<option key={v} value={v}>
							{v}
						</option>
					))}
				</FormSelect>

				{/* Target territory */}
				<FormLabel htmlFor="cmf-territory">Target territory</FormLabel>
				<FormInput
					id="cmf-territory"
					type="text"
					placeholder="e.g. US"
					value={form.targetedTerritory}
					onChange={(e) => set('targetedTerritory', e.target.value)}
				/>

				<Divider />

				{/* Checkboxes */}
				<FormLabel htmlFor="cmf-showTags">Show tag kickers</FormLabel>
				<FormCheckbox
					id="cmf-showTags"
					checked={form.showTags}
					onChange={(e) => set('showTags', e.target.checked)}
				/>

				<FormLabel htmlFor="cmf-showSections">Show section kickers</FormLabel>
				<FormCheckbox
					id="cmf-showSections"
					checked={form.showSections}
					onChange={(e) => set('showSections', e.target.checked)}
				/>

				<FormLabel htmlFor="cmf-hideKickers">Suppress tone kickers</FormLabel>
				<FormCheckbox
					id="cmf-hideKickers"
					checked={form.hideKickers}
					onChange={(e) => set('hideKickers', e.target.checked)}
				/>

				{/* Conditional on non-scrollable/static */}
				{!isScrollableOrStatic && (
					<>
						<FormLabel htmlFor="cmf-showDateHeader">
							Show date in header
						</FormLabel>
						<FormCheckbox
							id="cmf-showDateHeader"
							checked={form.showDateHeader}
							onChange={(e) => set('showDateHeader', e.target.checked)}
						/>

						<FormLabel htmlFor="cmf-showLatestUpdate">
							Show latest update in header
						</FormLabel>
						<FormCheckbox
							id="cmf-showLatestUpdate"
							checked={form.showLatestUpdate}
							onChange={(e) => set('showLatestUpdate', e.target.checked)}
						/>
					</>
				)}

				<FormLabel htmlFor="cmf-excludeFromRss">Exclude from RSS</FormLabel>
				<FormCheckbox
					id="cmf-excludeFromRss"
					checked={form.excludeFromRss}
					onChange={(e) => set('excludeFromRss', e.target.checked)}
				/>

				{/* Hide show more — email only */}
				{isEmail && (
					<>
						<FormLabel htmlFor="cmf-hideShowMore">Hide show more</FormLabel>
						<FormCheckbox
							id="cmf-hideShowMore"
							checked={form.hideShowMore}
							onChange={(e) => set('hideShowMore', e.target.checked)}
						/>
					</>
				)}

				<FormLabel htmlFor="cmf-uneditable">No curation</FormLabel>
				<FormCheckbox
					id="cmf-uneditable"
					checked={form.uneditable}
					onChange={(e) => set('uneditable', e.target.checked)}
				/>

				<FormLabel htmlFor="cmf-displayEditWarning">
					Display edit warning
				</FormLabel>
				<FormCheckbox
					id="cmf-displayEditWarning"
					checked={form.displayEditWarning}
					onChange={(e) => set('displayEditWarning', e.target.checked)}
				/>

				{/* Suppress images — conditional on type */}
				{showSuppressImages && (
					<>
						<FormLabel htmlFor="cmf-suppressImages">Suppress images</FormLabel>
						<FormCheckbox
							id="cmf-suppressImages"
							checked={form.suppressImages}
							onChange={(e) => set('suppressImages', e.target.checked)}
						/>
					</>
				)}

				<ButtonRow>
					<CancelButton priority="default" onClick={closeEditMetadata}>
						Cancel
					</CancelButton>
					<SaveButton onClick={handleSave} disabled={!collection}>
						Save container
					</SaveButton>
				</ButtonRow>
			</FormGrid>
		</FormContainer>
	);
};

// ---------------------------------------------------------------------------
// Redux
// ---------------------------------------------------------------------------

const mapStateToProps = (
	state: State,
	{ collectionId }: OwnProps,
): StateProps => ({
	collection: collectionSelectors.selectById(state, collectionId),
	collectionConfig: selectCollectionConfig(state, collectionId),
	displayName: selectCollectionDisplayName(state, collectionId),
	priority: selectPriority(state) ?? '',
});

const mapDispatchToProps = (
	dispatch: Dispatch,
	{ frontId }: OwnProps,
): DispatchProps => ({
	updateCollection: (collection, mode) =>
		dispatch(updateCollectionAction(collection, mode)),
	closeEditMetadata: () => dispatch(editorCloseEditMetadata(frontId)),
});

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(CollectionMetadataForm);
