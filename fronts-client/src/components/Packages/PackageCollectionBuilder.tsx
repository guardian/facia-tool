import React, { useEffect, useMemo, useState } from 'react';
import { styled } from 'constants/theme';
import { TextInput } from '@guardian/stand/TextInput';
import { Button } from '@guardian/stand/Button';
import { CardTypesMap } from 'constants/cardTypes';
import {
	CustomPaletteId,
	DefaultCustomPaletteFeastCollection,
	feastCollectionPalettes,
} from 'constants/feastPalettes';
import { CARD_TYPE } from 'lib/dnd/constants';
import DragIntentContainer from 'components/DragIntentContainer';
import { PaletteForm } from 'components/form/PaletteForm';
import notifications from 'services/notifications';
import {
	fetchPackageItemDisplays,
	packageErrorMessage,
	packageItemKey,
} from 'services/packagesApi';
import type {
	FeastPackage,
	FeastPackageMetadata,
	PackageItem,
	PackageItemDisplay,
} from 'types/Packages';
import { TextArea } from '@guardian/stand/TextArea';
import { Tooltip } from '@guardian/stand/Tooltip';
import { Typography } from '@guardian/stand/Typography';
import { AppLinkControls } from './AppLinkControls';

const BuilderContainer = styled.div`
	display: flex;
	flex-direction: column;
	flex: 1;
	min-height: 0;
	background: white;
	border: 1px solid #ddd;
	border-radius: 4px;
	overflow: hidden;
`;

const BuilderHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	flex-shrink: 0;
	padding: 15px 20px;
	background: #f5f5f5;
	border-bottom: 1px solid #ddd;
`;

const HeaderTitle = styled.h3`
	margin: 0;
	font-size: 16px;
	font-weight: bold;
	flex: 1;
`;

const HeaderMeta = styled.div`
	display: flex;
	align-items: center;
	gap: 15px;
	font-size: 12px;
	color: #666;
`;

const CloseButton = styled.button`
	background: white;
	border: 1px solid #ddd;
	border-radius: 3px;
	width: 32px;
	height: 32px;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 18px;
	padding: 0;

	&:hover {
		background: #f0f0f0;
	}
`;

const BuilderContent = styled.div`
	flex: 1;
	min-height: 0;
	overflow-y: auto;
	padding: 20px;
	display: flex;
	flex-direction: column;
	gap: 20px;

	> * {
		flex-shrink: 0;
	}
`;

const Section = styled.div`
	display: flex;
	flex-direction: row;
	align-items: baseline;
	gap: 1rem;
	border: 1px solid #ddd;
	border-radius: 4px;
	padding: 20px;
	background: white;
`;

const SectionTitle = styled.h3`
	margin: 0;
	font-size: 16px;
	font-weight: bold;
`;

const FirstSection = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 20px;
`;

const LeftColumn = styled.div`
	display: flex;
	flex-direction: column;
	gap: 15px;
`;

const RightColumn = styled.div`
	display: flex;
	flex-direction: column;
	gap: 15px;
	padding: 15px;
	border: 1px dashed #ddd;
	border-radius: 4px;
	background: #fafafa;
`;

const MetadataBox = styled.div`
	border: 1px dashed #ddd;
	border-radius: 4px;
	padding: 15px;
	background: #fafafa;
`;

const DragDropZone = styled.div`
	border: 2px dashed #999;
	border-radius: 4px;
	padding: 40px 20px;
	text-align: center;
	color: #666;
	background-color: #f9f9f9;
	cursor: pointer;
	margin-top: 10px;
	transition: background-color 0.2s;

	&:hover {
		background-color: #f0f0f0;
	}
`;

const CheckboxLabel = styled.label`
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 16px;
	cursor: pointer;

	input {
		cursor: pointer;
	}
`;

const SlotsContainer = styled.div`
	border: 1px solid #ddd;
	border-radius: 4px;
	padding: 20px;
	background: white;
`;

const SlotsList = styled.div`
	display: flex;
	flex-direction: column;
	gap: 10px;
	margin-bottom: 20px;
`;

const SlotItem = styled.div`
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 10px;
	background: #f9f9f9;
	border: 1px solid #ddd;
	border-radius: 3px;
	font-size: 14px;

	img {
		width: 40px;
		height: 40px;
		object-fit: cover;
		border-radius: 2px;
	}

	span:first-child {
		color: #999;
		margin-right: 5px;
	}

	> span {
		flex: 1;
	}

	button {
		margin-left: auto;
	}
`;

const ThemeFormContainer = styled.div`
	margin-top: 12px;
`;

const PublishActions = styled.div`
	display: flex;
	flex: 1;
	align-items: center;
	justify-content: space-between;
	gap: 10px;
`;

const ActionButtons = styled.div`
	display: flex;
	gap: 10px;
`;

interface PackageCollectionBuilderProps {
	package: FeastPackage;
	isPersisted: boolean;
	isModified: boolean;
	disabled: boolean;
	onPackageChange: (pkg: FeastPackage) => void;
	onSave: () => void;
	onPublish: () => void;
	onClose: () => void;
	isPublished: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

/*Dropping these controls for the time being, as they are not respected by the backend and are not user friendly. We'll implement them in a follow-up
function parseRegions(value: string): string[] {
	return Array.from(
		new Set(
			value
				.split(',')
				.map((region) => region.trim())
				.filter((region) => region.length > 0),
		),
	);
}
 */

const PACKAGE_REORDER_TYPE = 'application/x-package-item-reorder';

const PackageCollectionBuilder: React.FC<PackageCollectionBuilderProps> = ({
	package: pkg,
	isPersisted,
	isModified,
	disabled,
	onPackageChange,
	onSave,
	onPublish,
	onClose,
	isPublished,
}) => {
	// Existing builder implementation.
	const [dragIntentActive, setDragIntentActive] = useState(false);
	const [displays, setDisplays] = useState<Record<string, PackageItemDisplay>>(
		{},
	);
	const [loadingDisplays, setLoadingDisplays] = useState(true);
	const [displayError, setDisplayError] = useState<string | null>(null);
	const [displayRefresh, setDisplayRefresh] = useState(0);
	const [copyMessage, setCopyMessage] = useState('');
	const [draggedItemKey, setDraggedItemKey] = useState<string | null>(null);

	// const [targetedRegions, setTargetedRegions] = useState( //Will implement in a follow-up, as the backend does not considering these fields yet
	// 	pkg.metadata?.targetedRegions?.join(', ') ?? '',
	// );
	// const [excludedRegions, setExcludedRegions] = useState(
	// 	pkg.metadata?.excludedRegions?.join(', ') ?? '',
	// );

	const appLink = useMemo(
		() => `feastbraze://recipecollection/${pkg.id}`,
		[pkg],
	);
	const emailLink = useMemo(
		() =>
			`https://guardian-feast.go.link/recipecollection/${pkg.id}?adj_t=1csm4hw1&adj_fallback%3Dhttps%253A%252F%252Fapps.apple.com%252Fgy%252Fapp%252Fguardian-feast%252Fid6468674686%26adj_redirect_macos%3Dhttps%253A%252F%252Fapps.apple.com%252Fgy%252Fapp%252Fguardian-feast%252Fid6468674686`,
		[pkg],
	);

	const itemSignature = JSON.stringify(
		pkg.items.map(({ id, cardType }) => ({ id, cardType })),
	);

	useEffect(() => {
		let active = true;

		setLoadingDisplays(true);
		setDisplayError(null);

		const loadDisplays = async () => {
			try {
				const references: Array<Pick<PackageItem, 'id' | 'cardType'>> =
					JSON.parse(itemSignature);

				const result = await fetchPackageItemDisplays(references);

				if (active) {
					setDisplays(result);
				}
			} catch (error) {
				if (active) {
					const message = await packageErrorMessage(error);

					if (active) {
						setDisplayError(message);
					}
				}
			} finally {
				if (active) {
					setLoadingDisplays(false);
				}
			}
		};

		void loadDisplays();

		return () => {
			active = false;
		};
	}, [itemSignature, displayRefresh]);

	useEffect(() => {
		//notification message to appear for 10 seconds
		if (!copyMessage) return;

		const timeout = window.setTimeout(() => setCopyMessage(''), 10_000);
		return () => window.clearTimeout(timeout);
	}, [copyMessage]);

	const changeMetadata = (patch: Partial<FeastPackageMetadata>) => {
		onPackageChange({
			...pkg,
			metadata: {
				...pkg.metadata,
				...patch,
			},
		});
	};

	const changeItems = (items: PackageItem[]) => {
		onPackageChange({
			...pkg,
			items,
		});
	};

	const reorderItem = (targetIndex: number) => {
		if (disabled || draggedItemKey === null) return;

		const sourceIndex = pkg.items.findIndex(
			(item) => packageItemKey(item) === draggedItemKey,
		);

		if (sourceIndex < 0 || sourceIndex === targetIndex) return;

		const items = [...pkg.items];
		const [movedItem] = items.splice(sourceIndex, 1);
		items.splice(targetIndex, 0, movedItem);
		changeItems(items);
	};

	const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		event.stopPropagation();
		setDragIntentActive(false);

		if (event.dataTransfer.types.includes(PACKAGE_REORDER_TYPE)) {
			return;
		}

		if (disabled) {
			return;
		}

		try {
			const sourceType = event.dataTransfer.getData(CARD_TYPE);

			if (
				sourceType !== CardTypesMap.RECIPE &&
				sourceType !== CardTypesMap.CHEF
			) {
				throw new Error('Only recipe and chef drops are supported here.');
			}

			const source: unknown = JSON.parse(
				event.dataTransfer.getData(sourceType),
			);

			if (
				!isRecord(source) ||
				typeof source.id !== 'string' ||
				!source.id.trim()
			) {
				throw new Error('The dropped item has no valid reference ID.');
			}

			const item: PackageItem = {
				id: source.id,
				cardType: sourceType === CardTypesMap.RECIPE ? 'recipe' : 'chef',
				addedOn: Date.now(),
			};

			const key = packageItemKey(item);

			if (pkg.items.some((existing) => packageItemKey(existing) === key)) {
				throw new Error('This item is already attached to the package.');
			}

			changeItems([...pkg.items, item]);
		} catch (error) {
			notifications.notify({
				message:
					error instanceof Error
						? error.message
						: 'Unable to attach the dropped item.',
				level: 'error',
			});
		}
	};

	const theme = pkg.metadata?.theme;
	const currentPaletteOption = theme
		? {
				id: feastCollectionPalettes.some((option) => option.id === theme.id)
					? theme.id
					: CustomPaletteId,
				name: 'Current theme',
				palettes: {
					light: theme.lightPalette,
					dark: theme.darkPalette,
				},
				imageURL: theme.imageURL,
			}
		: undefined;

	return (
		<BuilderContainer>
			<BuilderHeader>
				<HeaderTitle>Selection Builder</HeaderTitle>
				<HeaderMeta>
					<CloseButton
						type="button"
						disabled={disabled}
						onClick={onClose}
						title="Close"
					>
						x
					</CloseButton>
				</HeaderMeta>
			</BuilderHeader>

			<BuilderContent>
				<FirstSection>
					<LeftColumn>
						<div>
							<TextInput
								label="Display Name"
								value={pkg.name}
								onChange={(name) => onPackageChange({ ...pkg, name })}
								isDisabled={disabled}
							/>
							<Typography variant="bodyCompactSm">
								Keep the display name under 20 characters.
							</Typography>
						</div>
						<div>
							<TextArea
								label="Standfirst"
								value={pkg.metadata?.bodyText ?? ''}
								onChange={(bodyText) => changeMetadata({ bodyText })}
								isDisabled={disabled}
							/>
							<Typography variant="bodyCompactSm">
								Keep the standfirst under 130 characters.
							</Typography>
						</div>
					</LeftColumn>

					<RightColumn>
						<SectionTitle>Fronts Display</SectionTitle>

						{/*Dropping these controls for the time being, as they are not respected by the backend and are not user friendly. We'll implement them in a follow-up*/}
						{/*<TextInput*/}
						{/*	label="Targeted regions (comma separated)"*/}
						{/*	value={targetedRegions}*/}
						{/*	isDisabled={disabled}*/}
						{/*	onChange={(value) => {*/}
						{/*		setTargetedRegions(value);*/}
						{/*		changeMetadata({*/}
						{/*			targetedRegions: parseRegions(value),*/}
						{/*		});*/}
						{/*	}}*/}
						{/*/>*/}

						{/*<TextInput*/}
						{/*	label="Excluded regions (comma separated)"*/}
						{/*	value={excludedRegions}*/}
						{/*	isDisabled={disabled}*/}
						{/*	onChange={(value) => {*/}
						{/*		setExcludedRegions(value);*/}
						{/*		changeMetadata({*/}
						{/*			excludedRegions: parseRegions(value),*/}
						{/*		});*/}
						{/*	}}*/}
						{/*/>*/}
						<CheckboxLabel>
							<input
								type="checkbox"
								checked={pkg.isHidden}
								disabled={disabled}
								onChange={(event) =>
									onPackageChange({
										...pkg,
										isHidden: event.target.checked,
									})
								}
							/>
							Hide from fronts
						</CheckboxLabel>
						<MetadataBox>
							<details>
								<summary style={{ cursor: 'pointer' }}>Select theme</summary>

								<ThemeFormContainer>
									<PaletteForm
										currentPaletteOption={currentPaletteOption}
										defaultCustomPaletteOption={
											DefaultCustomPaletteFeastCollection
										}
										paletteOptions={feastCollectionPalettes}
										onChange={(option) => {
											if (!disabled) {
												changeMetadata({
													theme: {
														id: option.id,
														lightPalette: option.palettes.light,
														darkPalette: option.palettes.dark,
														imageURL: option.imageURL,
													},
												});
											}
										}}
									/>

									<Button
										size="sm"
										variant="secondary"
										isDisabled={disabled || !theme}
										onPress={() => changeMetadata({ theme: undefined })}
									>
										Clear theme
									</Button>
								</ThemeFormContainer>
							</details>
						</MetadataBox>
					</RightColumn>
				</FirstSection>
				<Section>
					<PublishActions>
						<PublishActions>
							<ActionButtons>
								<Button
									variant="secondary"
									size="md"
									isDisabled={disabled || !isModified || !pkg.name.trim()}
									onPress={onSave}
								>
									Save
								</Button>

								<Button
									variant="primary"
									size="md"
									isDisabled={
										disabled || !isPersisted || isModified || !pkg.name.trim()
									}
									onPress={onPublish}
								>
									Publish
								</Button>

								{(!isPersisted || isModified) && (
									<Typography variant="bodyCompactItalicSm">
										Save your changes before publishing
									</Typography>
								)}

								<Tooltip placement="start">
									<Typography variant="bodyCompactSm">
										Save updates the stored package. Publish sends the saved
										package to the Feast app
									</Typography>
								</Tooltip>
							</ActionButtons>

							<AppLinkControls
								deepLink={emailLink}
								title="Deep link"
								isPublished={isPublished}
								isDisabled={disabled || !isPublished || !emailLink}
							/>
							<AppLinkControls
								deepLink={appLink}
								title="Push notification link"
								isPublished={isPublished}
								isDisabled={disabled || !isPublished || !appLink}
							/>
						</PublishActions>
					</PublishActions>
				</Section>

				<SlotsContainer>
					<SectionTitle>Items ({pkg.items.length})</SectionTitle>

					{loadingDisplays && <p role="status">Loading item details...</p>}

					{displayError && (
						<div role="alert">
							<p>Item details could not be loaded: {displayError}</p>
							<Button
								size="sm"
								variant="secondary"
								onPress={() => setDisplayRefresh((version) => version + 1)}
							>
								Retry item details
							</Button>
						</div>
					)}

					<SlotsList>
						{pkg.items.map((item, index) => {
							const display = displays[packageItemKey(item)];

							return (
								<SlotItem
									key={packageItemKey(item)}
									draggable={!disabled}
									onDragStart={(event) => {
										if (disabled) {
											event.preventDefault();
											return;
										}

										setDraggedItemKey(packageItemKey(item));
										event.dataTransfer.effectAllowed = 'move';
										event.dataTransfer.setData(
											PACKAGE_REORDER_TYPE,
											packageItemKey(item),
										);
									}}
									onDragOver={(event) => {
										if (
											disabled ||
											draggedItemKey === null ||
											!event.dataTransfer.types.includes(PACKAGE_REORDER_TYPE)
										) {
											return;
										}

										event.preventDefault();
										event.stopPropagation();
										event.dataTransfer.dropEffect = 'move';
									}}
									onDrop={(event) => {
										if (
											!event.dataTransfer.types.includes(PACKAGE_REORDER_TYPE)
										) {
											return;
										}

										event.preventDefault();
										event.stopPropagation();
										reorderItem(index);
										setDraggedItemKey(null);
									}}
									onDragEnd={() => setDraggedItemKey(null)}
									style={{
										cursor: disabled ? 'default' : 'grab',
										opacity: draggedItemKey === packageItemKey(item) ? 0.5 : 1,
									}}
								>
									{display?.imageUrl && (
										<img src={display.imageUrl} alt="" draggable={false} />
									)}

									<span>
										{display?.title ?? item.id} ({item.cardType})
										{!display &&
											!loadingDisplays &&
											item.cardType !== 'subcollection' &&
											' - details unavailable'}
									</span>

									<Button
										size="sm"
										variant="secondary"
										isDisabled={disabled}
										onPress={() =>
											changeItems(
												pkg.items.filter((_, itemIndex) => itemIndex !== index),
											)
										}
									>
										Delete
									</Button>
								</SlotItem>
							);
						})}
					</SlotsList>

					<DragIntentContainer
						active={!disabled}
						onDragIntentStart={() => setDragIntentActive(true)}
						onDragIntentEnd={() => setDragIntentActive(false)}
						onDragOver={(event) => {
							if (!disabled) {
								event.preventDefault();
							}
						}}
						onDrop={handleDrop}
						style={{
							opacity: dragIntentActive ? 0.8 : 1,
						}}
					>
						<DragDropZone>Drag recipes or chefs here to attach</DragDropZone>
					</DragIntentContainer>
				</SlotsContainer>
			</BuilderContent>
		</BuilderContainer>
	);
};

export default PackageCollectionBuilder;
