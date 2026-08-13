import React, { useEffect, useRef, useState } from 'react';
import v4 from 'uuid/v4';
import ButtonDefault from 'components/inputs/ButtonDefault';
import {
	CustomSubnav,
	SubnavLink,
	TargetedPage,
	TargetedPageType,
} from './types';
import {
	ErrorMessage,
	Field,
	Form,
	FormActions,
	RepeatableRow,
	RowFields,
	SavedMessage,
	Section,
	SectionHeading,
	Select,
	TextInput,
} from './styles';

interface SubnavFormProps {
	initialSubnav?: CustomSubnav;
	onSave: (subnav: CustomSubnav) => Promise<void> | void;
	saving?: boolean;
}

const pageTypeOptions: { value: TargetedPageType; label: string }[] = [
	{ value: 'front', label: 'Front' },
	{ value: 'article', label: 'Article' },
	{ value: 'hasTag', label: 'Tag' },
];

const emptyLink = (): SubnavLink => ({ linkText: '', dotcomPath: '' });
const emptyPage = (): TargetedPage => ({ type: 'front', path: '' });

/**
 * The form's editable state, derived from the subnav being edited (or blank
 * defaults when creating). Arrays are cloned so edits never mutate the config
 * and so this snapshot can be used to detect changes and to reset the form.
 */
const toInitialFormState = (subnav?: CustomSubnav) => ({
	headerText: subnav?.header.headerText ?? '',
	headerDotcomPath: subnav?.header.dotcomPath ?? '',
	headerCopy: subnav?.header.copy ?? '',
	links: subnav?.links.length
		? subnav.links.map((link) => ({ ...link }))
		: [emptyLink()],
	pages: subnav?.pages.length
		? subnav.pages.map((page) => ({ ...page }))
		: [emptyPage()],
});

const SubnavForm = ({
	initialSubnav,
	onSave,
	saving = false,
}: SubnavFormProps) => {
	const mountedRef = useRef(true);
	useEffect(
		() => () => {
			mountedRef.current = false;
		},
		[],
	);

	const [baseline, setBaseline] = useState(() =>
		toInitialFormState(initialSubnav),
	);

	const [headerText, setHeaderText] = useState(baseline.headerText);
	const [headerDotcomPath, setHeaderDotcomPath] = useState(
		baseline.headerDotcomPath,
	);
	const [headerCopy, setHeaderCopy] = useState(baseline.headerCopy);
	const [links, setLinks] = useState<SubnavLink[]>(baseline.links);
	const [pages, setPages] = useState<TargetedPage[]>(baseline.pages);
	const [error, setError] = useState<string | null>(null);
	const [justSaved, setJustSaved] = useState(false);

	const isDirty =
		JSON.stringify({
			headerText,
			headerDotcomPath,
			headerCopy,
			links,
			pages,
		}) !== JSON.stringify(baseline);

	const handleCancel = () => {
		setHeaderText(baseline.headerText);
		setHeaderDotcomPath(baseline.headerDotcomPath);
		setHeaderCopy(baseline.headerCopy);
		setLinks(baseline.links.map((link) => ({ ...link })));
		setPages(baseline.pages.map((page) => ({ ...page })));
		setError(null);
	};

	const updateLink = (index: number, patch: Partial<SubnavLink>) =>
		setLinks((prev) =>
			prev.map((link, i) => (i === index ? { ...link, ...patch } : link)),
		);
	const addLink = () => setLinks((prev) => [...prev, emptyLink()]);
	const removeLink = (index: number) =>
		setLinks((prev) => prev.filter((_, i) => i !== index));

	const updatePage = (index: number, patch: Partial<TargetedPage>) =>
		setPages((prev) =>
			prev.map((page, i) => (i === index ? { ...page, ...patch } : page)),
		);
	const addPage = () => setPages((prev) => [...prev, emptyPage()]);
	const removePage = (index: number) =>
		setPages((prev) => prev.filter((_, i) => i !== index));

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();

		if (!headerText.trim()) {
			setError('Header text is required.');
			return;
		}

		const cleanedLinks = links.filter(
			(link) => link.linkText.trim() || link.dotcomPath.trim(),
		);
		const cleanedPages = pages.filter((page) => page.path.trim());

		if (cleanedPages.length === 0) {
			setError('Add at least one targeted page where the subnav will show.');
			return;
		}

		setError(null);

		const subnav: CustomSubnav = {
			id: initialSubnav?.id ?? v4(),
			header: {
				headerText: headerText.trim(),
				dotcomPath: headerDotcomPath.trim() || undefined,
				copy: headerCopy.trim(),
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
			images: initialSubnav?.images,
			palette: initialSubnav?.palette,
			lastUpdated: Date.now(),
			updatedBy: initialSubnav?.updatedBy ?? '',
			updatedEmail: initialSubnav?.updatedEmail ?? '',
		};

		try {
			await onSave(subnav);
		} catch {
			// The parent surfaces save failures via the global banner; keep the
			// user's edits in place so they can retry.
			return;
		}

		if (!mountedRef.current) {
			return;
		}

		// Re-seed the form from what we just persisted so it is no longer "dirty"
		// and we can confirm the save without navigating away.
		const savedState = toInitialFormState(subnav);
		setBaseline(savedState);
		setHeaderText(savedState.headerText);
		setHeaderDotcomPath(savedState.headerDotcomPath);
		setHeaderCopy(savedState.headerCopy);
		setLinks(savedState.links);
		setPages(savedState.pages);
		setJustSaved(true);
	};

	return (
		<Form onSubmit={handleSubmit}>
			<Section>
				<SectionHeading>Header</SectionHeading>
				<Field>
					Header text
					<TextInput
						value={headerText}
						onChange={(e) => setHeaderText(e.target.value)}
						placeholder="e.g. UK election 2024"
					/>
				</Field>
				<Field>
					Header copy (optional)
					<TextInput
						value={headerCopy}
						onChange={(e) => setHeaderCopy(e.target.value)}
						placeholder="Supporting copy shown alongside the header"
					/>
				</Field>
				<Field>
					Header dotcom path (optional)
					<TextInput
						value={headerDotcomPath}
						onChange={(e) => setHeaderDotcomPath(e.target.value)}
						placeholder="e.g. politics/uk-election-2024"
					/>
				</Field>
			</Section>

			<Section>
				<SectionHeading>Links</SectionHeading>
				{links.map((link, index) => (
					<RepeatableRow key={index}>
						<RowFields>
							<TextInput
								value={link.linkText}
								onChange={(e) =>
									updateLink(index, { linkText: e.target.value })
								}
								placeholder="Link text"
							/>
							<TextInput
								value={link.dotcomPath}
								onChange={(e) =>
									updateLink(index, { dotcomPath: e.target.value })
								}
								placeholder="Dotcom path"
							/>
						</RowFields>
						<ButtonDefault
							type="button"
							size="s"
							priority="muted"
							onClick={() => removeLink(index)}
							disabled={links.length === 1}
						>
							Remove
						</ButtonDefault>
					</RepeatableRow>
				))}
				<ButtonDefault type="button" size="s" onClick={addLink}>
					+ Add link
				</ButtonDefault>
			</Section>

			<Section>
				<SectionHeading>Targeted pages</SectionHeading>
				{pages.map((page, index) => (
					<RepeatableRow key={index}>
						<RowFields>
							<Select
								value={page.type}
								onChange={(e) =>
									updatePage(index, {
										type: e.target.value as TargetedPageType,
									})
								}
							>
								{pageTypeOptions.map((option) => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</Select>
							<TextInput
								value={page.path}
								onChange={(e) => updatePage(index, { path: e.target.value })}
								placeholder="Path (e.g. politics/uk-election-2024)"
							/>
						</RowFields>
						<ButtonDefault
							type="button"
							size="s"
							priority="muted"
							onClick={() => removePage(index)}
							disabled={pages.length === 1}
						>
							Remove
						</ButtonDefault>
					</RepeatableRow>
				))}
				<ButtonDefault type="button" size="s" onClick={addPage}>
					+ Add page
				</ButtonDefault>
			</Section>

			{error && <ErrorMessage>{error}</ErrorMessage>}

			{isDirty ? (
				<FormActions>
					<ButtonDefault type="submit" priority="primary" disabled={saving}>
						{saving ? 'Saving…' : 'Save draft'}
					</ButtonDefault>
					<ButtonDefault type="button" onClick={handleCancel} disabled={saving}>
						Cancel
					</ButtonDefault>
				</FormActions>
			) : (
				justSaved && <SavedMessage>Changes saved</SavedMessage>
			)}
		</Form>
	);
};

export default SubnavForm;
