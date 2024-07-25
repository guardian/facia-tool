export const CustomPaletteId = 'Custom';

export type PaletteFacet = {
  name?: string;
  prefix?: string;
  foregroundHex: string;
  backgroundHex: string;
};

export type PaletteOption = {
  id: string;
  name: string;
  palettes: Array<PaletteFacet>;
  imageURL?: string;
};

export const DefaultCustomPaletteChef = {
  id: CustomPaletteId,
  name: 'Custom',
  palettes: [{ foregroundHex: '#FFF', backgroundHex: '#333' }],
};

export const DefaultCustomPaletteFeastCollection = {
  id: CustomPaletteId,
  name: 'Custom',
  palettes: [
    {
      prefix: 'light',
      name: 'Light',
      foregroundHex: '#FFF',
      backgroundHex: '#333',
    },
    {
      prefix: 'dark',
      name: 'Dark',
      foregroundHex: '#333',
      backgroundHex: '#FFF',
    },
  ],
};

export const chefPalettes: PaletteOption[] = [
  {
    id: 'kaffir',
    name: 'Kaffir',
    palettes: [{ foregroundHex: '#F9F9F5', backgroundHex: '#697311' }],
  },
  {
    id: 'paprika',
    name: 'Paprika',
    palettes: [{ foregroundHex: '#F9F9F5', backgroundHex: '#C25400' }],
  },
  {
    id: 'berry',
    name: 'Berry',
    palettes: [{ foregroundHex: '#F9F9F5', backgroundHex: '#BB3B80' }],
  },
  {
    id: 'chilli',
    name: 'Chilli',
    palettes: [{ foregroundHex: '#F9F9F5', backgroundHex: '#9A1E1E' }],
  },
  {
    id: 'blueberry',
    name: 'Blueberry',
    palettes: [{ foregroundHex: '#F9F9F5', backgroundHex: '#20809E' }],
  },
  {
    id: 'tarragon',
    name: 'Tarragon',
    palettes: [{ foregroundHex: '#F9F9F5', backgroundHex: '#68773C' }],
  },
];

export const feastCollectionPalettes: PaletteOption[] = [
  {
    id: 'autumn',
    name: 'Autumn',
    palettes: [
      {
        prefix: 'light',
        name: 'Light',
        foregroundHex: '#C25400',
        backgroundHex: '#F9F9F5',
      },
      {
        prefix: 'dark',
        name: 'Dark',
        foregroundHex: '#F0CDB4',
        backgroundHex: '#363632',
      },
    ],
    imageURL: 'https://uploads.guim.co.uk/2024/03/21/Autumn.png',
  },
  {
    id: 'barbecue',
    name: 'Barbecue',
    palettes: [
      {
        prefix: 'light',
        name: 'Light',
        foregroundHex: '#697311',
        backgroundHex: '#F9F9F5',
      },
      {
        prefix: 'dark',
        name: 'Dark',
        foregroundHex: '#E1E5B8',
        backgroundHex: '#363632',
      },
    ],
    imageURL: 'https://uploads.guim.co.uk/2024/03/01/Barbecue-01.png',
  },
  {
    id: 'baking/pies',
    name: 'Baking/Pies',
    palettes: [
      {
        prefix: 'light',
        name: 'Light',
        foregroundHex: '#DB2712',
        backgroundHex: '#F9F9F5',
      },
      {
        prefix: 'dark',
        name: 'Dark',
        foregroundHex: '#FCF1F0',
        backgroundHex: '#363632',
      },
    ],
    imageURL: 'https://uploads.guim.co.uk/2024/03/21/Baking.png',
  },
  {
    id: 'budget',
    name: 'Budget',
    palettes: [
      {
        prefix: 'light',
        name: 'Light',
        foregroundHex: '#9A1E1E',
        backgroundHex: '#F9F9F5',
      },
      {
        prefix: 'dark',
        name: 'Dark',
        foregroundHex: '#F0BAB4',
        backgroundHex: '#363632',
      },
    ],
    imageURL: 'https://uploads.guim.co.uk/2024/03/21/Budget.png',
  },
  {
    id: 'brunch',
    name: 'Brunch',
    palettes: [
      {
        prefix: 'light',
        name: 'Light',
        foregroundHex: '#9A1E1E',
        backgroundHex: '#F9F9F5',
      },
      {
        prefix: 'dark',
        name: 'Dark',
        foregroundHex: '#F0BAB4',
        backgroundHex: '#363632',
      },
    ],
    imageURL: 'https://uploads.guim.co.uk/2024/03/21/Brunch.png',
  },
  {
    id: 'cakes',
    name: 'Cakes',
    palettes: [
      {
        prefix: 'light',
        name: 'Light',
        foregroundHex: '#BB3B80',
        backgroundHex: '#F9F9F5',
      },
      {
        prefix: 'dark',
        name: 'Dark',
        foregroundHex: '#FCF0F7',
        backgroundHex: '#363632',
      },
    ],
    imageURL: 'https://uploads.guim.co.uk/2024/03/21/Cakes.png',
  },
  {
    id: 'celebration',
    name: 'Celebration',
    palettes: [
      {
        prefix: 'light',
        name: 'Light',
        foregroundHex: '#801919',
        backgroundHex: '#F9F9F5',
      },
      {
        prefix: 'dark',
        name: 'Dark',
        foregroundHex: '#FCF1F0',
        backgroundHex: '#363632',
      },
    ],
    imageURL: 'https://uploads.guim.co.uk/2024/03/21/Celebration.png',
  },
  {
    id: 'celebration\ncakes',
    name: 'Celebration\nCakes',
    palettes: [
      {
        prefix: 'light',
        name: 'Light',
        foregroundHex: '#BB3B80',
        backgroundHex: '#F9F9F5',
      },
      {
        prefix: 'dark',
        name: 'Dark',
        foregroundHex: '#FCF0F7',
        backgroundHex: '#363632',
      },
    ],
    imageURL: 'https://uploads.guim.co.uk/2024/03/21/Celebrationcakes.png',
  },
  {
    id: 'cheese',
    name: 'Cheese',
    palettes: [
      {
        prefix: 'light',
        name: 'Light',
        foregroundHex: '#C25400',
        backgroundHex: '#F9F9F5',
      },
      {
        prefix: 'dark',
        name: 'Dark',
        foregroundHex: '#F0CDB4',
        backgroundHex: '#363632',
      },
    ],
    imageURL: 'https://uploads.guim.co.uk/2024/03/21/Cheese.png',
  },
  {
    id: 'chicken',
    name: 'Chicken',
    palettes: [
      {
        prefix: 'light',
        name: 'Light',
        foregroundHex: '#C25400',
        backgroundHex: '#F9F9F5',
      },
      {
        prefix: 'dark',
        name: 'Dark',
        foregroundHex: '#F0CDB4',
        backgroundHex: '#363632',
      },
    ],
    imageURL: 'https://uploads.guim.co.uk/2024/03/21/Chicken.png',
  },
  {
    id: 'chocolate',
    name: 'Chocolate',
    palettes: [
      {
        prefix: 'light',
        name: 'Light',
        foregroundHex: '#80513E',
        backgroundHex: '#F9F9F5',
      },
      {
        prefix: 'dark',
        name: 'Dark',
        foregroundHex: '#F0CDB4',
        backgroundHex: '#363632',
      },
    ],
    imageURL: 'https://uploads.guim.co.uk/2024/03/21/Chocolate.png',
  },
  {
    id: 'cookies',
    name: 'Cookies',
    palettes: [
      {
        prefix: 'light',
        name: 'Light',
        foregroundHex: '#603D2F',
        backgroundHex: '#F9F9F5',
      },
      {
        prefix: 'dark',
        name: 'Dark',
        foregroundHex: '#F0C5B4',
        backgroundHex: '#363632',
      },
    ],
    imageURL: 'https://uploads.guim.co.uk/2024/03/21/Cookies.png',
  },
  {
    id: 'dessert',
    name: 'Dessert',
    palettes: [
      {
        prefix: 'light',
        name: 'Light',
        foregroundHex: '#603D2F',
        backgroundHex: '#F9F9F5',
      },
      {
        prefix: 'dark',
        name: 'Dark',
        foregroundHex: '#F0C5B4',
        backgroundHex: '#363632',
      },
    ],
    imageURL: 'https://uploads.guim.co.uk/2024/03/21/Dessert-01.png',
  },
  {
    id: 'eggs',
    name: 'Eggs',
    palettes: [
      {
        prefix: 'light',
        name: 'Light',
        foregroundHex: '#C25400',
        backgroundHex: '#F9F9F5',
      },
      {
        prefix: 'dark',
        name: 'Dark',
        foregroundHex: '#F0CDB4',
        backgroundHex: '#363632',
      },
    ],
    imageURL: 'https://uploads.guim.co.uk/2024/03/21/Eggs.png',
  },
  {
    id: 'fish',
    name: 'Fish',
    palettes: [
      {
        prefix: 'light',
        name: 'Light',
        foregroundHex: '#427585',
        backgroundHex: '#F9F9F5',
      },
      {
        prefix: 'dark',
        name: 'Dark',
        foregroundHex: '#ACD8E5',
        backgroundHex: '#363632',
      },
    ],
    imageURL: 'https://uploads.guim.co.uk/2024/03/21/Fish.png',
  },
  {
    id: 'fruit',
    name: 'Fruit',
    palettes: [
      {
        prefix: 'light',
        name: 'Light',
        foregroundHex: '#9A1E1E',
        backgroundHex: '#F9F9F5',
      },
      {
        prefix: 'dark',
        name: 'Dark',
        foregroundHex: '#F0BAB4',
        backgroundHex: '#363632',
      },
    ],
    imageURL: 'https://uploads.guim.co.uk/2024/03/21/Fruit.png',
  },
  {
    id: 'meals for one',
    name: 'Meals for One',
    palettes: [
      {
        prefix: 'light',
        name: 'Light',
        foregroundHex: '#427585',
        backgroundHex: '#F9F9F5',
      },
      {
        prefix: 'dark',
        name: 'Dark',
        foregroundHex: '#ACD8E5',
        backgroundHex: '#363632',
      },
    ],
    imageURL: 'https://uploads.guim.co.uk/2024/03/21/MealsforOne.png',
  },
  {
    id: 'meat',
    name: 'Meat',
    palettes: [
      {
        prefix: 'light',
        name: 'Light',
        foregroundHex: '#9A1E1E',
        backgroundHex: '#F9F9F5',
      },
      {
        prefix: 'dark',
        name: 'Dark',
        foregroundHex: '#F0BAB4',
        backgroundHex: '#363632',
      },
    ],
    imageURL: 'https://uploads.guim.co.uk/2024/03/21/Meat.png',
  },
  {
    id: 'noodles',
    name: 'Noodles',
    palettes: [
      {
        prefix: 'light',
        name: 'Light',
        foregroundHex: '#427585',
        backgroundHex: '#F9F9F5',
      },
      {
        prefix: 'dark',
        name: 'Dark',
        foregroundHex: '#ACD8E5',
        backgroundHex: '#363632',
      },
    ],
    imageURL: 'https://uploads.guim.co.uk/2024/03/21/Noodles.png',
  },
  {
    id: 'pasta',
    name: 'Pasta',
    palettes: [
      {
        prefix: 'light',
        name: 'Light',
        foregroundHex: '#427585',
        backgroundHex: '#F9F9F5',
      },
      {
        prefix: 'dark',
        name: 'Dark',
        foregroundHex: '#ACD8E5',
        backgroundHex: '#363632',
      },
    ],
    imageURL: 'https://uploads.guim.co.uk/2024/03/21/Pasta.png',
  },
  {
    id: 'peas',
    name: 'Peas',
    palettes: [
      {
        prefix: 'light',
        name: 'Light',
        foregroundHex: '#697311',
        backgroundHex: '#F9F9F5',
      },
      {
        prefix: 'dark',
        name: 'Dark',
        foregroundHex: '#E1E5B8',
        backgroundHex: '#363632',
      },
    ],
    imageURL: 'https://uploads.guim.co.uk/2024/03/21/Peas.png',
  },
  {
    id: 'picnic',
    name: 'Picnic',
    palettes: [
      {
        prefix: 'light',
        name: 'Light',
        foregroundHex: '#427585',
        backgroundHex: '#F9F9F5',
      },
      {
        prefix: 'dark',
        name: 'Dark',
        foregroundHex: '#ACD8E5',
        backgroundHex: '#363632',
      },
    ],
    imageURL: 'https://uploads.guim.co.uk/2024/03/21/Picnic.png',
  },
  {
    id: 'potatos',
    name: 'Potatos',
    palettes: [
      {
        prefix: 'light',
        name: 'Light',
        foregroundHex: '#99614B',
        backgroundHex: '#F9F9F5',
      },
      {
        prefix: 'dark',
        name: 'Dark',
        foregroundHex: '#F0C5B4',
        backgroundHex: '#363632',
      },
    ],
    imageURL: 'https://uploads.guim.co.uk/2024/03/21/Potatos.png',
  },
  {
    id: 'rice',
    name: 'Rice',
    palettes: [
      {
        prefix: 'light',
        name: 'Light',
        foregroundHex: '#68773C',
        backgroundHex: '#F9F9F5',
      },
      {
        prefix: 'dark',
        name: 'Dark',
        foregroundHex: '#DAE5B8',
        backgroundHex: '#363632',
      },
    ],
    imageURL: 'https://uploads.guim.co.uk/2024/03/21/Rice.png',
  },
  {
    id: 'salads',
    name: 'Salads',
    palettes: [
      {
        prefix: 'light',
        name: 'Light',
        foregroundHex: '#697311',
        backgroundHex: '#F9F9F5',
      },
      {
        prefix: 'dark',
        name: 'Dark',
        foregroundHex: '#E1E5B8',
        backgroundHex: '#363632',
      },
    ],
    imageURL: 'https://uploads.guim.co.uk/2024/03/21/Salads.png',
  },
  {
    id: 'quick meals',
    name: 'Quick Meals',
    palettes: [
      {
        prefix: 'light',
        name: 'Light',
        foregroundHex: '#994100',
        backgroundHex: '#F9F9F5',
      },
      {
        prefix: 'dark',
        name: 'Dark',
        foregroundHex: '#ACD8E5',
        backgroundHex: '#363632',
      },
    ],
    imageURL: 'https://uploads.guim.co.uk/2024/03/21/QuickmealsV2-01.png',
  },
  {
    id: 'soup',
    name: 'Soup',
    palettes: [
      {
        prefix: 'light',
        name: 'Light',
        foregroundHex: '#406508',
        backgroundHex: '#F9F9F5',
      },
      {
        prefix: 'dark',
        name: 'Dark',
        foregroundHex: '#DAE5B8',
        backgroundHex: '#363632',
      },
    ],
    imageURL: 'https://uploads.guim.co.uk/2024/03/21/Soups.png',
  },
  {
    id: 'spring',
    name: 'Spring',
    palettes: [
      {
        prefix: 'light',
        name: 'Light',
        foregroundHex: '#697311',
        backgroundHex: '#F9F9F5',
      },
      {
        prefix: 'dark',
        name: 'Dark',
        foregroundHex: '#E1E5B8',
        backgroundHex: '#363632',
      },
    ],
    imageURL: 'https://uploads.guim.co.uk/2024/03/21/Spring.png',
  },
  {
    id: 'summer',
    name: 'Summer',
    palettes: [
      {
        prefix: 'light',
        name: 'Light',
        foregroundHex: '#9A1E1E',
        backgroundHex: '#F9F9F5',
      },
      {
        prefix: 'dark',
        name: 'Dark',
        foregroundHex: '#F0BAB4',
        backgroundHex: '#363632',
      },
    ],
    imageURL: 'https://uploads.guim.co.uk/2024/03/21/Summer.png',
  },
  {
    id: 'sprouts',
    name: 'Sprouts',
    palettes: [
      {
        prefix: 'light',
        name: 'Light',
        foregroundHex: '#9A1E1E',
        backgroundHex: '#F9F9F5',
      },
      {
        prefix: 'dark',
        name: 'Dark',
        foregroundHex: '#F0BAB4',
        backgroundHex: '#363632',
      },
    ],
    imageURL: 'https://uploads.guim.co.uk/2024/03/01/Sprouts-01-01.png',
  },
  {
    id: 'tacos',
    name: 'Tacos',
    palettes: [
      {
        prefix: 'light',
        name: 'Light',
        foregroundHex: '#DB2712',
        backgroundHex: '#F9F9F5',
      },
      {
        prefix: 'dark',
        name: 'Dark',
        foregroundHex: '#FCF1F0',
        backgroundHex: '#363632',
      },
    ],
    imageURL: 'https://uploads.guim.co.uk/2024/03/21/Tacos.png',
  },
  {
    id: 'tins',
    name: 'Tins',
    palettes: [
      {
        prefix: 'light',
        name: 'Light',
        foregroundHex: '#427585',
        backgroundHex: '#F9F9F5',
      },
      {
        prefix: 'dark',
        name: 'Dark',
        foregroundHex: '#ACD8E5',
        backgroundHex: '#363632',
      },
    ],
    imageURL: 'https://uploads.guim.co.uk/2024/03/21/Tins.png',
  },
  {
    id: 'traybake',
    name: 'Traybake',
    palettes: [
      {
        prefix: 'light',
        name: 'Light',
        foregroundHex: '#801919',
        backgroundHex: '#F9F9F5',
      },
      {
        prefix: 'dark',
        name: 'Dark',
        foregroundHex: '#FCF1F0',
        backgroundHex: '#363632',
      },
    ],
    imageURL: 'https://uploads.guim.co.uk/2024/03/21/Traybake.png',
  },
  {
    id: 'tv snacks',
    name: 'TV snacks',
    palettes: [
      {
        prefix: 'light',
        name: 'Light',
        foregroundHex: '#427585',
        backgroundHex: '#F9F9F5',
      },
      {
        prefix: 'dark',
        name: 'Dark',
        foregroundHex: '#ACD8E5',
        backgroundHex: '#363632',
      },
    ],
    imageURL: 'https://uploads.guim.co.uk/2024/03/21/TVsbacks.png',
  },
  {
    id: 'vegan',
    name: 'Vegan',
    palettes: [
      {
        prefix: 'light',
        name: 'Light',
        foregroundHex: '#98215A',
        backgroundHex: '#F9F9F5',
      },
      {
        prefix: 'dark',
        name: 'Dark',
        foregroundHex: '#F0C0D9',
        backgroundHex: '#363632',
      },
    ],
    imageURL: 'https://uploads.guim.co.uk/2024/03/01/Vegan-01.png',
  },
];
