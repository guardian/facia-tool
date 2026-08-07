import React, { useState } from 'react';
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
	Section,
	SectionHeading,
	Select,
	TextInput,
} from './styles';

interface SubnavFormProps {
	initialSubnav?: CustomSubnav;
	onSave: (subnav: CustomSubnav) => Promise<void> | void;
	onCancel: () => void;
	saving?: boolean;
}

const pageTypeOptions: { value: TargetedPageType; label: string }[] = [
	{ value: 'front', label: 'Front' },
	{ value: 'article', label: 'Article' },
	{ value: 'hasTag', label: 'Tag' },
];

const emptyLink = (): SubnavLink => ({ linkText: '', dotcomPath: '' });
const emptyPage = (): TargetedPage => ({ type: 'front', path: '' });

const SubnavForm = ({
	initialSubnav,
	onSave,
	onCancel,
	saving = false,
}: SubnavFormProps) => {
	const [headerText, setHeaderText] = useState(
		initialSubnav?.header.headerText ?? '',
	);
	const [headerDotcomPath, setHeaderDotcomPath] = useState(
		initialSubnav?.header.dotcomPath ?? '',
	);
	const [headerCopy, setHeaderCopy] = useState(
		initialSubnav?.header.copy ?? '',
	);
	const [links, setLinks] = useState<SubnavLink[]>(
		initialSubnav?.links.length ? initialSubnav.links : [emptyLink()],
	);
	const [pages, setPages] = useState<TargetedPage[]>(
		initialSubnav?.pages.length ? initialSubnav.pages : [emptyPage()],
	);
	const [error, setError] = useState<string | null>(null);

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

		await onSave(subnav);
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

			<FormActions>
				<ButtonDefault type="submit" priority="primary" disabled={saving}>
					{saving ? 'Saving…' : 'Save draft'}
				</ButtonDefault>
				<ButtonDefault type="button" onClick={onCancel} disabled={saving}>
					Cancel
				</ButtonDefault>
			</FormActions>
		</Form>
	);
};

export default SubnavForm;
