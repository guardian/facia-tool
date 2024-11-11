import { capGroupCards } from 'util/capGroupCards';
import { Group } from 'types/Collection';

let id = 0;
let uuid = 0;
let afid = 0;

const createGroup = (cards = 0): Group => ({
	id: `${id}`,
	uuid: `${uuid++}`,
	name: `Group ${id++}`,
	cards: Array.from({ length: cards }, () => `${afid++}`),
});

const createGroups = (...groupCardCount: number[]) =>
	groupCardCount.map(createGroup);

const toCardArray = (groups: Group[]) => groups.map(({ cards }) => cards);

describe('capGroupCards', () => {
	it('removes cards in an array of groups after a given maximum', () => {
		const groups = createGroups(10);
		const pre = toCardArray(groups);
		const post = toCardArray(capGroupCards(groups, 5));

		expect(post[0]).toHaveLength(5);
		expect(post[0]).toEqual(pre[0].slice(0, 5));
	});

	it('keeps the same array reference if the cards remain untouched', () => {
		const groups = createGroups(2, 3, 3, 5);
		const pre = toCardArray(groups);
		const post = toCardArray(capGroupCards(groups, 10));
		expect(post[0]).toBe(pre[0]);
		expect(post[1]).toBe(pre[1]);
		expect(post[2]).toBe(pre[2]);
		expect(post[3]).toHaveLength(2);
		expect(post[3]).toEqual(post[3].slice(0, 2));
	});
});
