import React from 'react';
import { act } from 'react-dom/test-utils';
import { cleanup, fireEvent, render } from 'react-testing-library';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { ThemeProvider } from 'styled-components';
import { theme } from 'constants/theme';
import SubnavForm from '../SubnavForm';
import { CustomSubnav, CustomSubnavHeader } from '../types';

// Stand ships untransformed ESM. These adapters keep its value/selection/press
// contracts while letting the tests interact with native, labelled controls.
type InputProps = {
	label?: string;
	'aria-label'?: string;
	value: string;
	onChange: (value: string) => void;
	isRequired?: boolean;
};

jest.mock('@guardian/stand/TextInput', () => ({
	TextInput: (props: InputProps) => (
		<label>
			{props.label}
			<input
				aria-label={props['aria-label'] || props.label}
				value={props.value}
				required={props.isRequired}
				onChange={(event) => props.onChange(event.target.value)}
			/>
		</label>
	),
}));
jest.mock('@guardian/stand/TextArea', () => ({
	TextArea: (props: InputProps) => (
		<label>
			{props.label}
			<textarea
				aria-label={props.label}
				value={props.value}
				onChange={(event) => props.onChange(event.target.value)}
			/>
		</label>
	),
}));
jest.mock('@guardian/stand/Button', () => ({
	Button: (props: {
		children: React.ReactNode;
		onPress: () => void;
		isDisabled?: boolean;
		'aria-label'?: string;
		variant?: string;
	}) => (
		<button
			aria-label={props['aria-label']}
			disabled={props.isDisabled}
			data-variant={props.variant}
			onClick={props.onPress}
		>
			{props.children}
		</button>
	),
}));
jest.mock('@guardian/stand/ToggleSwitch', () => ({
	ToggleSwitch: (props: {
		isSelected: boolean;
		onChange: (selected: boolean) => void;
	}) => (
		<input
			type="checkbox"
			aria-label="Show header text"
			checked={props.isSelected}
			onChange={(event) => props.onChange(event.target.checked)}
		/>
	),
}));
jest.mock('@guardian/stand/Select', () => ({
	Select: (props: {
		children: React.ReactNode;
		selectedKey: string;
		onSelectionChange: (key: string) => void;
		'aria-label': string;
	}) => (
		<select
			aria-label={props['aria-label']}
			value={props.selectedKey}
			onChange={(event) => props.onSelectionChange(event.target.value)}
		>
			{props.children}
		</select>
	),
	Option: (props: { id: string; children: React.ReactNode }) => (
		<option value={props.id}>{props.children}</option>
	),
}));
jest.mock('@guardian/stand/Grid', () => ({
	Grid: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	Item: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
jest.mock('@guardian/stand/Typography', () => ({
	Typography: ({ children }: { children: React.ReactNode }) => (
		<p>{children}</p>
	),
}));
jest.mock('@guardian/stand/SidebarStepperNavigation', () => ({
	SidebarStepperNavigation: (props: {
		currentStepId: string;
		onPress: (id: string) => void;
		stepNavConfig: {
			steps: { id: string; label: string; stepStatus: string }[];
		};
	}) => (
		<nav aria-label="Steps">
			{props.stepNavConfig.steps.map((step) => (
				<button
					key={step.id}
					aria-label={`Step: ${step.label}`}
					aria-current={props.currentStepId === step.id ? 'step' : undefined}
					data-status={step.stepStatus}
					onClick={() => props.onPress(step.id)}
				>
					{step.label}
				</button>
			))}
		</nav>
	),
}));

// Exercise the DnD callback contract without testing the library's geometry.
jest.mock('react-beautiful-dnd', () => ({
	DragDropContext: (props: {
		children: React.ReactNode;
		onDragEnd: (result: {
			source: { index: number };
			destination: { index: number } | null;
		}) => void;
	}) => (
		<div>
			{props.children}
			<button
				onClick={() =>
					props.onDragEnd({ source: { index: 0 }, destination: { index: 1 } })
				}
			>
				Move first nav item down
			</button>
			<button
				onClick={() =>
					props.onDragEnd({ source: { index: 0 }, destination: null })
				}
			>
				Cancel nav item drag
			</button>
		</div>
	),
	Droppable: (props: {
		children: (provided: {
			innerRef: () => void;
			droppableProps: object;
			placeholder: null;
		}) => React.ReactNode;
	}) =>
		props.children({
			innerRef: () => {},
			droppableProps: {},
			placeholder: null,
		}),
	Draggable: (props: {
		children: (provided: {
			innerRef: () => void;
			draggableProps: object;
			dragHandleProps: object;
		}) => React.ReactNode;
	}) =>
		props.children({
			innerRef: () => {},
			draggableProps: {},
			dragHandleProps: {},
		}),
}));

const loadedSubnav = (): CustomSubnav => ({
	id: 'existing-subnav',
	header: {
		headerText: 'Election',
		showHeaderText: true,
		dotcomPath: 'politics/election',
		copy: 'Election coverage',
	},
	format: 'compact',
	links: [{ linkText: 'Results', dotcomPath: 'politics/results' }],
	pages: [{ type: 'front', path: '/politics' }],
	palette: { light: { text: '#121212' }, dark: { header: '#ffffff' } },
	lastUpdated: 1,
	updatedBy: 'Editor',
	updatedEmail: 'editor@example.com',
});

type FormProps = React.ComponentProps<typeof SubnavForm>;
const setup = (
	props: Partial<FormProps> = {},
	env: 'code' | 'prod' = 'prod',
) => {
	const onSaveDraft = jest
		.fn<Promise<void>, [CustomSubnav]>()
		.mockResolvedValue();
	const onPublish = jest.fn<Promise<void>, [string]>().mockResolvedValue();
	const defaults: FormProps = {
		initialSubnav: loadedSubnav(),
		hasDraft: true,
		saving: false,
		onSaveDraft,
		onPublish,
		...props,
	};
	const store = createStore(() => ({ config: { env } }));
	const tree = (updates: Partial<FormProps> = {}) => (
		<Provider store={store}>
			<ThemeProvider theme={theme}>
				<SubnavForm {...defaults} {...updates} />
			</ThemeProvider>
		</Provider>
	);
	const result = render(tree());
	return {
		...result,
		onSaveDraft,
		onPublish,
		rerenderForm: (updates: Partial<FormProps>) =>
			result.rerender(tree(updates)),
		save: () => result.getByText('Save draft'),
		publish: () => result.getByText('Publish subnav'),
		change: (label: string, value: string) =>
			fireEvent.change(result.getByLabelText(label), { target: { value } }),
	};
};

const clickAsync = async (element: HTMLElement) => {
	await act(async () => {
		fireEvent.click(element);
	});
};

const originalResizeObserver = global.ResizeObserver;
const originalIntersectionObserver = global.IntersectionObserver;
const originalScrollIntoView = HTMLElement.prototype.scrollIntoView;
let intersectionCallback: IntersectionObserverCallback;
const scrollIntoView = jest.fn();

beforeAll(() => {
	global.ResizeObserver = class {
		observe() {}
		unobserve() {}
		disconnect() {}
	} as typeof ResizeObserver;
	global.IntersectionObserver = class {
		readonly root = null;
		readonly rootMargin = '';
		readonly thresholds = [];
		constructor(callback: IntersectionObserverCallback) {
			intersectionCallback = callback;
		}
		observe() {}
		unobserve() {}
		disconnect() {}
		takeRecords() {
			return [];
		}
	} as typeof IntersectionObserver;
	HTMLElement.prototype.scrollIntoView = scrollIntoView;
});

afterEach(() => {
	cleanup();
	jest.restoreAllMocks();
	jest.useRealTimers();
	scrollIntoView.mockClear();
});

afterAll(() => {
	global.ResizeObserver = originalResizeObserver;
	global.IntersectionObserver = originalIntersectionObserver;
	HTMLElement.prototype.scrollIntoView = originalScrollIntoView;
});

describe('SubnavForm draft state', () => {
	it('loads a clean draft with publishing available and no save required', () => {
		const form = setup();
		expect(form.getByLabelText('Header text')).toHaveValue('Election');
		expect(form.getByLabelText('Show header text')).toBeChecked();
		expect(form.save()).toBeDisabled();
		expect(form.publish()).toBeEnabled();
		expect(
			form.getByText(/Publishing will make this subnav live/),
		).toHaveTextContent('/politics');
	});

	it('does not treat a loaded live-only subnav as a saved draft', async () => {
		const form = setup({ hasDraft: false, hasLive: true });
		expect(form.save()).toBeDisabled();
		expect(form.publish()).toBeDisabled();
		expect(form.queryByText(/Publishing will make/)).toBeNull();
		form.change('Description', 'Updated coverage');
		await clickAsync(form.save());
		expect(form.publish()).toBeEnabled();
	});

	it('requires a header before saving a new, unsaved subnav', () => {
		const form = setup({ initialSubnav: undefined, hasDraft: false });
		expect(form.save()).toBeDisabled();
		expect(form.publish()).toBeDisabled();
		expect(form.getByText('No draft subnav to display')).toBeInTheDocument();
		expect(form.getByLabelText('Refresh preview')).toBeDisabled();
		form.change('Header text', 'New subnav');
		expect(form.save()).toBeEnabled();
		expect(form.publish()).toBeDisabled();
	});

	it.each([
		['Header text', 'New title', 'Election'],
		['Description', 'New description', 'Election coverage'],
		['URL (Dotcom path)', 'new/header', 'politics/election'],
		['Link text', 'Analysis', 'Results'],
		['Dotcom path', 'politics/analysis', 'politics/results'],
		['Path', '/world', '/politics'],
		['Page type', 'article', 'front'],
	])(
		'marks changes to %s dirty and reverting them clean',
		(label, next, original) => {
			const form = setup();
			form.change(label, next);
			expect(form.save()).toBeEnabled();
			expect(form.publish()).toBeDisabled();
			form.change(label, original);
			expect(form.save()).toBeDisabled();
			expect(form.publish()).toBeEnabled();
		},
	);

	it('marks header display changes dirty and restores the loaded false setting', () => {
		const subnav = loadedSubnav();
		subnav.header.showHeaderText = false;
		const form = setup({ initialSubnav: subnav });
		expect(form.getByLabelText('Show header text')).not.toBeChecked();
		expect(form.save()).toBeDisabled();
		fireEvent.click(form.getByLabelText('Show header text'));
		expect(form.save()).toBeEnabled();
		expect(form.publish()).toBeDisabled();
		fireEvent.click(form.getByLabelText('Show header text'));
		expect(form.save()).toBeDisabled();
		expect(form.publish()).toBeEnabled();
	});

	it('ignores the newly generated audit timestamp when checking content', () => {
		jest.spyOn(Date, 'now').mockReturnValue(1000);
		const form = setup();
		jest.spyOn(Date, 'now').mockReturnValue(2000);
		form.change('Description', 'Changed');
		form.change('Description', 'Election coverage');
		expect(form.save()).toBeDisabled();
		expect(form.publish()).toBeEnabled();
		expect(form.onSaveDraft).not.toHaveBeenCalled();
	});

	it('currently considers a legacy missing showHeaderText dirty despite defaulting it to true', async () => {
		const { showHeaderText, ...legacyHeader } = loadedSubnav().header;
		expect(showHeaderText).toBe(true);
		const legacySubnav = {
			...loadedSubnav(),
			// Only the legacy header violates the current required-field type.
			header: legacyHeader as CustomSubnavHeader,
		};
		const form = setup({ initialSubnav: legacySubnav });
		expect(form.getByLabelText('Show header text')).toBeChecked();
		expect(form.save()).toBeEnabled();
		expect(form.publish()).toBeDisabled();
		await clickAsync(form.save());
		expect(form.onSaveDraft.mock.calls[0][0].header.showHeaderText).toBe(true);
		expect(legacySubnav.header).not.toHaveProperty('showHeaderText');
		expect(form.save()).toBeDisabled();
		expect(form.publish()).toBeEnabled();
	});
});

describe('SubnavForm saving and publishing', () => {
	it('saves cleaned content, preserves metadata and uses the latest successful save as its baseline', async () => {
		const now = 123456;
		jest.spyOn(Date, 'now').mockReturnValue(now);
		const initial = loadedSubnav();
		const form = setup({ initialSubnav: initial });
		form.change('Header text', '  Updated title  ');
		form.change('Description', '  Updated description  ');
		form.change('URL (Dotcom path)', '   ');
		form.change('Link text', '  Updated link  ');
		form.change('Dotcom path', '  new/link  ');
		form.change('Path', '  /new/page  ');
		form.change('Page type', 'hasTag');
		fireEvent.click(form.getByLabelText('Show header text'));
		fireEvent.click(form.getByText('Add nav item'));
		fireEvent.click(form.getByText('Add page'));
		await clickAsync(form.save());
		expect(form.onSaveDraft).toHaveBeenCalledWith({
			...initial,
			header: {
				headerText: 'Updated title',
				showHeaderText: false,
				dotcomPath: undefined,
				copy: 'Updated description',
			},
			links: [{ linkText: 'Updated link', dotcomPath: 'new/link' }],
			pages: [{ type: 'hasTag', path: '/new/page' }],
			images: undefined,
			lastUpdated: now,
		});
		expect(form.save()).toBeDisabled();
		expect(form.publish()).toBeEnabled();
		expect(initial.header.headerText).toBe('Election');
		form.change('Header text', 'Election');
		expect(form.save()).toBeEnabled();
		form.change('Header text', 'Updated title');
		expect(form.save()).toBeDisabled();
		form.change('Description', 'Second revision');
		await clickAsync(form.save());
		expect(form.onSaveDraft.mock.calls[1][0].id).toBe(initial.id);
		expect(form.save()).toBeDisabled();
	});

	it('assigns a stable ID and defaults to large format for a new subnav', async () => {
		const form = setup({ initialSubnav: undefined, hasDraft: false });
		form.change('Header text', 'New');
		form.change('Link text', 'News');
		form.change('Path', 'news');
		await clickAsync(form.save());
		const firstSave = form.onSaveDraft.mock.calls[0][0];
		expect(firstSave.id).toEqual(expect.any(String));
		expect(firstSave.id).not.toBe('');
		expect(firstSave.format).toBe('large');
		expect(firstSave.updatedBy).toBe('');
		expect(firstSave.updatedEmail).toBe('');
		expect(firstSave.palette).toBeUndefined();
		expect(form.publish()).toBeEnabled();
		form.change('Description', 'Revision');
		await clickAsync(form.save());
		expect(form.onSaveDraft.mock.calls[1][0].id).toBe(firstSave.id);
		await clickAsync(form.publish());
		expect(form.onPublish).toHaveBeenCalledWith(firstSave.id);
	});

	it('snapshots the submitted content without marking edits made during a save clean', async () => {
		const form = setup();
		let finishSave!: () => void;
		form.onSaveDraft.mockImplementationOnce(
			() =>
				new Promise<void>((resolve) => {
					finishSave = resolve;
				}),
		);
		form.change('Description', 'Submitted description');
		await clickAsync(form.save());
		form.change('Description', 'Edited while saving');
		expect(form.onSaveDraft.mock.calls[0][0].header.copy).toBe(
			'Submitted description',
		);
		await act(async () => {
			finishSave();
		});
		expect(form.getByLabelText('Description')).toHaveValue(
			'Edited while saving',
		);
		expect(form.save()).toBeEnabled();
		expect(form.publish()).toBeDisabled();
		form.change('Description', 'Submitted description');
		expect(form.save()).toBeDisabled();
		expect(form.publish()).toBeEnabled();
	});

	it('does not establish a saved draft or preview after the first save fails', async () => {
		jest.spyOn(console, 'error').mockImplementation(() => {});
		const form = setup({ initialSubnav: undefined, hasDraft: false });
		form.onSaveDraft.mockRejectedValueOnce(new Error('Save failed'));
		form.change('Header text', 'New');
		form.change('Link text', 'News');
		form.change('Path', 'news');
		await clickAsync(form.save());
		expect(form.save()).toBeEnabled();
		expect(form.publish()).toBeDisabled();
		expect(form.getByText('No draft subnav to display')).toBeInTheDocument();
		expect(form.queryByText(/Publishing will make/)).toBeNull();
		expect(form.queryByText(/Draft saved/)).toBeNull();
	});

	it('keeps unsaved edits dirty and publishing unavailable when saving fails', async () => {
		const error = new Error('Save failed');
		const log = jest.spyOn(console, 'error').mockImplementation(() => {});
		const form = setup();
		form.onSaveDraft.mockRejectedValueOnce(error);
		form.change('Path', 'unsaved/page');
		await clickAsync(form.save());
		expect(log).toHaveBeenCalledWith('Failed to save subnav draft', error);
		expect(form.save()).toBeEnabled();
		expect(form.publish()).toBeDisabled();
		expect(form.getByTitle('Subnav preview')).toHaveAttribute(
			'src',
			'https://preview.gutools.co.uk/politics?cacheBust=0',
		);
		expect(form.queryByText(/Draft saved/)).toBeNull();
		await clickAsync(form.save());
		expect(form.publish()).toBeEnabled();
	});

	it.each([false, true])(
		'publishes the loaded ID and leaves the clean draft usable (failure: %s)',
		async (failure) => {
			const log = jest.spyOn(console, 'error').mockImplementation(() => {});
			const form = setup();
			const error = new Error('Publish failed');
			if (failure) form.onPublish.mockRejectedValueOnce(error);
			await clickAsync(form.publish());
			expect(form.onPublish).toHaveBeenCalledWith('existing-subnav');
			expect(form.save()).toBeDisabled();
			expect(form.publish()).toBeEnabled();
			if (failure) {
				expect(log).toHaveBeenCalledWith('Failed to publish subnav', error);
				await clickAsync(form.publish());
				expect(form.onPublish).toHaveBeenCalledTimes(2);
			} else {
				expect(log).not.toHaveBeenCalled();
			}
		},
	);

	it.each(['Link text', 'Path'])(
		'allows an incomplete draft to save but requires %s to publish',
		async (label) => {
			const form = setup();
			form.change(label, '   ');
			expect(form.save()).toBeEnabled();
			await clickAsync(form.save());
			expect(form.save()).toBeDisabled();
			expect(form.publish()).toBeDisabled();
			form.change(label, 'Complete');
			await clickAsync(form.save());
			expect(form.publish()).toBeEnabled();
		},
	);

	it('requires non-whitespace header text even when the header is hidden', () => {
		const subnav = loadedSubnav();
		subnav.header.headerText = '   ';
		subnav.header.showHeaderText = false;
		const form = setup({ initialSubnav: subnav });
		expect(form.getByLabelText('Header text')).toBeRequired();
		expect(form.save()).toBeDisabled();
		expect(form.publish()).toBeDisabled();
		form.change('Header text', 'Hidden title');
		expect(form.save()).toBeEnabled();
	});

	it('requires at least one link label, not a link URL, and one nonempty page path', async () => {
		const form = setup();
		form.change('Dotcom path', '');
		fireEvent.click(form.getByText('Add nav item'));
		fireEvent.click(form.getByText('Add page'));
		await clickAsync(form.save());
		expect(form.publish()).toBeEnabled();
		expect(form.onSaveDraft.mock.calls[0][0].links).toEqual([
			{ linkText: 'Results', dotcomPath: '' },
		]);
	});

	it.each(['saving', 'actionPending'] as const)(
		'disables save, publish and edit actions while %s is true',
		(flag) => {
			const callbacks = {
				onDiscard: jest.fn(),
				onUnpublish: jest.fn(),
				onDelete: jest.fn(),
			};
			const form = setup({ hasLive: true, ...callbacks });
			form.rerenderForm({ [flag]: true });
			const publish = form.getByText(
				flag === 'saving' ? 'Publishing…' : 'Publish subnav',
			);
			expect(publish).toBeDisabled();
			fireEvent.click(publish);
			form.change('Description', 'Changed');
			const save = form.getByText(flag === 'saving' ? 'Saving…' : 'Save draft');
			expect(save).toBeDisabled();
			fireEvent.click(save);
			for (const label of ['Discard changes', 'Take down', 'Delete']) {
				expect(form.getByText(label)).toBeDisabled();
				fireEvent.click(form.getByText(label));
			}
			expect(form.onPublish).not.toHaveBeenCalled();
			expect(form.onSaveDraft).not.toHaveBeenCalled();
			Object.values(callbacks).forEach((callback) =>
				expect(callback).not.toHaveBeenCalled(),
			);
			form.rerenderForm({ [flag]: false });
			expect(form.save()).toBeEnabled();
		},
	);
});

describe('SubnavForm repeatable content', () => {
	it.each([
		['Add nav item', 'Remove nav item', 'Link text'],
		['Add page', 'Remove page', 'Path'],
	])(
		'adds and removes rows with %s, preserving the final row',
		(add, remove, field) => {
			const form = setup();
			expect(form.getByLabelText(remove)).toBeDisabled();
			fireEvent.click(form.getByLabelText(remove));
			expect(form.getAllByLabelText(field)).toHaveLength(1);
			fireEvent.click(form.getByText(add));
			expect(form.getAllByLabelText(field)).toHaveLength(2);
			// Empty rows are not saved content, so adding one is not dirty.
			expect(form.save()).toBeDisabled();
			fireEvent.change(form.getAllByLabelText(field)[1], {
				target: { value: 'Another' },
			});
			expect(form.save()).toBeEnabled();
			fireEvent.click(form.getAllByLabelText(remove)[1]);
			expect(form.getAllByLabelText(field)).toHaveLength(1);
			expect(form.getByLabelText(remove)).toBeDisabled();
			expect(form.save()).toBeDisabled();
		},
	);

	it('reorders nav items, ignores a cancelled drop and saves the displayed order', async () => {
		const subnav = loadedSubnav();
		subnav.links.push({ linkText: 'Analysis', dotcomPath: 'analysis' });
		const form = setup({ initialSubnav: subnav });
		fireEvent.click(form.getByText('Cancel nav item drag'));
		expect(form.save()).toBeDisabled();
		fireEvent.click(form.getByText('Move first nav item down'));
		expect(form.getAllByLabelText('Link text')[0]).toHaveValue('Analysis');
		expect(form.save()).toBeEnabled();
		fireEvent.click(form.getByText('Cancel nav item drag'));
		expect(form.getAllByLabelText('Link text')[0]).toHaveValue('Analysis');
		await clickAsync(form.save());
		expect(form.onSaveDraft.mock.calls[0][0].links).toEqual([
			subnav.links[1],
			subnav.links[0],
		]);
		expect(form.save()).toBeDisabled();
		fireEvent.click(form.getByText('Move first nav item down'));
		expect(form.save()).toBeEnabled();
	});

	it('updates and reverts an existing image through the real image section', () => {
		const subnav = loadedSubnav();
		subnav.images = [
			{
				imageSrc: 'https://example.com/original.jpg',
				breakpoint: 'mobileMedium',
				platforms: ['web', 'android'],
			},
		];
		const form = setup({ initialSubnav: subnav });
		const label = 'Web & Android 375 x 210 image URL';
		expect(form.getByAltText('Web & Android 375 x 210')).toHaveAttribute(
			'src',
			'https://example.com/original.jpg',
		);
		form.change(label, 'https://example.com/replacement.jpg');
		expect(form.save()).toBeEnabled();
		expect(form.publish()).toBeDisabled();
		form.change(label, 'https://example.com/original.jpg');
		expect(form.save()).toBeDisabled();
	});

	it('adds, saves and removes images, including optional additional breakpoints', async () => {
		const form = setup();
		const webLabel = 'Web & Android 375 x 210 image URL';
		form.change(webLabel, '  https://example.com/web.jpg  ');
		fireEvent.click(form.getAllByText('Show additional breakpoints')[1]);
		const iosLabel = 'iOS 320 x 210 image URL';
		form.change(iosLabel, 'https://example.com/ios.jpg');
		expect(form.save()).toBeEnabled();
		await clickAsync(form.save());
		expect(form.onSaveDraft.mock.calls[0][0].images).toEqual([
			{
				imageSrc: 'https://example.com/web.jpg',
				breakpoint: 'mobileMedium',
				platforms: ['web', 'android'],
			},
			{
				imageSrc: 'https://example.com/ios.jpg',
				breakpoint: 'mobile',
				platforms: ['ios'],
			},
		]);
		expect(form.save()).toBeDisabled();
		form.change(webLabel, '');
		form.change(iosLabel, '   ');
		expect(form.save()).toBeEnabled();
		await clickAsync(form.save());
		expect(form.onSaveDraft.mock.calls[1][0].images).toBeUndefined();
		expect(form.save()).toBeDisabled();
		expect(form.getByLabelText('Step: Images')).toHaveAttribute(
			'data-status',
			'optional',
		);
	});
});

describe('SubnavForm edit actions', () => {
	it.each([
		[true, true, true, true, true, true],
		[true, true, false, false, true, true],
		[true, false, true, false, false, true],
		[true, false, false, false, false, true],
		[false, true, true, false, false, false],
	])(
		'only offers applicable actions (edit: %s, live: %s, draft: %s)',
		(edit, hasLive, hasDraft, discard, unpublish, remove) => {
			const callbacks = {
				onDiscard: jest.fn(),
				onUnpublish: jest.fn(),
				onDelete: jest.fn(),
			};
			const form = setup({
				initialSubnav: edit ? loadedSubnav() : undefined,
				hasLive,
				hasDraft,
				...callbacks,
			});
			[
				['Discard changes', discard, callbacks.onDiscard],
				['Take down', unpublish, callbacks.onUnpublish],
				['Delete', remove, callbacks.onDelete],
			].forEach(([label, present, callback]) => {
				const button = form.queryByText(label as string);
				if (present) {
					expect(button).toBeEnabled();
					fireEvent.click(button!);
					expect(callback).toHaveBeenCalledTimes(1);
				} else {
					expect(button).toBeNull();
					expect(callback).not.toHaveBeenCalled();
				}
			});
		},
	);

	it('omits edit actions when their callbacks are not supplied', () => {
		const form = setup({ hasLive: true });
		expect(form.queryByText('Discard changes')).toBeNull();
		expect(form.queryByText('Take down')).toBeNull();
		expect(form.queryByText('Delete')).toBeNull();
	});
});

describe('SubnavForm preview and navigation', () => {
	it.each([
		['code', 'preview.code.dev-gutools.co.uk'],
		['prod', 'preview.gutools.co.uk'],
	] as const)(
		'uses the %s preview origin and saved pages, not unsaved edits',
		async (env, domain) => {
			const subnav = loadedSubnav();
			subnav.pages.push({ type: 'article', path: 'second/page' });
			const form = setup({ initialSubnav: subnav }, env);
			const frame = form.getByTitle('Subnav preview');
			expect(frame).toHaveAttribute(
				'src',
				`https://${domain}/politics?cacheBust=0`,
			);
			form.change('Path', 'new/page');
			expect(frame).toHaveAttribute(
				'src',
				`https://${domain}/politics?cacheBust=0`,
			);
			expect(form.getByText(/Publishing will make/)).toHaveTextContent(
				'/politics, second/page',
			);
			await clickAsync(form.save());
			expect(form.getByTitle('Subnav preview')).toHaveAttribute(
				'src',
				`https://${domain}/new/page?cacheBust=0`,
			);
			expect(form.getByText(/Publishing will make/)).toHaveTextContent(
				'new/page, second/page',
			);
		},
	);

	it('keeps the preview unavailable after saving a draft without assigned pages', async () => {
		const form = setup({ initialSubnav: undefined, hasDraft: false });
		form.change('Header text', 'Unassigned');
		await clickAsync(form.save());
		expect(form.getByText('No draft subnav to display')).toBeInTheDocument();
		expect(form.getByLabelText('Refresh preview')).toBeDisabled();
		expect(form.publish()).toBeDisabled();
	});

	it('counts down after saving, then reloads the preview exactly once', async () => {
		jest.useFakeTimers();
		const form = setup();
		form.change('Description', 'Updated');
		await clickAsync(form.save());
		expect(form.getByText(/refreshing in 60s/)).toBeInTheDocument();
		for (let second = 0; second < 59; second++) {
			await act(async () => {
				// React 16's passive-effect scheduler also needs its 1ms task.
				await jest.advanceTimersByTimeAsync(1001);
			});
			expect(form.getByText(/refreshing in/)).toHaveTextContent(
				`refreshing in ${59 - second}s.`,
			);
		}
		expect(form.getByText(/refreshing in/)).toHaveTextContent(
			'refreshing in 1s.',
		);
		await act(async () => {
			await jest.advanceTimersByTimeAsync(1001);
		});
		expect(form.queryByText(/Draft saved/)).toBeNull();
		expect(form.getByTitle('Subnav preview')).toHaveAttribute(
			'src',
			'https://preview.gutools.co.uk/politics?cacheBust=1',
		);
		await act(async () => {
			await jest.advanceTimersByTimeAsync(60000);
		});
		expect(form.getByTitle('Subnav preview')).toHaveAttribute(
			'src',
			'https://preview.gutools.co.uk/politics?cacheBust=1',
		);
	});

	it('manually refreshes the preview and cancels the propagation countdown', async () => {
		jest.useFakeTimers();
		const form = setup();
		form.change('Description', 'Updated');
		await clickAsync(form.save());
		fireEvent.click(form.getByLabelText('Refresh preview'));
		expect(form.queryByText(/Draft saved/)).toBeNull();
		await act(async () => {
			await jest.advanceTimersByTimeAsync(60000);
		});
		expect(form.getByTitle('Subnav preview')).toHaveAttribute(
			'src',
			'https://preview.gutools.co.uk/politics?cacheBust=1',
		);
	});

	it.each([
		['Mobile', '375px'],
		['Tablet', '740px'],
		['Desktop', '1300px'],
	])('switches to the %s preview width', (label, width) => {
		const form = setup();
		fireEvent.click(form.getByLabelText('Mobile'));
		fireEvent.click(form.getByLabelText(label));
		expect(form.getByTitle('Subnav preview')).toHaveStyle(`width: ${width}`);
		expect(form.getByLabelText(label)).toHaveAttribute(
			'data-variant',
			'primary',
		);
	});

	it('navigates to sidebar sections and tracks focused and visible sections', () => {
		const form = setup();
		fireEvent.click(form.getByLabelText('Step: Images'));
		expect(scrollIntoView).toHaveBeenCalledWith({
			behavior: 'smooth',
			block: 'start',
		});
		expect(form.getByLabelText('Step: Images')).toHaveAttribute(
			'aria-current',
			'step',
		);
		fireEvent.focus(form.getByLabelText('Path'));
		expect(form.getByLabelText('Step: Assign to pages')).toHaveAttribute(
			'aria-current',
			'step',
		);
		const header = form.container.querySelector('[data-step-id="header"]')!;
		act(() => {
			intersectionCallback(
				[
					{
						isIntersecting: true,
						target: header,
						boundingClientRect: { top: 0 },
					} as IntersectionObserverEntry,
				],
				{} as IntersectionObserver,
			);
		});
		expect(form.getByLabelText('Step: Header')).toHaveAttribute(
			'aria-current',
			'step',
		);
		expect(form.getByLabelText('Step: Header')).toHaveAttribute(
			'data-status',
			'complete',
		);
		form.change('Header text', '');
		expect(form.getByLabelText('Step: Header')).toHaveAttribute(
			'data-status',
			'incomplete',
		);
	});
});
