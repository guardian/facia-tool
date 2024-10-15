export const CustomPaletteId = 'Custom';

export type PaletteFacet = {
	foregroundHex: string;
	backgroundHex: string;
};

export type PaletteOption = {
	id: string;
	name: string;
	palettes: Record<string, PaletteFacet>;
	imageURL?: string;
};

export const DefaultCustomPaletteChef = {
	id: CustomPaletteId,
	name: 'Custom',
	palettes: { default: { foregroundHex: '#FFFFFF', backgroundHex: '#333333' } },
};

export const DefaultCustomPaletteFeastCollection = {
	id: CustomPaletteId,
	name: 'Custom',
	palettes: {
		light: {
			foregroundHex: '#FFFFFF',
			backgroundHex: '#333333',
		},
		dark: {
			prefix: 'dark',
			name: 'Dark',
			foregroundHex: '#333333',
			backgroundHex: '#FFFFFF',
		},
	},
};

export const chefPalettes: PaletteOption[] = [
	{
		id: 'kaffir',
		name: 'Kaffir',
		palettes: {
			default: { foregroundHex: '#F9F9F5', backgroundHex: '#697311' },
		},
	},
	{
		id: 'paprika',
		name: 'Paprika',
		palettes: {
			default: { foregroundHex: '#F9F9F5', backgroundHex: '#C25400' },
		},
	},
	{
		id: 'berry',
		name: 'Berry',
		palettes: {
			default: { foregroundHex: '#F9F9F5', backgroundHex: '#BB3B80' },
		},
	},
	{
		id: 'chilli',
		name: 'Chilli',
		palettes: {
			default: { foregroundHex: '#F9F9F5', backgroundHex: '#9A1E1E' },
		},
	},
	{
		id: 'blueberry',
		name: 'Blueberry',
		palettes: {
			default: { foregroundHex: '#F9F9F5', backgroundHex: '#20809E' },
		},
	},
	{
		id: 'tarragon',
		name: 'Tarragon',
		palettes: {
			default: { foregroundHex: '#F9F9F5', backgroundHex: '#68773C' },
		},
	},
];

export const feastCollectionPalettes: PaletteOption[] = [
	{
		id: 'autumn',
		name: 'Autumn',
		palettes: {
			light: {
				foregroundHex: '#603D30',
				backgroundHex: '#F9F9F5',
			},
			dark: {
				foregroundHex: '#F0C5B5',
				backgroundHex: '#363632',
			},
		},
		imageURL: 'https://uploads.guim.co.uk/2024/10/07/Autumn.png',
	},
	{
		id: 'barbecue',
		name: 'Barbecue',
		palettes: {
			light: {
				foregroundHex: '#697311',
				backgroundHex: '#F9F9F5',
			},
			dark: {
				foregroundHex: '#E1E5B8',
				backgroundHex: '#363632',
			},
		},
		imageURL: 'https://uploads.guim.co.uk/2024/03/01/Barbecue-01.png',
	},
	{
		id: 'baking/pies',
		name: 'Baking/Pies',
		palettes: {
			light: {
				foregroundHex: '#DB2712',
				backgroundHex: '#F9F9F5',
			},
			dark: {
				foregroundHex: '#FCF1F0',
				backgroundHex: '#363632',
			},
		},
		imageURL: 'https://uploads.guim.co.uk/2024/03/21/Baking.png',
	},
	{
		id: 'breakfast',
		name: 'Breakfast',
		palettes: {
			light: {
				foregroundHex: '#80191A',
				backgroundHex: '#F9F9F5',
			},
			dark: {
				foregroundHex: '#FDF1F0',
				backgroundHex: '#363632',
			},
		},
		imageURL: 'https://uploads.guim.co.uk/2024/03/21/Baking.png',
	},
	{
		id: 'budget',
		name: 'Budget',
		palettes: {
			light: {
				foregroundHex: '#9A1E1E',
				backgroundHex: '#F9F9F5',
			},
			dark: {
				foregroundHex: '#F0BAB4',
				backgroundHex: '#363632',
			},
		},
		imageURL: 'https://uploads.guim.co.uk/2024/03/21/Budget.png',
	},
	{
		id: 'brunch',
		name: 'Brunch',
		palettes: {
			light: {
				foregroundHex: '#9A1E1E',
				backgroundHex: '#F9F9F5',
			},
			dark: {
				foregroundHex: '#F0BAB4',
				backgroundHex: '#363632',
			},
		},
		imageURL: 'https://uploads.guim.co.uk/2024/03/21/Brunch.png',
	},
	{
		id: 'cakes',
		name: 'Cakes',
		palettes: {
			light: {
				foregroundHex: '#BB3B80',
				backgroundHex: '#F9F9F5',
			},
			dark: {
				foregroundHex: '#FCF0F7',
				backgroundHex: '#363632',
			},
		},
		imageURL: 'https://uploads.guim.co.uk/2024/03/21/Cakes.png',
	},
	{
		id: 'celebration',
		name: 'Celebration',
		palettes: {
			light: {
				foregroundHex: '#801919',
				backgroundHex: '#F9F9F5',
			},
			dark: {
				foregroundHex: '#FCF1F0',
				backgroundHex: '#363632',
			},
		},
		imageURL: 'https://uploads.guim.co.uk/2024/03/21/Celebration.png',
	},
	{
		id: 'celebration\ncakes',
		name: 'Celebration\nCakes',
		palettes: {
			light: {
				foregroundHex: '#BB3B80',
				backgroundHex: '#F9F9F5',
			},
			dark: {
				foregroundHex: '#FCF0F7',
				backgroundHex: '#363632',
			},
		},
		imageURL: 'https://uploads.guim.co.uk/2024/03/21/Celebrationcakes.png',
	},
	{
		id: 'cheese',
		name: 'Cheese',
		palettes: {
			light: {
				foregroundHex: '#C25400',
				backgroundHex: '#F9F9F5',
			},
			dark: {
				foregroundHex: '#F0CDB4',
				backgroundHex: '#363632',
			},
		},
		imageURL: 'https://uploads.guim.co.uk/2024/03/21/Cheese.png',
	},
	{
		id: 'chicken',
		name: 'Chicken',
		palettes: {
			light: {
				foregroundHex: '#C25400',
				backgroundHex: '#F9F9F5',
			},
			dark: {
				foregroundHex: '#F0CDB4',
				backgroundHex: '#363632',
			},
		},
		imageURL: 'https://uploads.guim.co.uk/2024/03/21/Chicken.png',
	},
	{
		id: 'chocolate',
		name: 'Chocolate',
		palettes: {
			light: {
				foregroundHex: '#80513E',
				backgroundHex: '#F9F9F5',
			},
			dark: {
				foregroundHex: '#F0CDB4',
				backgroundHex: '#363632',
			},
		},
		imageURL: 'https://uploads.guim.co.uk/2024/03/21/Chocolate.png',
	},
	{
		id: 'cookies',
		name: 'Cookies',
		palettes: {
			light: {
				foregroundHex: '#603D2F',
				backgroundHex: '#F9F9F5',
			},
			dark: {
				foregroundHex: '#F0C5B4',
				backgroundHex: '#363632',
			},
		},
		imageURL: 'https://uploads.guim.co.uk/2024/03/21/Cookies.png',
	},
	{
		id: 'curries',
		name: 'Curries',
		palettes: {
			light: {
				foregroundHex: '#C15627',
				backgroundHex: '#F9F9F5',
			},
			dark: {
				foregroundHex: '#F0CDB5',
				backgroundHex: '#363632',
			},
		},
		imageURL: 'https://uploads.guim.co.uk/2024/03/21/Cookies.png',
	},
	{
		id: 'dessert',
		name: 'Dessert',
		palettes: {
			light: {
				foregroundHex: '#603D2F',
				backgroundHex: '#F9F9F5',
			},
			dark: {
				foregroundHex: '#F0C5B4',
				backgroundHex: '#363632',
			},
		},
		imageURL: 'https://uploads.guim.co.uk/2024/03/21/Dessert-01.png',
	},
	{
		id: 'dips',
		name: 'Dips',
		palettes: {
			light: {
				foregroundHex: '#BB3C81',
				backgroundHex: '#F9F9F5',
			},
			dark: {
				foregroundHex: '#FCF0F6',
				backgroundHex: '#363632',
			},
		},
		imageURL: 'https://uploads.guim.co.uk/2024/03/21/Dessert-01.png',
	},
	{
		id: 'eggs',
		name: 'Eggs',
		palettes: {
			light: {
				foregroundHex: '#C25400',
				backgroundHex: '#F9F9F5',
			},
			dark: {
				foregroundHex: '#F0CDB4',
				backgroundHex: '#363632',
			},
		},
		imageURL: 'https://uploads.guim.co.uk/2024/03/21/Eggs.png',
	},
	{
		id: 'fish',
		name: 'Fish',
		palettes: {
			light: {
				foregroundHex: '#427585',
				backgroundHex: '#F9F9F5',
			},
			dark: {
				foregroundHex: '#ACD8E5',
				backgroundHex: '#363632',
			},
		},
		imageURL: 'https://uploads.guim.co.uk/2024/03/21/Fish.png',
	},
	{
		id: 'fruits',
		name: 'Fruits',
		palettes: {
			light: {
				foregroundHex: '#DA2B27',
				backgroundHex: '#F9F9F5',
			},
			dark: {
				foregroundHex: '#FDF1F0',
				backgroundHex: '#363632',
			},
		},
		imageURL: 'https://uploads.guim.co.uk/2024/03/21/Fruit.png',
	},
	{
		id: 'meals for one',
		name: 'Meals for One',
		palettes: {
			light: {
				foregroundHex: '#427585',
				backgroundHex: '#F9F9F5',
			},
			dark: {
				foregroundHex: '#ACD8E5',
				backgroundHex: '#363632',
			},
		},
		imageURL: 'https://uploads.guim.co.uk/2024/03/21/MealsforOne.png',
	},
	{
		id: 'meat',
		name: 'Meat',
		palettes: {
			light: {
				foregroundHex: '#9A1E1E',
				backgroundHex: '#F9F9F5',
			},
			dark: {
				foregroundHex: '#F0BAB4',
				backgroundHex: '#363632',
			},
		},
		imageURL: 'https://uploads.guim.co.uk/2024/03/21/Meat.png',
	},
	{
		id: 'mushrooms',
		name: 'Mushrooms',
		palettes: {
			light: {
				foregroundHex: '#80523E',
				backgroundHex: '#F9F9F5',
			},
			dark: {
				foregroundHex: '#F0CDB5',
				backgroundHex: '#363632',
			},
		},
		imageURL: 'https://uploads.guim.co.uk/2024/10/07/Mushrooms.png',
	},
	{
		id: 'noodles',
		name: 'Noodles',
		palettes: {
			light: {
				foregroundHex: '#427585',
				backgroundHex: '#F9F9F5',
			},
			dark: {
				foregroundHex: '#ACD8E5',
				backgroundHex: '#363632',
			},
		},
		imageURL: 'https://uploads.guim.co.uk/2024/03/21/Noodles.png',
	},
	{
		id: 'nuts',
		name: 'Nuts',
		palettes: {
			light: {
				foregroundHex: '#603D30',
				backgroundHex: '#F9F9F5',
			},
			dark: {
				foregroundHex: '#F0C5B5',
				backgroundHex: '#363632',
			},
		},
		imageURL: 'https://uploads.guim.co.uk/2024/03/21/Noodles.png',
	},
	{
		id: 'one-pot',
		name: 'One-pot',
		palettes: {
			light: {
				foregroundHex: '#697431',
				backgroundHex: '#F9F9F5',
			},
			dark: {
				foregroundHex: '#E1E5B8',
				backgroundHex: '#363632',
			},
		},
		imageURL: 'https://uploads.guim.co.uk/2024/03/21/Noodles.png',
	},
	{
		id: 'pasta',
		name: 'Pasta',
		palettes: {
			light: {
				foregroundHex: '#427585',
				backgroundHex: '#F9F9F5',
			},
			dark: {
				foregroundHex: '#ACD8E5',
				backgroundHex: '#363632',
			},
		},
		imageURL: 'https://uploads.guim.co.uk/2024/03/21/Pasta.png',
	},
	{
		id: 'peas',
		name: 'Peas',
		palettes: {
			light: {
				foregroundHex: '#697311',
				backgroundHex: '#F9F9F5',
			},
			dark: {
				foregroundHex: '#E1E5B8',
				backgroundHex: '#363632',
			},
		},
		imageURL: 'https://uploads.guim.co.uk/2024/03/21/Peas.png',
	},
	{
		id: 'picnic',
		name: 'Picnic',
		palettes: {
			light: {
				foregroundHex: '#427585',
				backgroundHex: '#F9F9F5',
			},
			dark: {
				foregroundHex: '#ACD8E5',
				backgroundHex: '#363632',
			},
		},
		imageURL: 'https://uploads.guim.co.uk/2024/03/21/Picnic.png',
	},
	{
		id: 'potatos',
		name: 'Potatos',
		palettes: {
			light: {
				foregroundHex: '#99614B',
				backgroundHex: '#F9F9F5',
			},
			dark: {
				foregroundHex: '#F0C5B4',
				backgroundHex: '#363632',
			},
		},
		imageURL: 'https://uploads.guim.co.uk/2024/03/21/Potatos.png',
	},
	{
		id: 'rice',
		name: 'Rice',
		palettes: {
			light: {
				foregroundHex: '#68773C',
				backgroundHex: '#F9F9F5',
			},
			dark: {
				foregroundHex: '#DAE5B8',
				backgroundHex: '#363632',
			},
		},
		imageURL: 'https://uploads.guim.co.uk/2024/03/21/Rice.png',
	},
	{
		id: 'salads',
		name: 'Salads',
		palettes: {
			light: {
				foregroundHex: '#697311',
				backgroundHex: '#F9F9F5',
			},
			dark: {
				foregroundHex: '#E1E5B8',
				backgroundHex: '#363632',
			},
		},
		imageURL: 'https://uploads.guim.co.uk/2024/03/21/Salads.png',
	},
	{
		id: 'quick meals',
		name: 'Quick Meals',
		palettes: {
			light: {
				foregroundHex: '#994100',
				backgroundHex: '#F9F9F5',
			},
			dark: {
				foregroundHex: '#ACD8E5',
				backgroundHex: '#363632',
			},
		},
		imageURL: 'https://uploads.guim.co.uk/2024/03/21/QuickmealsV2-01.png',
	},
	{
		id: 'soup',
		name: 'Soup',
		palettes: {
			light: {
				foregroundHex: '#406508',
				backgroundHex: '#F9F9F5',
			},
			dark: {
				foregroundHex: '#DAE5B8',
				backgroundHex: '#363632',
			},
		},
		imageURL: 'https://uploads.guim.co.uk/2024/03/21/Soups.png',
	},
	{
		id: 'spring',
		name: 'Spring',
		palettes: {
			light: {
				foregroundHex: '#697311',
				backgroundHex: '#F9F9F5',
			},
			dark: {
				foregroundHex: '#E1E5B8',
				backgroundHex: '#363632',
			},
		},
		imageURL: 'https://uploads.guim.co.uk/2024/03/21/Spring.png',
	},
	{
		id: 'summer',
		name: 'Summer',
		palettes: {
			light: {
				foregroundHex: '#9A1E1E',
				backgroundHex: '#F9F9F5',
			},
			dark: {
				foregroundHex: '#F0BAB4',
				backgroundHex: '#363632',
			},
		},
		imageURL: 'https://uploads.guim.co.uk/2024/03/21/Summer.png',
	},
	{
		id: 'sprouts',
		name: 'Sprouts',
		palettes: {
			light: {
				foregroundHex: '#9A1E1E',
				backgroundHex: '#F9F9F5',
			},
			dark: {
				foregroundHex: '#F0BAB4',
				backgroundHex: '#363632',
			},
		},
		imageURL: 'https://uploads.guim.co.uk/2024/03/01/Sprouts-01-01.png',
	},
	{
		id: 'tacos',
		name: 'Tacos',
		palettes: {
			light: {
				foregroundHex: '#DB2712',
				backgroundHex: '#F9F9F5',
			},
			dark: {
				foregroundHex: '#FCF1F0',
				backgroundHex: '#363632',
			},
		},
		imageURL: 'https://uploads.guim.co.uk/2024/03/21/Tacos.png',
	},
	{
		id: 'tins',
		name: 'Tins',
		palettes: {
			light: {
				foregroundHex: '#427585',
				backgroundHex: '#F9F9F5',
			},
			dark: {
				foregroundHex: '#ACD8E5',
				backgroundHex: '#363632',
			},
		},
		imageURL: 'https://uploads.guim.co.uk/2024/03/21/Tins.png',
	},
	{
		id: 'traybake',
		name: 'Traybake',
		palettes: {
			light: {
				foregroundHex: '#801919',
				backgroundHex: '#F9F9F5',
			},
			dark: {
				foregroundHex: '#FCF1F0',
				backgroundHex: '#363632',
			},
		},
		imageURL: 'https://uploads.guim.co.uk/2024/03/21/Traybake.png',
	},
	{
		id: 'tv snacks',
		name: 'TV snacks',
		palettes: {
			light: {
				foregroundHex: '#427585',
				backgroundHex: '#F9F9F5',
			},
			dark: {
				foregroundHex: '#ACD8E5',
				backgroundHex: '#363632',
			},
		},
		imageURL: 'https://uploads.guim.co.uk/2024/03/21/TVsbacks.png',
	},
	{
		id: 'vegan',
		name: 'Vegan',
		palettes: {
			light: {
				foregroundHex: '#98215A',
				backgroundHex: '#F9F9F5',
			},
			dark: {
				foregroundHex: '#F0C0D9',
				backgroundHex: '#363632',
			},
		},
		imageURL: 'https://uploads.guim.co.uk/2024/03/01/Vegan-01.png',
	},
	{
		id: 'vegetables',
		name: 'Vegetables',
		palettes: {
			light: {
				foregroundHex: '#9A2020',
				backgroundHex: '#F9F9F5',
			},
			dark: {
				foregroundHex: '#EFBAB4',
				backgroundHex: '#363632',
			},
		},
		imageURL: 'https://uploads.guim.co.uk/2024/03/01/Vegan-01.png',
	},
	{
		id: 'bowls_darkgreen',
		name: 'Bowls\n(dark green)',
		palettes: {
			light: {
				foregroundHex: '#80191A',
				backgroundHex: '#F9F9F5',
			},
			dark: {
				foregroundHex: '#FDF1F0',
				backgroundHex: '#363632',
			},
		},
		imageURL: 'https://uploads.guim.co.uk/2024/10/07/Bowls_darkgreen.png',
	},
	{
		id: 'bowls_limegreen',
		name: 'Bowls\n(lime green)',
		palettes: {
			light: {
				foregroundHex: '#697431',
				backgroundHex: '#F9F9F5',
			},
			dark: {
				foregroundHex: '#E1E5B8',
				backgroundHex: '#363632',
			},
		},
		imageURL: 'https://uploads.guim.co.uk/2024/10/07/Bowls_limegreen.png',
	},
	{
		id: 'bowls_orange',
		name: 'Bowls\n(orange)',
		palettes: {
			light: {
				foregroundHex: '#C15627',
				backgroundHex: '#F9F9F5',
			},
			dark: {
				foregroundHex: '#F0CDB5',
				backgroundHex: '#363632',
			},
		},
		imageURL: 'https://uploads.guim.co.uk/2024/10/07/Bowls_orange.png',
	},
	{
		id: 'bowls_purple',
		name: 'Bowls\n(purple)',
		palettes: {
			light: {
				foregroundHex: '#BB3C81',
				backgroundHex: '#F9F9F5',
			},
			dark: {
				foregroundHex: '#FCF0F6',
				backgroundHex: '#363632',
			},
		},
		imageURL: 'https://uploads.guim.co.uk/2024/10/07/Bowls_purple.png',
	},
	{
		id: 'bowls_yellow',
		name: 'Bowls\n(yellow)',
		palettes: {
			light: {
				foregroundHex: '#C15627',
				backgroundHex: '#F9F9F5',
			},
			dark: {
				foregroundHex: '#F0CDB5',
				backgroundHex: '#363632',
			},
		},
		imageURL: 'https://uploads.guim.co.uk/2024/10/07/Bowls_yellow.png',
	},
];
