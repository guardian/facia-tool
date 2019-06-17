import { priorities } from './priorities';

export const base = '/v2';

export const temporaryEditionPath = `/:priority(edition)`; // this allows us to edit temporary edition mocks
export const frontsEdit = `/:priority(${Object.keys(priorities).join('|')})`;
export const manageEditions = `/manage-editions/:editionName`;
