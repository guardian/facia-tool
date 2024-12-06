import { theme } from 'constants/theme';
import { frontsConfig } from 'fixtures/frontsConfig';
import state from 'fixtures/initialStateForOpenFronts';
import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux';
import { getByTestId, getByText, render } from 'react-testing-library';
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
			'https://m.code.dev-theguardian.com/editorialFront',
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
			'https://m.code.dev-theguardian.com/editorialFront',
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
