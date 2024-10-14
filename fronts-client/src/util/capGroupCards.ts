import { Group } from 'types/Collection';

// runs through an array of groups, assumed to be ordered, and removes all
// cards beyond maxCards
export const capGroupCards = (groups: Group[], maxCards: number) =>
	groups.reduce(
		({ arr, remaining }, sibling) => ({
			arr: [
				...arr,
				{
					...sibling,
					cards:
						remaining < sibling.cards.length
							? sibling.cards.slice(0, remaining)
							: sibling.cards,
				},
			],
			remaining: Math.max(remaining - sibling.cards.length, 0),
		}),
		{
			arr: [],
			remaining: maxCards,
		} as {
			arr: Group[];
			remaining: number;
		},
	).arr;
