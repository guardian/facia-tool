import React from 'react';
import { Provider } from 'react-redux';
import { fireEvent, render, cleanup } from 'react-testing-library';
import { ThemeProvider } from 'styled-components';
import { theme } from 'constants/theme';
import configureStore from 'util/configureStore';
import { state as initialState } from 'fixtures/initialState';
import ArticleMetaForm from '../ArticleMetaForm';

// TODO: Remove when no longer gated behind feature switch
jest.mock('util/extractConfigFromPage', () => {
	const baseConfig = jest.requireActual('fixtures/config').default;
	return {
		__esModule: true,
		default: {
			...baseConfig,
			userData: {
				featureSwitches: [{ key: 'headline-ab-testing', enabled: true }],
			},
		},
	};
});

afterEach(cleanup);

describe('ArticleMetaForm - headline AB testing', () => {
	it('copies the card headline into headlineA when the AB test toggle is switched on', () => {
		const store = configureStore(initialState);
		const cardId = 'exampleId';

		const { getByTestId } = render(
			<Provider store={store}>
				<ThemeProvider theme={theme}>
					<ArticleMetaForm
						cardId={cardId}
						form={cardId}
						frontId="frontId"
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

	it('shows a red warning next to an empty variant headline and hides it once populated', () => {
		const store = configureStore(initialState);
		const cardId = 'exampleId';

		const warningText =
			'Add a headline or turn the test off to save this container';

		const { getByTestId, queryAllByText } = render(
			<Provider store={store}>
				<ThemeProvider theme={theme}>
					<ArticleMetaForm
						cardId={cardId}
						form={cardId}
						frontId="frontId"
						onSave={jest.fn()}
						onCancel={jest.fn()}
					/>
				</ThemeProvider>
			</Provider>,
		);

		const abTestToggle = getByTestId(
			'edit-form-ab-test-toggle',
		) as HTMLInputElement;
		fireEvent.click(abTestToggle);

		// Headline A is populated from the card headline, Headline B is empty,
		// so only one warning should be shown.
		expect(queryAllByText(warningText)).toHaveLength(1);

		const headlineBField = getByTestId(
			'edit-form-headline-b-field',
		) as HTMLTextAreaElement;
		fireEvent.change(headlineBField, { target: { value: 'Headline B' } });

		expect(queryAllByText(warningText)).toHaveLength(0);
	});
});
