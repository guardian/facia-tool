import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { css } from '@emotion/react';
import v4 from 'uuid/v4';
import {
	DragDropContext,
	Draggable,
	DropResult,
	Droppable,
} from 'react-beautiful-dnd';
import { FiMinus, FiPlus, FiRefreshCw } from 'react-icons/fi';
import {
	SidebarStepperNavigation,
	type StepNavConfig,
} from '@guardian/stand/SidebarStepperNavigation';
import { UserFeedbackSummary } from '@guardian/stand/UserFeedbackSummary';
import { TextInput } from '@guardian/stand/TextInput';
import { Option, Select } from '@guardian/stand/Select';
import { Button } from '@guardian/stand/Button';
import { Tabs, type TabTheme } from '@guardian/stand/Tabs';
import {
	ToggleSwitch,
	type ToggleSwitchTheme,
} from '@guardian/stand/ToggleSwitch';
import { Grid, Item } from '@guardian/stand/Grid';
import { Typography } from '@guardian/stand/Typography';
import { Icon, type IconProps } from '@guardian/stand/Icon';

import { selectShouldUseCODELinks } from 'selectors/configSelectors';
import {
	CustomSubnav,
	SubnavImage,
	SubnavLink,
	TargetedPage,
	TargetedPageType,
} from './types';
import SubnavImagesSection from './SubnavImagesSection';
import {
	AddRow,
	DragHandle,
	ErrorMessage,
	RepeatableRow,
	RemoveButtonSlot,
	RowFields,
	CreateFormSection,
	CreateFormMain,
	CreateFormActions,
	SubnavCreateFormPage,
	CreateFormSidebar,
	CreateFormPreview,
	CreateFormPreviewHeader,
	CreateFormPreviewTitleRow,
	CreateFormPreviewToolbar,
	CreateFormPreviewViewport,
	CreateFormPreviewScaler,
	CreateFormPreviewPlaceholder,
	CreateFormPreviewFrame,
	ColumnHeaders,
	ColumnHeadersSpacer,
	Field,
	ItemHeader,
	ItemText,
} from './styles';
import { theme } from 'constants/theme';
import { DragIcon } from 'components/icons/Icons';

interface SubnavFormProps {
	onSaveDraft: (subnav: CustomSubnav) => Promise<void>;
	onPublish: (id: string) => Promise<void>;
	saving: boolean;
	// When present the form is in edit mode: fields are seeded from this subnav,
	// and the extra publish actions below are shown.
	initialSubnav?: CustomSubnav;
	hasLive?: boolean;
	hasDraft?: boolean;
	actionPending?: boolean;
	onDiscard?: () => void;
	onUnpublish?: () => void;
	onDelete?: () => void;
}

type StepId = 'header' | 'links' | 'pages' | 'images' | 'review';

// Local nav-item row carries a stable id for drag-and-drop reordering.
type LinkRow = SubnavLink & { id: string };

const toggleSwitchTheme: ToggleSwitchTheme = {
	shared: {
		track: {
			selected: { backgroundColor: theme.colors.orange200 },
		},
		thumb: {
			color: theme.colors.orange200,
		},
	},
};

const previewTabTheme: TabTheme = {
	shared: {
		selected: {
			border: {
				border: `0.5rem solid ${theme.colors.orange}`,
				background: theme.colors.orange,
			},
		},
	},
};

const stepOrder: StepId[] = ['header', 'links', 'pages', 'images', 'review'];

const stepLabels: Record<StepId, string> = {
	header: 'Header',
	links: 'Nav items',
	pages: 'Assign to pages',
	images: 'Images',
	review: 'Publish',
};

const pageTypeOptions: { value: TargetedPageType; label: string }[] = [
	{ value: 'front', label: 'Front' },
	{ value: 'article', label: 'Article' },
	{ value: 'hasTag', label: 'Tag' },
];

const emptyLink = (): LinkRow => ({ id: v4(), linkText: '', dotcomPath: '' });
const emptyPage = (): TargetedPage => ({ type: 'front', path: '' });

// Seed the editable link rows from a subnav, giving each a stable drag id.
const toLinkRows = (subnav?: CustomSubnav): LinkRow[] =>
	subnav?.links.length
		? subnav.links.map((link) => ({ id: v4(), ...link }))
		: [emptyLink()];

const toPageRows = (subnav?: CustomSubnav): TargetedPage[] =>
	subnav?.pages.length
		? subnav.pages.map((page) => ({ ...page }))
		: [emptyPage()];

// The preview origin can take up to ~a minute to pick up a saved draft.
const PREVIEW_PROPAGATION_SECONDS = 60;

type Breakpoint = 'mobile' | 'tablet' | 'desktop';

const breakpointOptions: {
	id: Breakpoint;
	label: string;
	width: number;
	icon: NonNullable<IconProps['symbol']>;
}[] = [
	{ id: 'desktop', label: 'Desktop', width: 1300, icon: 'computer' },
	{ id: 'tablet', label: 'Tablet', width: 740, icon: 'tablet_android' },
	{ id: 'mobile', label: 'Mobile', width: 375, icon: 'mobile' },
];

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
		border-right: 1px solid ${theme.colors.whiteGrey};
	}
`;

const stepperTheme = {
	navigation: {
		shared: {
			border: `0.0625rem solid ${theme.colors.whiteGrey}`,
			currentBackgroundColor: `${theme.colors.orange}`,
		},
	},
	step: {
		shared: {
			backgroundColor: `${theme.colors.whiteMedium}`,
			currentBackgroundColor: `${theme.colors.whiteMedium}`,
			text: {
				inverseColor: `${theme.colors.blackDark}`,
			},
		},
	},
	stepNumber: {
		shared: {
			backgroundColor: `${theme.colors.orange}`,
			color: `${theme.colors.blackDark}`,
		},
	},
};

const sidebarItemStyle = css`
	align-self: stretch;
	border-radius: 4px;
	background-color: ${theme.colors.whiteMedium};
`;

const deleteButtonStyle = css`
	color: #c70000;
`;

const sectionHeadingStyle = css({
	paddingBottom: '0px',
	marginBottom: '0px',
});

const sectionDescriptionStyle = css({
	marginBottom: '16px',
	color: theme.base.colors.textMuted,
});

const SubnavForm = ({
	onSaveDraft,
	onPublish,
	saving,
	initialSubnav,
	hasLive = false,
	hasDraft = false,
	actionPending = false,
	onDiscard,
	onUnpublish,
	onDelete,
}: SubnavFormProps) => {
	const isEditMode = initialSubnav !== undefined;

	const [currentStepId, setCurrentStepId] = useState<StepId>('header');
	const [headerText, setHeaderText] = useState(
		initialSubnav?.header.headerText ?? '',
	);
	const [showHeaderText, setShowHeaderText] = useState(
		initialSubnav?.header.showHeaderText !== false,
	);
	const [headerDotcomPath, setHeaderDotcomPath] = useState(
		initialSubnav?.header.dotcomPath ?? '',
	);
	const [links, setLinks] = useState<LinkRow[]>(() =>
		toLinkRows(initialSubnav),
	);
	const [pages, setPages] = useState<TargetedPage[]>(() =>
		toPageRows(initialSubnav),
	);
	const [images, setImages] = useState<SubnavImage[]>(
		initialSubnav?.images ?? [],
	);
	const [error, setError] = useState<string | null>(null);
	const [breakpoint, setBreakpoint] = useState<Breakpoint>('desktop');
	// Bumped to force the preview iframe to reload once DCR has polled the draft.
	const [previewNonce, setPreviewNonce] = useState(0);
	// Seconds left in the post-save propagation window; null when not waiting.
	const [previewCountdown, setPreviewCountdown] = useState<number | null>(null);

	// Stable id so repeated saves update the same draft and publish targets it.
	const subnavId = useRef(initialSubnav?.id ?? v4());
	// Seeded from the loaded subnav in edit mode so the preview and dirty check
	// have a baseline; set after each save in both modes.
	const [savedSubnav, setSavedSubnav] = useState<CustomSubnav | null>(
		initialSubnav ?? null,
	);
	// Gates publishing and the "will go live" warning: true when a draft exists
	// on the server (edit mode) or has been saved this session.
	const [draftSaved, setDraftSaved] = useState(hasDraft);
	const useCODELinks = useSelector(selectShouldUseCODELinks);

	const previewViewportRef = useRef<HTMLDivElement>(null);
	const [previewViewport, setPreviewViewport] = useState({
		width: 0,
		height: 0,
	});

	// Saving re-seeds the form via a key change in the parent, which unmounts
	// this instance; track mounted state so the post-save updates below don't
	// fire on an unmounted component.
	const isMounted = useRef(true);
	useEffect(() => {
		isMounted.current = true;
		return () => {
			isMounted.current = false;
		};
	}, []);

	// Track the available preview area so the device can be scaled to fit it.
	useEffect(() => {
		const el = previewViewportRef.current;
		if (!el) {
			return;
		}
		const observer = new ResizeObserver(([entry]) => {
			setPreviewViewport({
				width: entry.contentRect.width,
				height: entry.contentRect.height,
			});
		});
		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	const previewWidth =
		breakpointOptions.find((o) => o.id === breakpoint)?.width ?? 1300;
	// Shrink oversized devices to fit; never enlarge past 1:1.
	const previewScale =
		previewViewport.width > 0
			? Math.min(1, previewViewport.width / previewWidth)
			: 1;
	const previewHeight =
		previewScale > 0 ? previewViewport.height / previewScale : 0;

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
			case 'images':
				return images.length > 0 ? 'complete' : 'optional';
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

	const buildSubnav = (): CustomSubnav => {
		const cleanedLinks = links.filter(
			(link) => link.linkText.trim() || link.dotcomPath.trim(),
		);
		const cleanedPages = pages.filter((page) => page.path.trim());

		return {
			id: subnavId.current,
			header: {
				headerText: headerText.trim(),
				showHeaderText,
				dotcomPath: headerDotcomPath.trim() || undefined,
				copy: initialSubnav?.header.copy ?? '',
			},
			format: initialSubnav?.format ?? 'large',
			links: cleanedLinks.map((link) => ({
				linkText: link.linkText.trim(),
				dotcomPath: link.dotcomPath.trim(),
			})),
			pages: cleanedPages.map((page) => ({
				type: page.type,
				path: page.path.trim(),
			})),
			images: images.length > 0 ? images : undefined,
			palette: initialSubnav?.palette,
			lastUpdated: Date.now(),
			updatedBy: initialSubnav?.updatedBy ?? '',
			updatedEmail: initialSubnav?.updatedEmail ?? '',
		};
	};

	// Canonical content-only signature so dirty checks ignore audit/timestamp
	// fields and normalise shape differences between the server response and the
	// form-built subnav (key order, trimming, missing vs empty), otherwise a
	// freshly saved subnav looks perpetually dirty and publishing stays blocked.
	const signature = (subnav: CustomSubnav) =>
		JSON.stringify({
			header: {
				headerText: subnav.header.headerText.trim(),
				showHeaderText: subnav.header.showHeaderText,
				dotcomPath: subnav.header.dotcomPath?.trim() || '',
				copy: subnav.header.copy ?? '',
			},
			format: subnav.format ?? 'large',
			links: subnav.links
				.filter((link) => link.linkText.trim() || link.dotcomPath.trim())
				.map((link) => ({
					linkText: link.linkText.trim(),
					dotcomPath: link.dotcomPath.trim(),
				})),
			pages: subnav.pages
				.filter((page) => page.path.trim())
				.map((page) => ({ type: page.type, path: page.path.trim() })),
			images: (subnav.images ?? []).map((image) => ({
				imageSrc: image.imageSrc,
				breakpoint: image.breakpoint,
				platforms: image.platforms,
			})),
			palette: subnav.palette ?? null,
		});

	const currentSubnav = buildSubnav();
	const isDirty =
		!savedSubnav || signature(currentSubnav) !== signature(savedSubnav);
	const requiredComplete = hasHeader && hasLink && hasPage;
	const canSaveDraft = hasHeader && isDirty && !saving && !actionPending;
	const canPublish =
		draftSaved && !isDirty && requiredComplete && !saving && !actionPending;

	const previewDomain = useCODELinks
		? 'preview.code.dev-gutools.co.uk'
		: 'preview.gutools.co.uk';
	const savedFirstPagePath = savedSubnav?.pages[0]?.path;
	const previewUrl = savedFirstPagePath
		? `https://${previewDomain}/${savedFirstPagePath.replace(/^\//, '')}?cacheBust=${previewNonce}`
		: null;
	const savedPagesSummary = savedSubnav?.pages
		.map((page) => page.path)
		.join(', ');

	const handleSaveDraft = async () => {
		setError(null);
		const subnav = currentSubnav;
		try {
			await onSaveDraft(subnav);
			if (!isMounted.current) {
				return;
			}
			setSavedSubnav(subnav);
			setDraftSaved(true);
			setPreviewCountdown(PREVIEW_PROPAGATION_SECONDS);
		} catch (e) {
			console.error('Failed to save subnav draft', e);
		}
	};

	// The web platform should pick up on subnav changes after a minute or so. Count down the propagation window, then auto-reload the frame once.
	useEffect(() => {
		if (previewCountdown === null) {
			return;
		}
		if (previewCountdown <= 0) {
			setPreviewNonce((n) => n + 1);
			setPreviewCountdown(null);
			return;
		}
		const timer = setTimeout(
			() => setPreviewCountdown((s) => (s === null ? null : s - 1)),
			1000,
		);
		return () => clearTimeout(timer);
	}, [previewCountdown]);

	const handlePublish = async () => {
		setError(null);
		try {
			await onPublish(subnavId.current);
		} catch (e) {
			console.error('Failed to publish subnav', e);
		}
	};

	return (
		<SubnavCreateFormPage>
			<Grid theme={gridTheme}>
				<Item size={{ sm: 12, lg: 'auto' }} cssOverrides={sidebarItemStyle}>
					<CreateFormSidebar>
						<SidebarStepperNavigation
							stepNavTitle="Steps"
							currentStepId={currentStepId}
							stepNavConfig={stepNavConfig}
							onPress={(stepId) => scrollToStep(stepId as StepId)}
							theme={stepperTheme}
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
							<Typography
								element="h2"
								variant="heading2Xl"
								cssOverrides={sectionHeadingStyle}
							>
								Header
							</Typography>
							<Typography
								element="body"
								variant="bodyMd"
								cssOverrides={sectionDescriptionStyle}
							>
								Add a header text and paste an optional URL link
							</Typography>
							<RowFields>
								<TextInput
									label="Header text"
									isRequired
									fluid
									value={headerText}
									onChange={setHeaderText}
									placeholder="e.g. UK election 2024"
								/>
								<TextInput
									label="URL (Dotcom path) (optional)"
									fluid
									value={headerDotcomPath}
									onChange={setHeaderDotcomPath}
									placeholder="e.g. politics/uk-election-2024"
								/>
							</RowFields>
							<Field>
								<ItemHeader>Header text display</ItemHeader>
								<ItemText>Show header text</ItemText>
								<ToggleSwitch
									isSelected={showHeaderText}
									onChange={(isSelected) => setShowHeaderText(isSelected)}
									theme={toggleSwitchTheme}
								/>
							</Field>
						</CreateFormSection>
						<CreateFormSection
							ref={setSectionRef('links')}
							data-step-id="links"
							active={currentStepId === 'links'}
							onFocus={() => setCurrentStepId('links')}
						>
							<Typography
								element="h2"
								variant="heading2Xl"
								cssOverrides={sectionHeadingStyle}
							>
								Nav Items
							</Typography>
							<Typography
								element="body"
								variant="bodyMd"
								cssOverrides={sectionDescriptionStyle}
							>
								Add navigational menu items and their URLs
							</Typography>
							<ColumnHeaders>
								<ColumnHeadersSpacer width={24} aria-hidden />
								<RowFields>
									<Typography
										element="bold"
										variant="bodyBoldMd"
										cssOverrides={css({ letterSpacing: '-0.05px' })}
									>
										Item name
									</Typography>
									<Typography
										element="bold"
										variant="bodyBoldMd"
										cssOverrides={css({ letterSpacing: '-0.05px' })}
									>
										Dotcom path
									</Typography>
								</RowFields>
								<ColumnHeadersSpacer width={40} aria-hidden />
							</ColumnHeaders>
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
																<DragIcon size="l" />
															</DragHandle>
															<RowFields>
																<TextInput
																	aria-label="Link text"
																	fluid
																	value={link.linkText}
																	onChange={(value) =>
																		updateLink(index, { linkText: value })
																	}
																/>
																<TextInput
																	aria-label="Dotcom path"
																	fluid
																	value={link.dotcomPath}
																	onChange={(value) =>
																		updateLink(index, { dotcomPath: value })
																	}
																/>
															</RowFields>
															<RemoveButtonSlot>
																{links.length > 1 && (
																	<Button
																		variant="tertiary"
																		size="md"
																		icon={<FiMinus />}
																		onPress={() => removeLink(index)}
																		aria-label="Remove nav item"
																		cssOverrides={css({
																			padding: '0.25em 0.45em 0.25em 0.5em',
																		})}
																	/>
																)}
															</RemoveButtonSlot>
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
									variant="tertiary"
									size="sm"
									icon={<FiPlus />}
									onPress={addLink}
									cssOverrides={css({ marginLeft: '26px' })}
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
							<Typography
								element="h2"
								variant="heading2Xl"
								cssOverrides={sectionHeadingStyle}
							>
								Assign to pages
							</Typography>
							<Typography
								element="body"
								variant="bodyMd"
								cssOverrides={sectionDescriptionStyle}
							>
								Assign the subnav to specific front, tag or article you’d like
								it to be displayed
							</Typography>
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
									{pages.length > 1 && (
										<Button
											variant="tertiary"
											size="md"
											icon={<FiMinus />}
											onPress={() => removePage(index)}
											aria-label="Remove page"
											cssOverrides={css({
												padding: '0.25em 0.45em 0.25em 0.5em',
											})}
										/>
									)}
								</RepeatableRow>
							))}
							<AddRow>
								<Button
									variant="tertiary"
									size="sm"
									icon={<FiPlus />}
									onPress={addPage}
								>
									Add page
								</Button>
							</AddRow>
						</CreateFormSection>

						<CreateFormSection
							ref={setSectionRef('images')}
							data-step-id="images"
							active={currentStepId === 'images'}
							onFocus={() => setCurrentStepId('images')}
						>
							<Typography
								element="h2"
								variant="heading2Xl"
								cssOverrides={sectionHeadingStyle}
							>
								Banner Image (optional){' '}
							</Typography>
							<Typography
								element="body"
								variant="bodyMd"
								cssOverrides={sectionDescriptionStyle}
							>
								Add images to the Subnav header, you can also add multiple
								images for different breakpoints
							</Typography>
							<SubnavImagesSection images={images} onChange={setImages} />
						</CreateFormSection>

						<CreateFormSection
							ref={setSectionRef('review')}
							data-step-id="review"
							active={currentStepId === 'review'}
							onFocus={() => setCurrentStepId('review')}
						>
							<Typography
								element="h2"
								variant="heading2Xl"
								cssOverrides={sectionHeadingStyle}
							>
								Save & Publish
							</Typography>
							<Typography
								element="body"
								variant="bodyMd"
								cssOverrides={sectionDescriptionStyle}
							>
								Review the subnav in the panel on the right, then publish when
								you are ready.{' '}
							</Typography>

							{error && <ErrorMessage>{error}</ErrorMessage>}
							{draftSaved && (
								<Typography element="p" variant="bodySm">
									Publishing will make this subnav live on its assigned pages
									{savedPagesSummary ? `: ${savedPagesSummary}` : ''}.
								</Typography>
							)}
							<CreateFormActions>
								<Button
									variant="secondary"
									size="sm"
									onPress={handleSaveDraft}
									isDisabled={!canSaveDraft}
								>
									{saving ? 'Saving…' : 'Save draft'}
								</Button>
								<Button
									variant="primary"
									size="sm"
									onPress={handlePublish}
									isDisabled={!canPublish}
								>
									{saving ? 'Publishing…' : 'Publish subnav'}
								</Button>
								{isEditMode && hasLive && hasDraft && onDiscard && (
									<Button
										variant="secondary"
										size="sm"
										onPress={onDiscard}
										isDisabled={saving || actionPending}
									>
										Discard changes
									</Button>
								)}
								{isEditMode && hasLive && onUnpublish && (
									<Button
										variant="secondary"
										size="sm"
										onPress={onUnpublish}
										isDisabled={saving || actionPending}
									>
										Take down
									</Button>
								)}
								{isEditMode && onDelete && (
									<Button
										variant="tertiary"
										size="sm"
										onPress={onDelete}
										isDisabled={saving || actionPending}
										cssOverrides={deleteButtonStyle}
									>
										Delete
									</Button>
								)}
							</CreateFormActions>
						</CreateFormSection>
					</CreateFormMain>
				</Item>
				<Item size={{ sm: 12, lg: 'grow' }} cssOverrides={sidebarItemStyle}>
					<CreateFormPreview>
						<CreateFormPreviewHeader>
							<CreateFormPreviewTitleRow>
								{/* <CreateFormPreviewTitle cssOverrides={}>Preview</CreateFormPreviewTitle> */}
								<p
									style={{
										display: 'flex',
										alignItems: 'flex-start',
										gap: '6px',
										margin: 0,
									}}
								>
									<Icon
										size="lg"
										symbol="preview"
										cssOverrides={css`
											align-self: center;
										`}
									/>
									<Typography
										element="h3"
										variant="headingMd"
										cssOverrides={css({ fontSize: '18px' })}
									>
										Preview
									</Typography>
								</p>
								<Button
									variant="tertiary"
									size="sm"
									icon={<FiRefreshCw />}
									aria-label="Refresh preview"
									onPress={() => {
										setPreviewNonce((n) => n + 1);
										setPreviewCountdown(null);
									}}
									isDisabled={!previewUrl}
								>
									Refresh
								</Button>
							</CreateFormPreviewTitleRow>
							<UserFeedbackSummary
								level="information"
								title="Latest preview will refresh every 60 seconds."
								cssOverrides={css({
									maxWidth: '100%',
									backgroundColor: 'white',
								})}
							>
								{previewCountdown !== null && (
									<>Refreshing in {previewCountdown}s.</>
								)}
							</UserFeedbackSummary>

							<CreateFormPreviewToolbar>
								<Tabs
									selectedKey={breakpoint}
									onSelectionChange={(key) => setBreakpoint(key as Breakpoint)}
								>
									<Tabs.TabList aria-label="Preview breakpoint">
										{breakpointOptions.map((option) => (
											<Tabs.Tab
												key={option.id}
												id={option.id}
												theme={previewTabTheme}
												icon={<Icon symbol={option.icon} fill="grey" />}
											>
												{option.label}
											</Tabs.Tab>
										))}
									</Tabs.TabList>
								</Tabs>
							</CreateFormPreviewToolbar>
						</CreateFormPreviewHeader>
						<CreateFormPreviewViewport ref={previewViewportRef}>
							{previewUrl ? (
								<CreateFormPreviewScaler
									style={{
										width: previewWidth * previewScale,
										height: previewViewport.height,
									}}
								>
									<CreateFormPreviewFrame
										title="Subnav preview"
										src={previewUrl}
										// Trusted Guardian preview origin, but sandboxed for defence-in-depth;
										// allow-same-origin is kept so pan-domain auth cookies/storage still work.
										sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
										referrerPolicy="no-referrer"
										style={{
											width: previewWidth,
											height: previewHeight,
											transform: `scale(${previewScale})`,
										}}
									/>
								</CreateFormPreviewScaler>
							) : (
								<CreateFormPreviewPlaceholder>
									No draft subnav to display
								</CreateFormPreviewPlaceholder>
							)}
						</CreateFormPreviewViewport>
					</CreateFormPreview>
				</Item>
			</Grid>
		</SubnavCreateFormPage>
	);
};

export default SubnavForm;
