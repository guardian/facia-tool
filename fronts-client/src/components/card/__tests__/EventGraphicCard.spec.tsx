import React from 'react';
import { render, cleanup } from 'react-testing-library';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import 'jest-styled-components';
import configureStore from 'util/configureStore';
import { theme } from '../../../constants/theme';
import { EventGraphicCard } from '../eventGraphic/EventGraphicCard';
import { eventGraphics } from 'constants/eventGraphics';

const [eventGraphic] = eventGraphics;

const cardFixture = {
	id: eventGraphic.id,
	uuid: 'a3b1c1e0-0f3a-4f1a-9c4e-0e6a6a0b3c11',
	frontPublicationDate: 1,
	meta: {},
};

const unknownCardFixture = {
	id: 'event-graphic/some-graphic-we-no-longer-know-about',
	uuid: 'b3b1c1e0-0f3a-4f1a-9c4e-0e6a6a0b3c22',
	frontPublicationDate: 1,
	meta: {},
};

const renderCard = (card: typeof cardFixture) => {
	const store = configureStore({
		feed: {},
		cards: { [card.uuid]: card },
	} as never);

	return render(
		<Provider store={store}>
			<ThemeProvider theme={theme}>
				<EventGraphicCard
					id={card.uuid}
					frontId="front"
					onDelete={jest.fn()}
					onAddToClipboard={jest.fn()}
				/>
			</ThemeProvider>
		</Provider>,
	);
};

describe('EventGraphicCard', () => {
	afterEach(cleanup);

	it('should render the title of the event graphic', () => {
		const { getByTestId } = renderCard(cardFixture);
		expect(getByTestId('headline').textContent).toBe(eventGraphic.title);
	});

	it('should label the card as an event graphic', () => {
		const { getByText } = renderCard(cardFixture);
		expect(getByText('Event graphic')).toBeTruthy();
	});

	it('should fall back to the id when the event graphic is unknown', () => {
		const { getByTestId } = renderCard(unknownCardFixture);
		expect(getByTestId('headline').textContent).toBe(unknownCardFixture.id);
	});
});
