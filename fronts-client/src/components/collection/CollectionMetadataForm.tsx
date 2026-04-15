import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { styled } from 'constants/theme';
import { theme } from 'constants/theme';
import Button from 'components/inputs/ButtonDefault';
import type { State } from 'types/State';
import type { Dispatch } from 'types/Store';
import type { Collection } from 'types/Collection';
import {
	isPlatform,
	platforms,
	type CollectionConfig,
	type Platform,
} from 'types/FaciaApi';
import {
	selectCollectionConfig,
	selectCollectionDisplayName,
} from 'selectors/frontsSelectors';
import { selectors as collectionSelectors } from 'bundles/collectionsBundle';
import {
	getCollections,
	updateCollectionConfig,
	updateCollectionName,
} from 'actions/Collections';
import { selectPriority } from 'selectors/pathSelectors';
import { selectAvailableTerritories } from 'selectors/configSelectors';
import { editorCloseEditMetadata } from 'bundles/frontsUI';
import getFrontsConfig from 'actions/Fronts';

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
// Container type constants (mirrors public/src/js/constants/defaults.js)
// ---------------------------------------------------------------------------

interface ContainerTypeConfig {
	name: string;
	groupsConfig?: Array<{ name: string; maxItems?: number }>;
}

const CONTAINER_TYPES_CONFIG: ContainerTypeConfig[] = [
	{ name: 'scrollable/highlights' },
	{
		name: 'flexible/general',
		groupsConfig: [
			{ name: 'standard', maxItems: 8 },
			{ name: 'big', maxItems: 0 },
			{ name: 'very big', maxItems: 0 },
			{ name: 'splash', maxItems: 1 },
		],
	},
	{
		name: 'flexible/special',
		groupsConfig: [{ name: 'standard' }, { name: 'snap' }],
	},
	{ name: 'scrollable/small' },
	{ name: 'scrollable/medium' },
	{ name: 'scrollable/feature' },
	{ name: 'static/medium/4' },
	{ name: 'static/feature/2' },
	{ name: 'nav/list' },
	{ name: 'nav/media-list' },
	{ name: 'news/most-popular' },
	{ name: 'fixed/showcase' },
	{ name: 'fixed/thrasher' },
	{
		name: 'breaking-news/not-for-other-fronts',
		groupsConfig: [{ name: 'minor' }, { name: 'major' }],
	},
];

const EMAIL_TYPES_CONFIG: ContainerTypeConfig[] = [
	{ name: 'fast' },
	{ name: 'fast-images' },
	{ name: 'medium' },
	{ name: 'slow' },
	{ name: 'free-text' },
];

const getTypeConfig = (
	name: string,
	isEmail: boolean,
): ContainerTypeConfig | undefined => {
	const list = isEmail ? EMAIL_TYPES_CONFIG : CONTAINER_TYPES_CONFIG;
	return list.find((t) => t.name === name);
};

interface GroupConfigFormEntry {
	name: string;
	maxItems: string;
}

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
	onClose?: () => void;
}

interface StateProps {
	collection: Collection | undefined;
	collectionConfig: CollectionConfig;
	displayName: string;
	priority: string;
	availableMetadataTypes: string[];
	availableTerritories: string[];
}

interface DispatchProps {
	updateCollectionConfig: (collection: CollectionConfig) => void;
	closeEditMetadata: () => void;
}

type Props = OwnProps & StateProps & DispatchProps;

interface FormState {
	type: string;
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
	metadataTags: string[];
	groupsConfig: GroupConfigFormEntry[];
	backfillQuery: string;
	platform: Platform;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const CollectionMetadataForm = ({
	collection,
	collectionConfig,
	displayName,
	priority,
	availableMetadataTypes,
	availableTerritories,
	closeEditMetadata,
	updateCollectionConfig,
}: Props) => {
	const isEmail = priority === 'email';

	const buildGroupsConfigFormState = (
		typeName: string,
		existingGroupsConfig?: Array<{ name: string; maxItems?: number }>,
	): GroupConfigFormEntry[] => {
		const typeConfig = getTypeConfig(typeName, isEmail);
		if (!typeConfig?.groupsConfig) return [];
		return typeConfig.groupsConfig.map((g) => {
			const existing = existingGroupsConfig?.find((e) => e.name === g.name);
			return {
				name: g.name,
				maxItems: String(existing?.maxItems ?? g.maxItems ?? ''),
			};
		});
	};

	const backfillFromConfig = collectionConfig?.backfill as
		| { type: string; query: string }
		| undefined;

	const buildInitialState = (): FormState => {
		const currentType = collection?.type ?? collectionConfig?.type ?? '';
		return {
			type: currentType,
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
			metadataTags: (collection?.metadata ?? []).map((m) => m.type),
			groupsConfig: buildGroupsConfigFormState(
				currentType,
				collection?.groupsConfig,
			),
			backfillQuery:
				backfillFromConfig?.type === 'capi' ? backfillFromConfig.query : '',
			platform: collection?.platform ?? 'Any',
		};
	};

	const [form, setForm] = useState<FormState>(buildInitialState);

	useEffect(() => {
		setForm(buildInitialState());
	}, [collection?.id]);

	const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
		setForm((prev) => ({ ...prev, [key]: value }));

	const handleTypeChange = (newType: string) => {
		setForm((prev) => ({
			...prev,
			type: newType,
			groupsConfig: buildGroupsConfigFormState(
				newType,
				collection?.groupsConfig,
			),
		}));
	};

	const toggleMetadataTag = (tagType: string, checked: boolean) => {
		setForm((prev) => ({
			...prev,
			metadataTags: checked
				? [...prev.metadataTags, tagType]
				: prev.metadataTags.filter((t) => t !== tagType),
		}));
	};

	const handleSave = () => {
		if (!collection) return;
		const maxItems = parseInt(form.maxItemsToDisplay, 10);
		const parsedGroupsConfig = form.groupsConfig.map((g) => ({
			name: g.name,
			...(g.maxItems !== '' ? { maxItems: parseInt(g.maxItems, 10) } : {}),
		}));

		function objectOrUndefined<T>(
			obj: T extends object ? T : never,
		): T | undefined {
			return Object.values(obj).find((x) => x !== undefined) ? obj : undefined;
		}

		updateCollectionConfig({
			...collectionConfig,
			type: form.type || undefined,
			displayName: form.displayName.trim() || collection.displayName,
			uneditable: form.uneditable || undefined,
			targetedTerritory: form.targetedTerritory || undefined,
			metadata:
				form.metadataTags.length > 0
					? form.metadataTags.map((t) => ({ type: t }))
					: undefined,
			groupsConfig:
				parsedGroupsConfig.length > 0 ? parsedGroupsConfig : undefined,
			frontsToolSettings: objectOrUndefined({
				...collection.frontsToolSettings,
				displayEditWarning: form.displayEditWarning || undefined,
			}),
			displayHints: objectOrUndefined({
				...collection.displayHints,
				suppressImages: form.suppressImages || undefined,
				maxItemsToDisplay: isNaN(maxItems) ? undefined : maxItems,
			}),
			backfill: form.backfillQuery
				? {
						type: 'capi',
						query: form.backfillQuery,
					}
				: undefined,
			href: form.href || undefined,
			showTags: form.showTags || undefined,
			hideKickers: form.hideKickers || undefined,
			showSections: form.showSections || undefined,
			showDateHeader: form.showDateHeader || undefined,
			showLatestUpdate: form.showLatestUpdate || undefined,
			excludedFromRss: form.excludeFromRss || undefined,
			hideShowMore: form.hideShowMore || undefined,
			description: form.description || undefined,
			excludeFromRss: form.excludeFromRss || undefined,
			userVisibility: form.userVisibility || undefined,
			platform: form.platform || undefined,
		});
		closeEditMetadata();
	};

	const collectionType = form.type;
	const isScrollableOrStatic =
		SCROLLABLE_OR_STATIC_TYPES.includes(collectionType);
	const showSuppressImages = SUPPRESS_IMAGES_TYPES.includes(collectionType);
	const availableTypes = isEmail ? EMAIL_TYPES_CONFIG : CONTAINER_TYPES_CONFIG;
	const currentTypeConfig = getTypeConfig(collectionType, isEmail);
	const hasGroups = (currentTypeConfig?.groupsConfig?.length ?? 0) > 0;

	return (
		<FormContainer>
			<FormGrid>
				{/* Layout / type */}
				<FormLabel htmlFor="cmf-type">Layout</FormLabel>
				<FormSelect
					id="cmf-type"
					value={form.type}
					onChange={(e) => handleTypeChange(e.target.value)}
				>
					<option value="">Choose a layout…</option>
					{availableTypes.map(({ name }) => (
						<option key={name} value={name}>
							{name}
						</option>
					))}
				</FormSelect>

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

				{/* Backfill (CAPI query) */}
				<FormLabel htmlFor="cmf-backfill">Backfill</FormLabel>
				<FormInput
					id="cmf-backfill"
					type="text"
					placeholder="CAPI query, e.g. uk/sport"
					value={form.backfillQuery}
					onChange={(e) => set('backfillQuery', e.target.value)}
				/>

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
				<FormSelect
					id="cmf-territory"
					value={form.targetedTerritory}
					onChange={(e) => set('targetedTerritory', e.target.value)}
				>
					<option value="">Select territory</option>
					{availableTerritories.map((t) => (
						<option key={t} value={t}>
							{t}
						</option>
					))}
				</FormSelect>

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

				{/* Metadata tags */}
				{availableMetadataTypes.length > 0 && (
					<>
						<Divider />
						{availableMetadataTypes.map((tagType) => (
							<React.Fragment key={tagType}>
								<FormLabel htmlFor={`cmf-tag-${tagType}`}>{tagType}</FormLabel>
								<FormCheckbox
									id={`cmf-tag-${tagType}`}
									checked={form.metadataTags.includes(tagType)}
									onChange={(e) => toggleMetadataTag(tagType, e.target.checked)}
								/>
							</React.Fragment>
						))}
					</>
				)}

				{/* Groups config — shown when the selected type has groups */}
				{hasGroups && (
					<>
						<Divider />
						{form.groupsConfig.map((g, i) => (
							<React.Fragment key={g.name}>
								<FormLabel
									htmlFor={`cmf-group-${g.name}`}
									style={{ textTransform: 'capitalize' }}
								>
									{g.name} stories
								</FormLabel>
								<FormInput
									id={`cmf-group-${g.name}`}
									type="number"
									min={0}
									max={20}
									value={g.maxItems}
									onChange={(e) => {
										const updated = [...form.groupsConfig];
										updated[i] = {
											...updated[i],
											maxItems: e.target.value,
										};
										set('groupsConfig', updated);
									}}
								/>
							</React.Fragment>
						))}
					</>
				)}

				{/* Platform */}
				<FormLabel htmlFor="cmf-platform">Platform</FormLabel>
				<FormSelect
					id="cmf-platform"
					value={form.platform}
					onChange={(e) => {
						set(
							'platform',
							isPlatform(e.target.value) ? e.target.value : 'Any',
						);
					}}
				>
					{platforms.map((v) => (
						<option key={v} value={v}>
							{v}
						</option>
					))}
				</FormSelect>

				<Divider />

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
	availableMetadataTypes: (state.config?.collectionMetadata ?? []).map(
		(m) => m.type,
	),
	availableTerritories: selectAvailableTerritories(state),
});

const mapDispatchToProps = (
	dispatch: Dispatch,
	{ frontId, onClose }: OwnProps,
): DispatchProps => ({
	updateCollectionConfig: async (collection) => {
		await dispatch(updateCollectionConfig(collection)),
			await dispatch(
				updateCollectionName(collection.displayName, collection.id),
			),
			await dispatch(getFrontsConfig());
		await dispatch(getCollections([collection.id]));
	},
	closeEditMetadata: onClose
		? onClose
		: () => dispatch(editorCloseEditMetadata(frontId)),
});

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(CollectionMetadataForm);
