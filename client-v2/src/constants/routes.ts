import { priorities } from './priorities';

export const base = '/v2';
export const frontsEdit = `/:priority(${Object.keys(priorities).join('|')})`;
export const manageEditions = `/manage-editions`;
