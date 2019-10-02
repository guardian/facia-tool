import { EditionPriority, Priorities } from 'types/Priority';

export const priorities: Priorities = {
  editorial: {},
  commercial: {},
  training: {},
  email: {}
};

export const editionPriorities: { [index: string]: EditionPriority } = {
  dailyEdition: {
    description: 'Daily Edition',
    address: 'daily-edition'
  },
  americanEdition: {
    description: 'American Edition',
    address: 'american-edition'
  },
  australianEdition: {
    description: 'Australian Edition',
    address: 'australian-edition'
  }
};
