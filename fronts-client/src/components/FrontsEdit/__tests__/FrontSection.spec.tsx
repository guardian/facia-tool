import { theme } from 'constants/theme';
import { frontsConfig } from 'fixtures/frontsConfig';
import state from 'fixtures/initialStateForOpenFronts';
import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux';
import {
	fireEvent,
	getByTestId,
	getByText,
	render,
} from 'react-testing-library';
import { ThemeProvider } from 'styled-components';
import configureStore from 'util/configureStore';
import FrontSection from '../FrontSection/FrontSection';

describe('FrontSection component', () => {
	const defaultProps = {
		frontId: 'editorialFront',
		selectedFront: frontsConfig.data.fronts.editorialFront,
		isOverviewOpen: false,
		frontsActions: {
			fetchLastPressed: jest.fn(),
			editorCloseFront: jest.fn(),
			updateCollection: jest.fn(),
			changeBrowsingStage: jest.fn(),
			updateFrontMetadata: jest.fn(),
			setFrontHiddenState: jest.fn(),
		},
		isEditions: false,
	};

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it('should give the correct preview link for DEV', () => {
		const store = configureStore({
			...state,
			config: {
				...state.config,
				dev: true,
				env: 'code',
			},
		});

		const { container } = render(
			<Provider store={store}>
				<ThemeProvider theme={theme}>
					<FrontSection {...defaultProps} />
				</ThemeProvider>
			</Provider>,
		);

		expect(getByText(container, 'Preview').closest('a')).toHaveAttribute(
			'href',
			'https://preview.code.dev-gutools.co.uk/responsive-viewer/https://preview.code.dev-gutools.co.uk/editorialFront',
		);
	});

	it('should give the correct preview link for CODE', () => {
		const store = configureStore({
			...state,
			config: {
				...state.config,
				dev: false,
				env: 'code',
			},
		});

		const { container } = render(
			<Provider store={store}>
				<ThemeProvider theme={theme}>
					<FrontSection {...defaultProps} />
				</ThemeProvider>
			</Provider>,
		);

		expect(getByText(container, 'Preview').closest('a')).toHaveAttribute(
			'href',
			'https://preview.code.dev-gutools.co.uk/responsive-viewer/https://preview.code.dev-gutools.co.uk/editorialFront',
		);
	});

	it('should give the correct preview link for PROD', () => {
		const store = configureStore({
			...state,
			config: {
				...state.config,
				dev: false,
				env: 'prod',
			},
		});

		const { container } = render(
			<Provider store={store}>
				<ThemeProvider theme={theme}>
					<FrontSection {...defaultProps} />
				</ThemeProvider>
			</Provider>,
		);

		expect(getByText(container, 'Preview').closest('a')).toHaveAttribute(
			'href',
			'https://preview.gutools.co.uk/responsive-viewer/https://preview.gutools.co.uk/editorialFront',
		);
	});

	it('should give the correct preview link for CODE email fronts', () => {
		const store = configureStore({
			...state,
			config: {
				...state.config,
				dev: false,
				env: 'code',
			},
		});

		const { container } = render(
			<Provider store={store}>
				<ThemeProvider theme={theme}>
					<FrontSection {...defaultProps} frontId="email/morning-briefing" />
				</ThemeProvider>
			</Provider>,
		);

		const previewLink = getByText(container, 'Preview').closest(
			'a',
		) as HTMLAnchorElement;
		const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
		jest.spyOn(Date, 'now').mockReturnValue(7_000);

		expect(previewLink).toHaveAttribute(
			'href',
			'https://preview.code.dev-gutools.co.uk/responsive-viewer/https://email-rendering-preview.code.dev-gutools.co.uk/fronts/email/morning-briefing',
		);

		fireEvent.click(previewLink);

		expect(openSpy).toHaveBeenCalledWith(
			'https://preview.code.dev-gutools.co.uk/responsive-viewer/https://email-rendering-preview.code.dev-gutools.co.uk/fronts/email/morning-briefing?cacheBust=5000',
			'preview',
		);
	});

	it('should give the correct preview link for PROD email fronts', () => {
		const store = configureStore({
			...state,
			config: {
				...state.config,
				dev: false,
				env: 'prod',
			},
		});

		const { container } = render(
			<Provider store={store}>
				<ThemeProvider theme={theme}>
					<FrontSection {...defaultProps} frontId="email/morning-briefing" />
				</ThemeProvider>
			</Provider>,
		);

		const previewLink = getByText(container, 'Preview').closest(
			'a',
		) as HTMLAnchorElement;
		const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
		jest.spyOn(Date, 'now').mockReturnValue(7_000);

		expect(previewLink).toHaveAttribute(
			'href',
			'https://preview.gutools.co.uk/responsive-viewer/https://email-rendering-preview.gutools.co.uk/fronts/email/morning-briefing',
		);

		fireEvent.click(previewLink);

		expect(openSpy).toHaveBeenCalledWith(
			'https://preview.gutools.co.uk/responsive-viewer/https://email-rendering-preview.gutools.co.uk/fronts/email/morning-briefing?cacheBust=5000',
			'preview',
		);
	});

	it('should give the correct live link for CODE email fronts', () => {
		const store = configureStore({
			...state,
			config: {
				...state.config,
				dev: false,
				env: 'code',
			},
		});

		const { container } = render(
			<Provider store={store}>
				<ThemeProvider theme={theme}>
					<FrontSection {...defaultProps} frontId="email/morning-briefing" />
				</ThemeProvider>
			</Provider>,
		);

		const liveLink = getByText(container, 'See live').closest(
			'a',
		) as HTMLAnchorElement;
		const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
		jest.spyOn(Date, 'now').mockReturnValue(7_000);

		expect(liveLink).toHaveAttribute(
			'href',
			'https://email-rendering.code.dev-guardianapis.com/fronts/email/morning-briefing',
		);

		fireEvent.click(liveLink);

		expect(openSpy).toHaveBeenCalledWith(
			'https://email-rendering.code.dev-guardianapis.com/fronts/email/morning-briefing?cacheBust=5000',
			'live',
		);
	});

	it('should give the correct live link for PROD email fronts', () => {
		const store = configureStore({
			...state,
			config: {
				...state.config,
				dev: false,
				env: 'prod',
			},
		});

		const { container } = render(
			<Provider store={store}>
				<ThemeProvider theme={theme}>
					<FrontSection {...defaultProps} frontId="email/morning-briefing" />
				</ThemeProvider>
			</Provider>,
		);

		const liveLink = getByText(container, 'See live').closest(
			'a',
		) as HTMLAnchorElement;
		const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
		jest.spyOn(Date, 'now').mockReturnValue(7_000);

		expect(liveLink).toHaveAttribute(
			'href',
			'https://email-rendering.guardianapis.com/fronts/email/morning-briefing',
		);

		fireEvent.click(liveLink);

		expect(openSpy).toHaveBeenCalledWith(
			'https://email-rendering.guardianapis.com/fronts/email/morning-briefing?cacheBust=5000',
			'live',
		);
	});

	it('should reuse the same email cache-bust within five seconds', () => {
		const store = configureStore({
			...state,
			config: {
				...state.config,
				dev: false,
				env: 'code',
			},
		});
		const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
		let now = 1_000;
		jest.spyOn(Date, 'now').mockImplementation(() => now);

		const { container } = render(
			<Provider store={store}>
				<ThemeProvider theme={theme}>
					<FrontSection {...defaultProps} frontId="email/morning-briefing" />
				</ThemeProvider>
			</Provider>,
		);

		const liveLink = getByText(container, 'See live').closest(
			'a',
		) as HTMLAnchorElement;

		fireEvent.click(liveLink);
		now = 2_000;
		fireEvent.click(liveLink);
		now = 4_999;
		fireEvent.click(liveLink);

		expect(openSpy).toHaveBeenNthCalledWith(
			1,
			'https://email-rendering.code.dev-guardianapis.com/fronts/email/morning-briefing?cacheBust=0',
			'live',
		);
		expect(openSpy).toHaveBeenNthCalledWith(
			2,
			'https://email-rendering.code.dev-guardianapis.com/fronts/email/morning-briefing?cacheBust=0',
			'live',
		);
		expect(openSpy).toHaveBeenNthCalledWith(
			3,
			'https://email-rendering.code.dev-guardianapis.com/fronts/email/morning-briefing?cacheBust=0',
			'live',
		);
	});

	it('should give the correct live link for DEV', () => {
		const store = configureStore({
			...state,
			config: {
				...state.config,
				dev: true,
				env: 'code',
			},
		});

		const { container } = render(
			<Provider store={store}>
				<ThemeProvider theme={theme}>
					<FrontSection {...defaultProps} />
				</ThemeProvider>
			</Provider>,
		);

		expect(getByText(container, 'See live').closest('a')).toHaveAttribute(
			'href',
			'https://m.code.dev-theguardian.com/editorialFront',
		);
	});

	it('should give the correct live link for CODE', () => {
		const store = configureStore({
			...state,
			config: {
				...state.config,
				dev: false,
				env: 'code',
			},
		});

		const { container } = render(
			<Provider store={store}>
				<ThemeProvider theme={theme}>
					<FrontSection {...defaultProps} />
				</ThemeProvider>
			</Provider>,
		);

		expect(getByText(container, 'See live').closest('a')).toHaveAttribute(
			'href',
			'https://m.code.dev-theguardian.com/editorialFront',
		);
	});

	it('should give the correct live link for PROD', () => {
		const store = configureStore({
			...state,
			config: {
				...state.config,
				dev: false,
				env: 'prod',
			},
		});

		const { container } = render(
			<Provider store={store}>
				<ThemeProvider theme={theme}>
					<FrontSection {...defaultProps} />
				</ThemeProvider>
			</Provider>,
		);

		expect(getByText(container, 'See live').closest('a')).toHaveAttribute(
			'href',
			'https://www.theguardian.com/editorialFront',
		);
	});

	describe('Front titles', () => {
		const sectionProps = {
			...defaultProps,
			frontId: 'editions-front-3',
			selectedFront: frontsConfig.data.fronts['editions-front-3'],
		};

		it('should make front names more legible when derived from ids', () => {
			const store = configureStore({
				...state,
				config: {
					...state.config,
					dev: false,
					env: 'prod',
				},
			});

			const { container } = render(
				<Provider store={store}>
					<ThemeProvider theme={theme}>
						<FrontSection {...sectionProps} />
					</ThemeProvider>
				</Provider>,
			);

			expect(getByTestId(container, 'front-name')).toHaveTextContent(
				'Editions Front 3',
			);
		});

		it('should not alter front names for editions', () => {
			const store = configureStore(
				{
					...state,
					config: {
						...state.config,
						dev: false,
						env: 'prod',
					},
				},
				'/v2/issues/9120723d-7d0d-4598-a22d-d9cf4dc7cbe6',
			);

			const { container } = render(
				<Provider store={store}>
					<ThemeProvider theme={theme}>
						<FrontSection {...sectionProps} />
					</ThemeProvider>
				</Provider>,
			);

			expect(getByTestId(container, 'front-name')).toHaveTextContent(
				'editions-front-3',
			);
		});
	});
});
