import React, { useEffect, useState } from 'react';
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

const PublishActions = styled.div`
	display: flex;
	gap: 10px;
	margin-bottom: 20px;
`;

// const DeepLinkContainer = styled.div`
// 	display: flex;
// 	gap: 10px;
// 	align-items: flex-end;
//
// 	> input {
// 		flex: 1;
// 		padding: 8px;
// 		border: 1px solid #ddd;
// 		border-radius: 3px;
// 		font-size: 14px;
// 		background-color: #f9f9f9;
// 	}
// `;

const CheckboxLabel = styled.label`
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 12px;
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

interface PackageCollectionBuilderProps {
	package: FeastPackage;
	isPersisted: boolean;
	isModified: boolean;
	disabled: boolean;
	onPackageChange: (pkg: FeastPackage) => void;
	onSave: () => void;
	onPublish: () => void;
	onClose: () => void;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

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

const PackageCollectionBuilder: React.FC<PackageCollectionBuilderProps> = ({
	package: pkg,
	isPersisted,
	isModified,
	disabled,
	onPackageChange,
	onSave,
	onPublish,
	onClose,
}) => {
	// Existing builder implementation.
	const [dragIntentActive, setDragIntentActive] = useState(false);
	const [displays, setDisplays] = useState<Record<string, PackageItemDisplay>>(
		{},
	);
	const [loadingDisplays, setLoadingDisplays] = useState(true);
	const [displayError, setDisplayError] = useState<string | null>(null);
	const [displayRefresh, setDisplayRefresh] = useState(0);

	const [targetedRegions, setTargetedRegions] = useState(
		pkg.metadata?.targetedRegions?.join(', ') ?? '',
	);
	const [excludedRegions, setExcludedRegions] = useState(
		pkg.metadata?.excludedRegions?.join(', ') ?? '',
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

				const result = await fetchPackageItemDisplays(
					references.map((item) => ({
						...item,
						addedOn: 0,
					})),
				);

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

	const moveItem = (index: number, direction: -1 | 1) => {
		const nextIndex = index + direction;

		if (nextIndex < 0 || nextIndex >= pkg.items.length) {
			throw new Error('Invalid package item move.');
		}

		const items = [...pkg.items];
		[items[index], items[nextIndex]] = [items[nextIndex], items[index]];

		changeItems(items);
	};

	const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		event.stopPropagation();
		setDragIntentActive(false);

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
				<p>
					Package ID: {pkg.id}
					{' | '}
					Visibility: {pkg.isHidden ? 'Hidden' : 'Visible'}
					{isModified && ' (Modified)'}
				</p>

				<FirstSection>
					<LeftColumn>
						<TextInput
							label="Display Name"
							value={pkg.name}
							onChange={(name) => onPackageChange({ ...pkg, name })}
							isDisabled={disabled}
						/>

						<TextInput
							label="Description"
							value={pkg.metadata?.bodyText ?? ''}
							onChange={(bodyText) => changeMetadata({ bodyText })}
							isDisabled={disabled}
						/>

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
					</LeftColumn>

					<RightColumn>
						<SectionTitle>Metadata</SectionTitle>

						<TextInput
							label="Targeted regions (comma separated)"
							value={targetedRegions}
							isDisabled={disabled}
							onChange={(value) => {
								setTargetedRegions(value);
								changeMetadata({
									targetedRegions: parseRegions(value),
								});
							}}
						/>

						<TextInput
							label="Excluded regions (comma separated)"
							value={excludedRegions}
							isDisabled={disabled}
							onChange={(value) => {
								setExcludedRegions(value);
								changeMetadata({
									excludedRegions: parseRegions(value),
								});
							}}
						/>

						<MetadataBox>
							<PaletteForm
								currentPaletteOption={currentPaletteOption}
								defaultCustomPaletteOption={DefaultCustomPaletteFeastCollection}
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
						</MetadataBox>
					</RightColumn>
				</FirstSection>

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
								<SlotItem key={`${packageItemKey(item)}:${index}`}>
									{display?.imageUrl && <img src={display.imageUrl} alt="" />}

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
										isDisabled={disabled || index === 0}
										onPress={() => moveItem(index, -1)}
									>
										Up
									</Button>

									<Button
										size="sm"
										variant="secondary"
										isDisabled={disabled || index === pkg.items.length - 1}
										onPress={() => moveItem(index, 1)}
									>
										Down
									</Button>

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

				<Section>
					<SectionTitle>Save & Publish</SectionTitle>

					<PublishActions>
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
					</PublishActions>

					{(!isPersisted || isModified) && (
						<p>Save your changes to enable Publish.</p>
					)}

					<p>
						Save updates the stored package. Publish submits the saved package
						to Feast for processing.
					</p>

					<p>
						Visibility controls whether the package is shown on fronts.
						Publishing does not change its visibility.
					</p>
				</Section>
			</BuilderContent>
		</BuilderContainer>
	);
};

export default PackageCollectionBuilder;
