import React, { useEffect, useRef, useState } from 'react';
import { css } from '@emotion/react';
import v4 from 'uuid/v4';
import {
	DragDropContext,
	Draggable,
	DropResult,
	Droppable,
} from 'react-beautiful-dnd';
import { FiMinusCircle, FiPlusCircle } from 'react-icons/fi';
import { FaGripVertical } from 'react-icons/fa';
import {
	SidebarStepperNavigation,
	type StepNavConfig,
} from '@guardian/stand/SidebarStepperNavigation';
import { TextInput } from '@guardian/stand/TextInput';
import { TextArea } from '@guardian/stand/TextArea';
import { Option, Select } from '@guardian/stand/Select';
import { Button } from '@guardian/stand/Button';
import { Grid, Item } from '@guardian/stand/Grid';
import {
	CustomSubnav,
	SubnavLink,
	TargetedPage,
	TargetedPageType,
} from './types';
import {
	AddRow,
	DragHandle,
	ErrorMessage,
	IconButton,
	RepeatableRow,
	RowFields,
	SubnavContainerHeading,
	CreateFormSection,
	CreateFormMain,
	CreateFormActions,
	SubnavCreateFormPage,
	CreateFormSidebar,
} from './styles';

interface SubnavCreateFormProps {
	onCreate: (subnav: CustomSubnav) => Promise<void> | void;
	saving: boolean;
}

type StepId = 'header' | 'links' | 'pages' | 'review';

// Local nav-item row carries a stable id for drag-and-drop reordering.
type LinkRow = SubnavLink & { id: string };

const stepOrder: StepId[] = ['header', 'links', 'pages', 'review'];

const stepLabels: Record<StepId, string> = {
	header: 'Header',
	links: 'Nav items',
	pages: 'Assign to pages',
	review: 'Publish',
};

const pageTypeOptions: { value: TargetedPageType; label: string }[] = [
	{ value: 'front', label: 'Front' },
	{ value: 'article', label: 'Article' },
	{ value: 'hasTag', label: 'Tag' },
];

const emptyLink = (): LinkRow => ({ id: v4(), linkText: '', dotcomPath: '' });
const emptyPage = (): TargetedPage => ({ type: 'front', path: '' });

const gridTheme = {
	shared: {
		display: 'flex',
		width: '100%',
		direction: 'row',
		wrap: 'wrap',
		justifyContent: 'flex-start',
		alignItems: 'flex-start',
	},
	sm: { columns: 12, gap: '0', padding: '0' },
	md: { columns: 12, gap: '0', padding: '0' },
	lg: { columns: 12, gap: '0', padding: '0' },
};

const stepperOverrides = css`
	li button > div:first-of-type {
		border-right: 1px solid #dcdcdc;
	}
`;

const SubnavCreateForm = ({ onCreate, saving }: SubnavCreateFormProps) => {
	const [currentStepId, setCurrentStepId] = useState<StepId>('header');
	const [headerText, setHeaderText] = useState('');
	const [headerCopy, setHeaderCopy] = useState('');
	const [headerDotcomPath, setHeaderDotcomPath] = useState('');
	const [links, setLinks] = useState<LinkRow[]>([emptyLink()]);
	const [pages, setPages] = useState<TargetedPage[]>([emptyPage()]);
	const [error, setError] = useState<string | null>(null);

	const sectionRefs = useRef<Partial<Record<StepId, HTMLElement | null>>>({});
	const setSectionRef = (id: StepId) => (el: HTMLElement | null) => {
		sectionRefs.current[id] = el;
	};

	const scrollToStep = (id: StepId) => {
		setCurrentStepId(id);
		sectionRefs.current[id]?.scrollIntoView({
			behavior: 'smooth',
			block: 'start',
		});
	};

	// Keep the sidebar highlight in sync with the section scrolled into view.
	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				const visible = entries
					.filter((entry) => entry.isIntersecting)
					.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
				const stepId = visible[0]?.target.getAttribute('data-step-id');
				if (stepId) {
					setCurrentStepId(stepId as StepId);
				}
			},
			{ rootMargin: '-20% 0px -70% 0px' },
		);
		stepOrder.forEach((id) => {
			const el = sectionRefs.current[id];
			if (el) {
				observer.observe(el);
			}
		});
		return () => observer.disconnect();
	}, []);

	const hasHeader = headerText.trim().length > 0;
	const hasLink = links.some((link) => link.linkText.trim().length > 0);
	const hasPage = pages.some((page) => page.path.trim().length > 0);

	const stepStatus = (id: StepId) => {
		switch (id) {
			case 'header':
				return hasHeader ? 'complete' : 'incomplete';
			case 'pages':
				return hasPage ? 'complete' : 'incomplete';
			case 'links':
				return hasLink ? 'complete' : 'incomplete';
			default:
				return 'no-fields';
		}
	};

	const stepNavConfig: StepNavConfig = {
		isNonLinear: true,
		steps: stepOrder.map((id) => ({
			id,
			label: stepLabels[id],
			stepStatus: stepStatus(id),
			canSkipTo: true,
			canSkipFrom: true,
		})),
	};

	const updateLink = (index: number, patch: Partial<SubnavLink>) =>
		setLinks((prev) =>
			prev.map((link, i) => (i === index ? { ...link, ...patch } : link)),
		);
	const addLink = () => setLinks((prev) => [...prev, emptyLink()]);
	const removeLink = (index: number) =>
		setLinks((prev) => prev.filter((_, i) => i !== index));
	const moveLink = (result: DropResult) => {
		if (!result.destination) {
			return;
		}
		const from = result.source.index;
		const to = result.destination.index;
		setLinks((prev) => {
			const next = Array.from(prev);
			const [moved] = next.splice(from, 1);
			next.splice(to, 0, moved);
			return next;
		});
	};

	const updatePage = (index: number, patch: Partial<TargetedPage>) =>
		setPages((prev) =>
			prev.map((page, i) => (i === index ? { ...page, ...patch } : page)),
		);
	const addPage = () => setPages((prev) => [...prev, emptyPage()]);
	const removePage = (index: number) =>
		setPages((prev) => prev.filter((_, i) => i !== index));

	const handleCreate = async () => {
		if (!hasHeader) {
			setError('Header text is required.');
			scrollToStep('header');
			return;
		}

		if (!hasLink) {
			setError('Add at least one nav item.');
			scrollToStep('links');
			return;
		}

		const cleanedPages = pages.filter((page) => page.path.trim());
		if (cleanedPages.length === 0) {
			setError('Add at least one targeted page where the subnav will show.');
			scrollToStep('pages');
			return;
		}

		setError(null);

		const cleanedLinks = links.filter(
			(link) => link.linkText.trim() || link.dotcomPath.trim(),
		);

		const subnav: CustomSubnav = {
			id: v4(),
			header: {
				headerText: headerText.trim(),
				dotcomPath: headerDotcomPath.trim() || undefined,
				copy: headerCopy.trim(),
			},
			format: 'large',
			links: cleanedLinks.map((link) => ({
				linkText: link.linkText.trim(),
				dotcomPath: link.dotcomPath.trim(),
			})),
			pages: cleanedPages.map((page) => ({
				type: page.type,
				path: page.path.trim(),
			})),
			images: undefined,
			palette: undefined,
			lastUpdated: Date.now(),
			updatedBy: '',
			updatedEmail: '',
		};

		try {
			await onCreate(subnav);
		} catch (e) {
			console.error('Failed to create subnav', e);
		}
	};

	return (
		<SubnavCreateFormPage>
			<Grid theme={gridTheme}>
				<Item size={{ sm: 12, lg: 'auto' }}>
					<CreateFormSidebar>
						<SidebarStepperNavigation
							stepNavTitle="Steps"
							currentStepId={currentStepId}
							stepNavConfig={stepNavConfig}
							onPress={(stepId) => scrollToStep(stepId as StepId)}
							cssOverrides={stepperOverrides}
						/>
					</CreateFormSidebar>
				</Item>
				<Item size={{ sm: 12, lg: 'grow' }}>
					<CreateFormMain>
						<CreateFormSection
							ref={setSectionRef('header')}
							data-step-id="header"
							active={currentStepId === 'header'}
							onFocus={() => setCurrentStepId('header')}
						>
							<SubnavContainerHeading>Header</SubnavContainerHeading>
							<TextArea
								label="Description"
								value={headerCopy}
								onChange={setHeaderCopy}
								placeholder="Add description"
								fluid
							/>
							<RowFields>
								<TextInput
									label="Header text"
									description="Contextual text for the subnav header"
									isRequired
									fluid
									value={headerText}
									onChange={setHeaderText}
									placeholder="e.g. UK election 2024"
								/>
								<TextInput
									label="URL (Dotcom path)"
									description="Where the header links to (optional)"
									fluid
									value={headerDotcomPath}
									onChange={setHeaderDotcomPath}
									placeholder="e.g. politics/uk-election-2024"
								/>
							</RowFields>
						</CreateFormSection>

						<CreateFormSection
							ref={setSectionRef('links')}
							data-step-id="links"
							active={currentStepId === 'links'}
							onFocus={() => setCurrentStepId('links')}
						>
							<SubnavContainerHeading>Nav items</SubnavContainerHeading>
							<DragDropContext onDragEnd={moveLink}>
								<Droppable droppableId="subnav-nav-items">
									{(dropProvided) => (
										<div
											ref={dropProvided.innerRef}
											{...dropProvided.droppableProps}
										>
											{links.map((link, index) => (
												<Draggable
													key={link.id}
													draggableId={link.id}
													index={index}
												>
													{(provided) => (
														<RepeatableRow
															ref={provided.innerRef}
															{...provided.draggableProps}
															style={provided.draggableProps.style}
														>
															<DragHandle
																{...provided.dragHandleProps}
																aria-label="Reorder nav item"
															>
																<FaGripVertical />
															</DragHandle>
															<RowFields>
																<TextInput
																	label={index === 0 ? 'Link text' : undefined}
																	aria-label="Link text"
																	fluid
																	value={link.linkText}
																	onChange={(value) =>
																		updateLink(index, { linkText: value })
																	}
																/>
																<TextInput
																	label={
																		index === 0 ? 'Dotcom path' : undefined
																	}
																	aria-label="Dotcom path"
																	fluid
																	value={link.dotcomPath}
																	onChange={(value) =>
																		updateLink(index, { dotcomPath: value })
																	}
																/>
															</RowFields>
															<IconButton
																type="button"
																onClick={() => removeLink(index)}
																disabled={links.length === 1}
																aria-label="Remove nav item"
															>
																<FiMinusCircle />
															</IconButton>
														</RepeatableRow>
													)}
												</Draggable>
											))}
											{dropProvided.placeholder}
										</div>
									)}
								</Droppable>
							</DragDropContext>
							<AddRow>
								<Button
									variant="secondary"
									size="sm"
									icon={<FiPlusCircle />}
									onPress={addLink}
								>
									Add nav item
								</Button>
							</AddRow>
						</CreateFormSection>

						<CreateFormSection
							ref={setSectionRef('pages')}
							data-step-id="pages"
							active={currentStepId === 'pages'}
							onFocus={() => setCurrentStepId('pages')}
						>
							<SubnavContainerHeading>Assign to pages</SubnavContainerHeading>
							{pages.map((page, index) => (
								<RepeatableRow key={index}>
									<RowFields>
										<Select
											label={index === 0 ? 'Page type' : undefined}
											aria-label="Page type"
											selectedKey={page.type}
											onSelectionChange={(key) =>
												updatePage(index, { type: key as TargetedPageType })
											}
										>
											{pageTypeOptions.map((option) => (
												<Option key={option.value} id={option.value}>
													{option.label}
												</Option>
											))}
										</Select>
										<TextInput
											label={index === 0 ? 'Path' : undefined}
											aria-label="Path"
											fluid
											value={page.path}
											onChange={(value) => updatePage(index, { path: value })}
											placeholder="e.g. politics/uk-election-2024"
										/>
									</RowFields>
									<IconButton
										type="button"
										onClick={() => removePage(index)}
										disabled={pages.length === 1}
										aria-label="Remove page"
									>
										<FiMinusCircle />
									</IconButton>
								</RepeatableRow>
							))}
							<AddRow>
								<Button
									variant="secondary"
									size="sm"
									icon={<FiPlusCircle />}
									onPress={addPage}
								>
									Add page
								</Button>
							</AddRow>
						</CreateFormSection>

						<CreateFormSection
							ref={setSectionRef('review')}
							data-step-id="review"
							active={currentStepId === 'review'}
							onFocus={() => setCurrentStepId('review')}
						>
							<SubnavContainerHeading>Publish</SubnavContainerHeading>
							{error && <ErrorMessage>{error}</ErrorMessage>}
							<CreateFormActions>
								<Button
									variant="primary"
									size="sm"
									onPress={handleCreate}
									isDisabled={saving}
								>
									{saving ? 'Creating…' : 'Create subnav'}
								</Button>
							</CreateFormActions>
						</CreateFormSection>
					</CreateFormMain>
				</Item>
			</Grid>
		</SubnavCreateFormPage>
	);
};

export default SubnavCreateForm;
