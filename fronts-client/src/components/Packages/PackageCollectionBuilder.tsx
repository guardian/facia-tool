import React, { useState } from 'react';
import { styled } from 'constants/theme';
import { TextInput } from '@guardian/stand/TextInput';
import { Button } from '@guardian/stand/Button';
import { FeastPackage, PackageRecipe } from 'types/Packages';
import { Recipe } from 'types/Recipe';
import { Chef } from 'types/Chef';
import { CardTypesMap } from 'constants/cardTypes';
import { CARD_TYPE } from 'lib/dnd/constants';
import DragIntentContainer from 'components/DragIntentContainer';

const BuilderContainer = styled.div`
	display: flex;
	flex-direction: column;
	gap: 0;
	background: white;
	border: 1px solid #ddd;
	border-radius: 4px;
	overflow: hidden;
`;

const BuilderHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
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
	padding: 20px;
	display: flex;
	flex-direction: column;
	gap: 20px;
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

const DeepLinkContainer = styled.div`
	display: flex;
	gap: 10px;
	align-items: flex-end;

	> input {
		flex: 1;
		padding: 8px;
		border: 1px solid #ddd;
		border-radius: 3px;
		font-size: 14px;
		background-color: #f9f9f9;
	}
`;

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
	onPackageChange: (pkg: FeastPackage) => void;
	onClose?: () => void;
}

const PackageCollectionBuilder: React.FC<PackageCollectionBuilderProps> = ({
	package: pkg,
	onPackageChange,
	onClose,
}) => {
	const [displayName, setDisplayName] = useState(pkg.displayName);
	const [prefillToggle, setPrefillToggle] = useState(
		pkg.metadata?.prefillToggle || false,
	);
	const [dragIntentActive, setDragIntentActive] = useState(false);

	// if (!pkg.displayName) {
	// 	return (
	// 		<BuilderContainer>
	// 			<PlaceholderSection>
	// 				<PlaceholderContent>
	// 					<Typography element="h3" variant="headingSm">
	// 						Select a Feast Package from the search dropdown to the left,
	// 					</Typography>
	// 					<Typography element="p" variant="bodySm" style={{ marginTop: '10px' }}>
	// 						or click '+ New Package' to begin.
	// 					</Typography>
	// 				</PlaceholderContent>
	// 			</PlaceholderSection>
	//
	// 			<Section>
	// 				<SectionTitle>Publish & Deep Link Workflow</SectionTitle>
	// 				<PlaceholderSection>
	// 					<Typography element="p" variant="bodySm">
	// 						Workflow controls will appear here when a package is loaded.
	// 					</Typography>
	// 				</PlaceholderSection>
	// 			</Section>
	// 		</BuilderContainer>
	// 	);
	// }

	const handleDisplayNameChange = (value: string) => {
		setDisplayName(value);
		onPackageChange({ ...pkg, displayName: value, isModified: true });
	};

	const handlePrefillToggle = (checked: boolean) => {
		setPrefillToggle(checked);
		onPackageChange({
			...pkg,
			metadata: {
				...pkg.metadata,
				prefillToggle: checked,
			},
			isModified: true,
		});
	};

	const handleRemoveRecipe = (recipeId: string) => {
		const updated = pkg.slots.filter((slot) => slot.id !== recipeId);
		onPackageChange({
			...pkg,
			slots: updated,
			isModified: true,
		});
	};

	const handleClose = () => {
		if (onClose) {
			onClose();
		}
	};

	return (
		<BuilderContainer>
			{/* Header */}
			<BuilderHeader>
				<HeaderTitle>Selection Builder</HeaderTitle>
				<HeaderMeta>
					<CloseButton onClick={handleClose} title="Close">
						✕
					</CloseButton>
				</HeaderMeta>
			</BuilderHeader>

			<BuilderContent>
				{/* Package ID & Status */}
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: '10px',
						fontSize: '14px',
					}}
				>
					<span>Package ID: #{pkg.id}</span>
					<span>|</span>
					<span>
						Status: <strong>{pkg.status}</strong>
					</span>
					{pkg.isModified && (
						<span style={{ color: '#d00', fontSize: '12px' }}>(Modified)</span>
					)}
				</div>

				{/* First Section: Display Name (left) + Metadata (right) */}
				<FirstSection>
					<LeftColumn>
						<div>
							<TextInput
								label="Display Name"
								value={displayName}
								onChange={handleDisplayNameChange}
								placeholder="Enter display name"
							/>
						</div>
						<div>
							<TextInput
								label="Description"
								value=""
								onChange={handleDisplayNameChange}
								placeholder="Enter description"
							/>
						</div>
					</LeftColumn>

					<RightColumn>
						<div
							style={{
								fontSize: '12px',
								fontWeight: 'bold',
								marginBottom: '10px',
							}}
						>
							Metadata (H3)
						</div>
						<MetadataBox>
							<div
								style={{
									fontSize: '12px',
									color: '#666',
									marginBottom: '10px',
								}}
							>
								V1 Metadata Gap (Future Regions, etc.)
							</div>
						</MetadataBox>
						<CheckboxLabel>
							<input
								type="checkbox"
								checked={prefillToggle}
								onChange={(e) => handlePrefillToggle(e.target.checked)}
							/>
							Prefill Toggle: {prefillToggle ? 'ON' : 'OFF'}
						</CheckboxLabel>
					</RightColumn>
				</FirstSection>

				{/* Slots Section */}
				<div>
					<div
						style={{
							fontSize: '14px',
							fontWeight: 'bold',
							marginBottom: '10px',
						}}
					>
						Slots - {pkg.slots.length} Items Attached
					</div>

					<SlotsContainer>
						<SlotsList>
							{pkg.slots.map((slot, index) => (
								<SlotItem key={slot.id}>
									<span>::</span>
									{slot.imageUrl && (
										<img src={slot.imageUrl} alt={slot.title} />
									)}
									<span>{slot.title}</span>
									<Button
										size="sm"
										variant="secondary"
										onPress={() => handleRemoveRecipe(slot.id)}
									>
										Delete
									</Button>
								</SlotItem>
							))}
						</SlotsList>

						<DragIntentContainer
							active={true}
							onDragIntentStart={() => setDragIntentActive(true)}
							onDragIntentEnd={() => setDragIntentActive(false)}
							onDrop={(e: React.DragEvent<HTMLDivElement>) => {
								e.preventDefault();
								e.stopPropagation();

								try {
									const cardType = e.dataTransfer.getData(CARD_TYPE);

									if (cardType === CardTypesMap.RECIPE) {
										const recipeData = JSON.parse(
											e.dataTransfer.getData(CardTypesMap.RECIPE),
										) as Recipe;

										const newSlot: PackageRecipe = {
											id: recipeData.id,
											title: recipeData.title,
											imageUrl:
												recipeData.previewImage?.url ||
												recipeData.featuredImage?.url,
											position: pkg.slots.length,
										};

										const updatedSlots = [...pkg.slots, newSlot];
										onPackageChange({
											...pkg,
											slots: updatedSlots,
											isModified: true,
										});

										console.log('Added recipe to slots:', recipeData.title);
									} else if (cardType === CardTypesMap.CHEF) {
										const chefData = JSON.parse(
											e.dataTransfer.getData(CardTypesMap.CHEF),
										) as Chef;

										// For chefs, create a PackageRecipe with chef info
										const newSlot: PackageRecipe = {
											id: chefData.id,
											title: chefData.webTitle || chefData.internalName,
											imageUrl: chefData.bylineImageUrl,
											position: pkg.slots.length,
										};

										const updatedSlots = [...pkg.slots, newSlot];
										onPackageChange({
											...pkg,
											slots: updatedSlots,
											isModified: true,
										});

										console.log('Added chef to slots:', chefData.webTitle);
									}
								} catch (error) {
									console.error('Error processing drop:', error);
								}

								setDragIntentActive(false);
							}}
							style={{
								opacity: dragIntentActive ? 0.8 : 1,
								transition: 'opacity 0.2s',
							}}
						>
							<DragDropZone>
								+ Drag recipes or chefs here to attach
							</DragDropZone>
						</DragIntentContainer>
					</SlotsContainer>
				</div>

				{/* Publish & Deep Link Workflow Section */}
				<Section>
					<SectionTitle>Publish & Deep Link Workflow</SectionTitle>

					<PublishActions>
						<Button variant="secondary" size="md" onPress={() => {}}>
							Save Draft
						</Button>
						<Button variant="primary" size="md" onPress={() => {}}>
							Publish
						</Button>
						{/*<Button*/}
						{/*	variant="secondary"*/}
						{/*	size="md"*/}
						{/*	onPress={() => {}}*/}
						{/*	style={{ color: '#d00' }}*/}
						{/*>*/}
						{/*	Unpublish*/}
						{/*</Button>*/}
					</PublishActions>

					<div>
						<div style={{ fontSize: '12px', marginBottom: '8px' }}>
							Deep Link URL Field: Label
						</div>
						<DeepLinkContainer>
							<input
								type="text"
								value={
									pkg.deepLinkUrl ||
									`https://facia.app/email?packageId=${pkg.id}`
								}
								readOnly
							/>
						</DeepLinkContainer>
					</div>

					<div style={{ marginTop: '10px' }}>
						<Button variant="secondary" size="sm" onPress={() => {}}>
							Copy URL
						</Button>
					</div>
				</Section>
			</BuilderContent>
		</BuilderContainer>
	);
};

export default PackageCollectionBuilder;
