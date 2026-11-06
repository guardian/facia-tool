import React from 'react';
import cloneDeep from 'lodash/cloneDeep';
import 'jest-styled-components';
import { Provider } from 'react-redux';
import { fireEvent, render, cleanup, wait } from 'react-testing-library';
import { isPristine } from 'redux-form';
import { ThemeProvider } from 'styled-components';
import { theme } from 'constants/theme';
import configureStore from 'util/configureStore';
import { state as initialState } from 'fixtures/initialState';
import { CardMeta, Test, VariantMeta } from 'types/Collection';
import { State } from 'types/State';
import ArticleMetaForm from '../ArticleMetaForm';
import { FUTURE, makeTest } from '../../../fixtures/abTests';
import { error } from '../../../styleConstants';
import fetchMock from 'fetch-mock';

const variantMeta: VariantMeta[] = [
	{ id: 'A', meta: { headline: 'Headline A variant' } },
	{ id: 'B', meta: { headline: 'Headline B variant' } },
];

afterEach(cleanup);

const cardId = 'exampleId';

const getStateWithTestOnExampleCard = (test: Test): State => ({
	...initialState,
	cards: {
		...initialState.cards,
		[cardId]: {
			...initialState.cards[cardId],
			tests: [test],
		},
	},
});

const renderForm = (state: State, onSave = jest.fn()) => {
	const store = configureStore(state);
	return {
		store,
		...render(
			<Provider store={store}>
				<ThemeProvider theme={theme}>
					<ArticleMetaForm
						cardId={cardId}
						form={cardId}
						frontId="us"
						onSave={onSave}
						onCancel={jest.fn()}
					/>
				</ThemeProvider>
			</Provider>,
		),
	};
};

describe('ArticleMetaForm - mini nav', () => {
	const subnavId = '6d4a8d7a-1048-4a55-87f3-ee6399e36d34';
	const miniNavUrl = `${window.location.origin}/v2/subnavs/${subnavId}`;
	const resolveEndpoint = `/custom-subnav/${subnavId}/resolve`;
	afterEach(() => fetchMock.restore());
	const miniNavWarning =
		'Not implemented: you can save this url but the mini nav will not yet show';
	const getMiniNavState = (
		meta: CardMeta = {},
		collectionType = 'flexible/general',
	): State => {
		const state = cloneDeep(initialState);
		const collectionId = 'e59785e9-ba82-48d8-b79a-0a80b2f9f808';
		state.groups.group123.cards = [cardId];
		state.collections.data[collectionId].id = collectionId;
		state.fronts.frontsConfig.data.collections[collectionId].type =
			collectionType;
		state.cards[cardId].meta = { ...state.cards[cardId].meta, ...meta };
		state.featureSwitches['mini-nav'] = {
			key: 'mini-nav',
			title: 'Mini nav',
			enabled: true,
		};
		return state;
	};

	it('hides mini nav controls when the feature switch is disabled without clearing saved settings', () => {
		const savedSettings = {
			showMiniNav: true,
			miniNavUrl: 'https://www.theguardian.com/custom-nav',
		};
		const state = getMiniNavState(savedSettings);

		state.featureSwitches['mini-nav'].enabled = false;

		const { queryByLabelText, queryByText, store } = renderForm(state);

		expect(queryByLabelText('Enable mini nav')).toBeNull();
		expect(queryByLabelText('Custom nav URL')).toBeNull();
		expect(queryByText(miniNavWarning)).toBeNull();
		expect(store.getState().cards[cardId].meta).toMatchObject(savedSettings);
	});

	it('is off by default and reveals an empty text input when enabled', () => {
		const { getByLabelText, queryByLabelText } = renderForm(getMiniNavState());
		const toggle = getByLabelText('Enable mini nav') as HTMLInputElement;
		expect(toggle.checked).toBe(false);
		expect(queryByLabelText('Custom nav URL')).toBeNull();

		fireEvent.click(toggle);

		const input = getByLabelText('Custom nav URL') as HTMLInputElement;
		expect(input.value).toBe('');
		expect(input.type).toBe('text');
	});

	it('shows an associated validation error instead of the placeholder warning', async () => {
		const { getByLabelText, getByText, getByRole, queryByText } = renderForm(
			getMiniNavState({ showMiniNav: true }),
		);
		const input = getByLabelText('Custom nav URL');
		expect(queryByText(miniNavWarning)).toBeNull();

		fireEvent.change(input, { target: { value: 'not a valid URL' } });
		await wait(() =>
			expect(getByText('Enter a valid custom subnav URL')).toBeTruthy(),
		);

		const warning = getByText('Enter a valid custom subnav URL');
		expect(warning).toHaveStyleRule('color', error.primary);
		const warningContainer = getByRole('alert');
		expect(input.getAttribute('aria-describedby')).toContain(
			warningContainer.id,
		);
		expect(input.getAttribute('aria-invalid')).toBe('true');
		expect(queryByText(miniNavWarning)).toBeNull();

		fireEvent.change(input, { target: { value: '' } });

		expect(queryByText(miniNavWarning)).toBeNull();
		expect(queryByText('Enter a valid custom subnav URL')).toBeNull();
		expect(getByText('Enter a custom subnav URL.')).toBeTruthy();
	});

	it('retains the URL when disabled and restores it when re-enabled', () => {
		const { getByLabelText, queryByLabelText, queryByText } =
			renderForm(getMiniNavState());
		const toggle = getByLabelText('Enable mini nav');
		fireEvent.click(toggle);
		fireEvent.change(getByLabelText('Custom nav URL'), {
			target: { value: 'https://www.theguardian.com/custom-nav' },
		});

		fireEvent.click(toggle);
		expect(queryByLabelText('Custom nav URL')).toBeNull();
		expect(queryByText(miniNavWarning)).toBeNull();

		fireEvent.click(toggle);
		expect((getByLabelText('Custom nav URL') as HTMLInputElement).value).toBe(
			'https://www.theguardian.com/custom-nav',
		);
	});

	it('blocks saving entered text that does not resolve', async () => {
		const onSave = jest.fn();
		const { getByLabelText, getByTestId, getByText } = renderForm(
			getMiniNavState(),
			onSave,
		);
		fireEvent.click(getByLabelText('Enable mini nav'));
		fireEvent.change(getByLabelText('Custom nav URL'), {
			target: { value: 'not a valid URL' },
		});

		fireEvent.click(getByTestId('edit-form-save-button'));

		await wait(() =>
			expect(getByText('Enter a valid custom subnav URL')).toBeTruthy(),
		);
		expect(onSave).not.toHaveBeenCalled();
	});

	it('requires a URL when mini nav is enabled', () => {
		const onSave = jest.fn();
		const { getByLabelText, getByText, getByTestId } = renderForm(
			getMiniNavState(),
			onSave,
		);
		fireEvent.click(getByLabelText('Enable mini nav'));
		expect(getByText('Enter a custom subnav URL.')).toBeTruthy();
		expect(getByTestId('edit-form-save-button').hasAttribute('disabled')).toBe(
			true,
		);
		expect(onSave).not.toHaveBeenCalled();
	});

	it('blocks saving until resolution finishes, then saves without another lookup', async () => {
		fetchMock.get(resolveEndpoint, { id: subnavId, title: 'Published title' });
		const onSave = jest.fn();
		const { getByLabelText, getByTestId } = renderForm(
			getMiniNavState(),
			onSave,
		);
		fireEvent.click(getByLabelText('Enable mini nav'));
		fireEvent.change(getByLabelText('Custom nav URL'), {
			target: { value: miniNavUrl },
		});
		const save = getByTestId('edit-form-save-button');
		expect(save.hasAttribute('disabled')).toBe(true);
		fireEvent.click(save);
		expect(onSave).not.toHaveBeenCalled();
		await wait(() => expect(save.hasAttribute('disabled')).toBe(false));
		expect(fetchMock.calls(resolveEndpoint)).toHaveLength(1);
		fireEvent.click(save);
		await wait(() =>
			expect(onSave).toHaveBeenCalledWith(
				expect.objectContaining({ showMiniNav: true, miniNavUrl }),
				undefined,
			),
		);
		expect(fetchMock.calls(resolveEndpoint)).toHaveLength(1);
	});

	it('clears the resolved title immediately when the URL is changed or cleared', async () => {
		fetchMock.get(resolveEndpoint, { id: subnavId, title: 'Published title' });
		const { getByLabelText, getByText, queryByText } = renderForm(
			getMiniNavState({ showMiniNav: true, miniNavUrl }),
		);
		await wait(() => expect(getByText('Published title')).toBeTruthy());
		const input = getByLabelText('Custom nav URL');
		fireEvent.change(input, { target: { value: 'invalid' } });
		expect(queryByText('Published title')).toBeNull();
		expect(getByText('Resolving custom subnav...')).toHaveStyleRule(
			'color',
			theme.colors.greyMedium,
		);
		expect(getByText('Resolving custom subnav...')).toHaveStyleRule(
			'text-align',
			'left',
		);
		await wait(() =>
			expect(getByText('Enter a valid custom subnav URL')).toBeTruthy(),
		);
		fireEvent.change(input, { target: { value: miniNavUrl } });
		await wait(() => expect(getByText('Published title')).toBeTruthy());
		fireEvent.change(input, { target: { value: '' } });
		expect(queryByText('Published title')).toBeNull();
		expect(getByText('Enter a custom subnav URL.')).toBeTruthy();
	});

	it.each([404, 409, 500])(
		'shows an associated lookup failure (%s)',
		async (status) => {
			fetchMock.get(resolveEndpoint, { status });
			const { getByRole, getByLabelText, queryByText } = renderForm(
				getMiniNavState({ showMiniNav: true, miniNavUrl }),
			);
			await wait(() => expect(getByRole('alert')).toBeTruthy());
			const alert = getByRole('alert');
			expect(alert).toHaveStyleRule('text-align', 'right');
			expect(alert.textContent).toContain(
				status === 404
					? 'This subnav does not exist'
					: status === 409
						? 'Custom subnav is not published, and so cannot be linked'
						: 'Could not resolve the custom subnav:',
			);
			expect(alert).toHaveStyleRule('color', error.primary);
			expect(
				getByLabelText('Custom nav URL').getAttribute('aria-describedby'),
			).toBe(alert.id);
			expect(queryByText(miniNavWarning)).toBeNull();
		},
	);

	it('ignores a slower resolution after the URL changes', async () => {
		let finishFirst: (body: { id: string; title: string }) => void = () => {};
		const firstResponse = new Promise<{ id: string; title: string }>(
			(resolve) => {
				finishFirst = resolve;
			},
		);
		fetchMock.get(resolveEndpoint, () => firstResponse);
		const { getByLabelText, getByText, getByTestId } =
			renderForm(getMiniNavState());
		fireEvent.click(getByLabelText('Enable mini nav'));
		const input = getByLabelText('Custom nav URL');
		fireEvent.change(input, { target: { value: miniNavUrl } });
		await wait(() => expect(fetchMock.calls(resolveEndpoint)).toHaveLength(1));
		fireEvent.change(input, { target: { value: 'invalid' } });
		finishFirst({ id: subnavId, title: 'Old subnav' });
		await wait(() =>
			expect(getByText('Enter a valid custom subnav URL')).toBeTruthy(),
		);
		expect(getByTestId('edit-form-save-button').hasAttribute('disabled')).toBe(
			true,
		);
	});

	it('blocks saving a changed URL until its own resolution succeeds', async () => {
		const nextId = 'c301e7f2-7f28-4f40-8a4c-ebd145d62201';
		const nextUrl = `${window.location.origin}/v2/subnavs/${nextId}`;
		const nextEndpoint = `/custom-subnav/${nextId}/resolve`;
		let finishLookup: (body: { id: string; title: string }) => void = () => {};
		const nextResponse = new Promise<{ id: string; title: string }>(
			(resolve) => {
				finishLookup = resolve;
			},
		);
		fetchMock.get(resolveEndpoint, { id: subnavId, title: 'Published' });
		fetchMock.get(nextEndpoint, () => nextResponse);
		const onSave = jest.fn();
		const { getByLabelText, getByTestId } = renderForm(
			getMiniNavState(),
			onSave,
		);
		fireEvent.click(getByLabelText('Enable mini nav'));
		fireEvent.change(getByLabelText('Custom nav URL'), {
			target: { value: miniNavUrl },
		});
		const save = getByTestId('edit-form-save-button');
		await wait(() => expect(save.hasAttribute('disabled')).toBe(false));
		fireEvent.change(getByLabelText('Custom nav URL'), {
			target: { value: nextUrl },
		});
		expect(save.hasAttribute('disabled')).toBe(true);
		fireEvent.click(save);
		expect(onSave).not.toHaveBeenCalled();
		await wait(() => expect(fetchMock.calls(nextEndpoint)).toHaveLength(1));
		expect(save.hasAttribute('disabled')).toBe(true);
		fireEvent.click(save);
		expect(onSave).not.toHaveBeenCalled();
		finishLookup({ id: nextId, title: 'Next subnav' });
		await wait(() => expect(save.hasAttribute('disabled')).toBe(false));
		fireEvent.click(save);
		expect(onSave).toHaveBeenCalledWith(
			expect.objectContaining({ showMiniNav: true, miniNavUrl: nextUrl }),
			undefined,
		);
		expect(fetchMock.calls(resolveEndpoint)).toHaveLength(1);
		expect(fetchMock.calls(nextEndpoint)).toHaveLength(1);
	});

	it('allows saving with an invalid retained URL when disabled', () => {
		const onSave = jest.fn();
		const { getByLabelText, getByTestId } = renderForm(
			getMiniNavState({ showMiniNav: true, miniNavUrl: 'invalid' }),
			onSave,
		);
		fireEvent.click(getByLabelText('Enable mini nav'));
		fireEvent.click(getByTestId('edit-form-save-button'));
		expect(onSave).toHaveBeenCalledWith(
			expect.objectContaining({ showMiniNav: false, miniNavUrl: 'invalid' }),
			undefined,
		);
		expect(fetchMock.calls()).toHaveLength(0);
	});

	it.each([404, 409, 500])(
		'can disable mini nav and save after a resolution error (%s)',
		async (status) => {
			fetchMock.get(resolveEndpoint, { status });
			const onSave = jest.fn();
			const { getByLabelText, getByRole, getByTestId, queryByRole } =
				renderForm(getMiniNavState({ showMiniNav: true, miniNavUrl }), onSave);
			await wait(() => expect(getByRole('alert')).toBeTruthy());
			fireEvent.click(getByLabelText('Enable mini nav'));
			expect(queryByRole('alert')).toBeNull();
			fireEvent.click(getByTestId('edit-form-save-button'));
			expect(onSave).toHaveBeenCalledWith(
				expect.objectContaining({ showMiniNav: false, miniNavUrl }),
				undefined,
			);
			expect(fetchMock.calls(resolveEndpoint)).toHaveLength(1);
		},
	);

	it('ignores a pending lookup after disabling and resolves again when re-enabled', async () => {
		let finishLookup: (body: { id: string; title: string }) => void = () => {};
		const pending = new Promise<{ id: string; title: string }>((resolve) => {
			finishLookup = resolve;
		});
		fetchMock.getOnce(resolveEndpoint, () => pending);
		const onSave = jest.fn();
		const { getByLabelText, getByTestId, getByText, queryByText } = renderForm(
			getMiniNavState({ showMiniNav: true, miniNavUrl }),
			onSave,
		);
		await wait(() => expect(fetchMock.calls(resolveEndpoint)).toHaveLength(1));
		fireEvent.click(getByLabelText('Enable mini nav'));
		fireEvent.click(getByTestId('edit-form-save-button'));
		expect(onSave).toHaveBeenCalledWith(
			expect.objectContaining({ showMiniNav: false, miniNavUrl }),
			undefined,
		);
		finishLookup({ id: subnavId, title: 'Old title' });
		await fetchMock.flush();
		expect(queryByText('Old title')).toBeNull();
		fetchMock.getOnce(
			resolveEndpoint,
			{ id: subnavId, title: 'Current title' },
			{ overwriteRoutes: true },
		);
		fireEvent.click(getByLabelText('Enable mini nav'));
		expect((getByLabelText('Custom nav URL') as HTMLInputElement).value).toBe(
			miniNavUrl,
		);
		expect(getByTestId('edit-form-save-button').hasAttribute('disabled')).toBe(
			true,
		);
		await wait(() => expect(getByText('Current title')).toBeTruthy());
		expect(queryByText('Old title')).toBeNull();
	});

	it.each(['feature switch disabled', 'unsupported container'])(
		'preserves hidden settings and allows unrelated edits with %s',
		(hiddenBy) => {
			const savedSettings = { showMiniNav: true, miniNavUrl: 'invalid' };
			const state = getMiniNavState(
				savedSettings,
				hiddenBy === 'unsupported container'
					? 'scrollable/highlights'
					: 'flexible/general',
			);
			if (hiddenBy === 'feature switch disabled') {
				state.featureSwitches['mini-nav'].enabled = false;
			}
			const onSave = jest.fn();
			const { getByLabelText, getByTestId, queryByLabelText } = renderForm(
				state,
				onSave,
			);
			expect(queryByLabelText('Enable mini nav')).toBeNull();
			fireEvent.click(getByLabelText('Quote headline'));
			fireEvent.click(getByTestId('edit-form-save-button'));
			expect(onSave).toHaveBeenCalledWith(
				expect.objectContaining({ ...savedSettings, showQuotedHeadline: true }),
				undefined,
			);
			expect(fetchMock.calls()).toHaveLength(0);
		},
	);

	it('restores enabled settings and displays the resolved title when opened', async () => {
		fetchMock.get(resolveEndpoint, { id: subnavId, title: 'Published title' });
		const { getByLabelText, getByText, queryByText } = renderForm(
			getMiniNavState({
				showMiniNav: true,
				miniNavUrl,
			}),
		);
		expect(
			(getByLabelText('Enable mini nav') as HTMLInputElement).checked,
		).toBe(true);
		expect((getByLabelText('Custom nav URL') as HTMLInputElement).value).toBe(
			miniNavUrl,
		);
		await wait(() => expect(getByText('Published title')).toBeTruthy());
		const title = getByText('Published title');
		expect(title).toHaveStyleRule('color', theme.colors.greyMedium);
		expect(title).toHaveStyleRule('font-size', '12px');
		expect(title).toHaveStyleRule('text-align', 'left');
		expect(
			getByLabelText('Custom nav URL').getAttribute('aria-describedby'),
		).toBe(title.id);
		expect(queryByText(miniNavWarning)).toBeNull();
	});

	it('hides both controls and the warning in unsupported containers even with existing settings', () => {
		const { queryByLabelText, queryByText } = renderForm(
			getMiniNavState(
				{
					showMiniNav: true,
					miniNavUrl: 'https://www.theguardian.com/custom-nav',
				},
				'scrollable/highlights',
			),
		);
		expect(queryByLabelText('Enable mini nav')).toBeNull();
		expect(queryByLabelText('Custom nav URL')).toBeNull();
		expect(queryByText(miniNavWarning)).toBeNull();
	});
});

describe('ArticleMetaForm - headline AB testing', () => {
	it('copies the card headline into headlineA when the AB test toggle is switched on', () => {
		const store = configureStore(initialState);

		const { getByTestId } = render(
			<Provider store={store}>
				<ThemeProvider theme={theme}>
					<ArticleMetaForm
						cardId={cardId}
						form={cardId}
						frontId="us"
						onSave={jest.fn()}
						onCancel={jest.fn()}
					/>
				</ThemeProvider>
			</Provider>,
		);

		const abTestToggle = getByTestId(
			'edit-form-ab-test-toggle',
		) as HTMLInputElement;
		expect(abTestToggle.checked).toBe(false);
		// headlineA is an empty string by default, we transform it to undefined later using getStringField
		expect(store.getState().form[cardId]?.values?.headlineA).toBe('');

		fireEvent.click(abTestToggle);

		expect(abTestToggle.checked).toBe(true);
		expect(store.getState().form[cardId]?.values?.headlineA).toBe(
			'Bill Shorten',
		);

		const headlineAField = getByTestId(
			'edit-form-headline-a-field',
		) as HTMLTextAreaElement;
		expect(headlineAField.value).toBe('Bill Shorten');
	});

	it('disables the Headline A & Headline B input when the card has an active launched test', () => {
		const launchedTest = makeTest({
			variantMeta,
			expiryDate: FUTURE,
		});

		const { getByTestId } = renderForm(
			getStateWithTestOnExampleCard(launchedTest),
		);

		const headlineAField = getByTestId(
			'edit-form-headline-a-field',
		) as HTMLTextAreaElement;
		const headlineBField = getByTestId(
			'edit-form-headline-b-field',
		) as HTMLTextAreaElement;

		expect(headlineAField.disabled).toBe(true);
		expect(headlineBField.disabled).toBe(true);
	});

	it('does not disable the Headline A & Headline B input when the card only has a draft test', () => {
		// A draft test has no expiryDate, so it is not considered launched
		const draftTest = makeTest({ variantMeta });

		const { getByTestId } = renderForm(
			getStateWithTestOnExampleCard(draftTest),
		);

		const headlineAField = getByTestId(
			'edit-form-headline-a-field',
		) as HTMLTextAreaElement;
		const headlineBField = getByTestId(
			'edit-form-headline-b-field',
		) as HTMLTextAreaElement;

		expect(headlineAField.disabled).toBe(false);
		expect(headlineBField.disabled).toBe(false);
	});
});

describe('ArticleMetaForm - multimedia slideshow', () => {
	const slideshowUrl =
		'https://content.code.dev-guardianapis.com/atom/multimediaslideshow/slideshow-1';
	const slideshowAtom = {
		id: 'slideshow-1',
		atomType: 'multimediaslideshow',
		data: {
			multimediaSlideshow: {
				slides: [
					{ content: { image: { assets: [], master: { file: 'first.jpg' } } } },
					{ content: { mediaAtom: { mediaAtomId: 'media-1' } } },
				],
			},
		},
	};

	const getStateWithSlideshowCard = (meta: Record<string, unknown>): State =>
		({
			...initialState,
			featureSwitches: {
				'multimedia-slideshow': {
					key: 'multimedia-slideshow',
					title: 'Multimedia slideshow',
					enabled: true,
				},
			},
			cards: {
				...initialState.cards,
				[cardId]: {
					...initialState.cards[cardId],
					meta: {
						...initialState.cards[cardId].meta,
						multimediaSlideshowReplace: true,
						...meta,
					},
				},
			},
		}) as State;

	const formValues = (store: ReturnType<typeof configureStore>) =>
		(store.getState() as any).form[cardId].values;

	const atomResponse = (atom: unknown) => ({
		json: () =>
			Promise.resolve({
				response: { status: 'ok', multimediaslideshow: atom },
			}),
	});

	const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

	const invalidSlideshowWarning =
		'You need to provide a valid slideshow atom embed URL';

	// The form's first load runs a tick after mounting, before any editor could interact
	const renderFormAndFinishFirstLoad = async (state: State) => {
		const rendered = renderForm(state);
		await flushPromises();
		return rendered;
	};

	beforeEach(() => {
		(global as any).fetch = jest
			.fn()
			.mockResolvedValue(atomResponse(slideshowAtom));
	});

	it('fetches the slideshow using the atom id from a pasted URL', async () => {
		const { store, getByTestId } = await renderFormAndFinishFirstLoad(
			getStateWithSlideshowCard({}),
		);

		fireEvent.change(getByTestId('multimedia-slideshow-url'), {
			target: { value: slideshowUrl },
		});

		expect(formValues(store).multimediaSlideshowAtomId).toBe(
			'atom/multimediaslideshow/slideshow-1',
		);
		await wait(() =>
			expect(formValues(store).multimediaSlideshowAtom).toEqual(slideshowAtom),
		);
		expect((global as any).fetch).toHaveBeenCalledWith(
			'/api/live/atom/multimediaslideshow/slideshow-1',
		);
	});

	it('shows a loading state instead of the invalid warning while the slideshow loads', async () => {
		const { getByTestId, getByText, queryByText } =
			await renderFormAndFinishFirstLoad(getStateWithSlideshowCard({}));
		const saveButton = getByTestId(
			'edit-form-save-button',
		) as HTMLButtonElement;

		fireEvent.change(getByTestId('multimedia-slideshow-url'), {
			target: { value: slideshowUrl },
		});

		expect(getByText('Loading slideshow…')).toBeTruthy();
		expect(queryByText(invalidSlideshowWarning)).toBeNull();
		expect(saveButton.disabled).toBe(true);
		await wait(() => expect(getByText('2 slides')).toBeTruthy());
		expect(queryByText('Loading slideshow…')).toBeNull();
		expect(saveButton.disabled).toBe(false);
	});

	it('disables Save as soon as the URL no longer points at a slideshow', async () => {
		const { getByTestId, getByText, queryByText } =
			await renderFormAndFinishFirstLoad(
				getStateWithSlideshowCard({
					multimediaSlideshowUrl: slideshowUrl,
					multimediaSlideshowAtomId: 'atom/multimediaslideshow/slideshow-1',
				}),
			);
		await wait(() => expect(getByText('2 slides')).toBeTruthy());

		fireEvent.change(getByTestId('multimedia-slideshow-url'), {
			target: { value: 'https://www.theguardian.com/uk' },
		});

		expect(queryByText('2 slides')).toBeNull();
		expect(getByText(invalidSlideshowWarning)).toBeTruthy();
		expect(
			(getByTestId('edit-form-save-button') as HTMLButtonElement).disabled,
		).toBe(true);
	});

	it('ignores a slower response for a previously pasted URL', async () => {
		const otherSlideshowAtom = { ...slideshowAtom, id: 'slideshow-2' };
		let resolveFirstFetch: (response: unknown) => void = () => {};
		(global as any).fetch = jest.fn((url: string) =>
			url.endsWith('slideshow-1')
				? new Promise((resolve) => (resolveFirstFetch = resolve))
				: Promise.resolve(atomResponse(otherSlideshowAtom)),
		);
		const { store, getByTestId } = await renderFormAndFinishFirstLoad(
			getStateWithSlideshowCard({}),
		);
		const urlInput = getByTestId('multimedia-slideshow-url');

		fireEvent.change(urlInput, { target: { value: slideshowUrl } });
		await wait(() =>
			expect((global as any).fetch).toHaveBeenCalledWith(
				'/api/live/atom/multimediaslideshow/slideshow-1',
			),
		);
		fireEvent.change(urlInput, {
			target: {
				value:
					'https://content.code.dev-guardianapis.com/atom/multimediaslideshow/slideshow-2',
			},
		});
		await wait(() =>
			expect(formValues(store).multimediaSlideshowAtom).toEqual(
				otherSlideshowAtom,
			),
		);

		resolveFirstFetch(atomResponse(slideshowAtom));
		await flushPromises();

		expect(formValues(store).multimediaSlideshowAtom).toEqual(
			otherSlideshowAtom,
		);
	});

	it('shows the number of slides in the slideshow', async () => {
		const { getByText } = renderForm(
			getStateWithSlideshowCard({
				multimediaSlideshowAtomId: 'atom/multimediaslideshow/slideshow-1',
			}),
		);

		await wait(() => expect(getByText('2 slides')).toBeTruthy());
	});

	it('loads the slideshow once on open without dirtying the form', async () => {
		const { store } = renderForm(
			getStateWithSlideshowCard({
				multimediaSlideshowAtomId: 'atom/multimediaslideshow/slideshow-1',
			}),
		);

		await wait(() =>
			expect(formValues(store).multimediaSlideshowAtom).toEqual(slideshowAtom),
		);
		// Outlast the fetch debounce
		await new Promise((resolve) => setTimeout(resolve, 600));

		expect((global as any).fetch).toHaveBeenCalledTimes(1);
		expect(isPristine(cardId)(store.getState())).toBe(true);
	});

	it('loads a saved slideshow when the editor switches back to it', async () => {
		const { store, getByLabelText, queryByText } =
			await renderFormAndFinishFirstLoad(
				getStateWithSlideshowCard({
					multimediaSlideshowReplace: false,
					multimediaSlideshowUrl: slideshowUrl,
					multimediaSlideshowAtomId: 'atom/multimediaslideshow/slideshow-1',
				}),
			);

		fireEvent.click(getByLabelText('Multimedia slideshow'));

		await wait(() =>
			expect(formValues(store).multimediaSlideshowAtom).toEqual(slideshowAtom),
		);
		expect(queryByText(invalidSlideshowWarning)).toBeNull();
	});
});
