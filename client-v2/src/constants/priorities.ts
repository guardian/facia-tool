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
  trainingEdition: {
    description: 'Training Edition',
    address: 'training-edition'
  }
};
