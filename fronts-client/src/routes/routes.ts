import { priorities } from '../constants/priorities';
import { matchPath } from 'react-router';
import url from 'constants/url';

export const base = `/${url.appRoot}`;

const editionsApi = (path: string) => `/editions-api${path}`;

/**
 * Fronts edit
 */

export interface FrontsEditParams {
	priority: string;
}

const frontsEditPathProps = {
	exact: true,
	path: `/:priority(${Object.keys(priorities).join('|')})`,
};

const matchFrontsEditPath = (path: string) =>
	matchPath<FrontsEditParams>(path, frontsEditPathProps);

const frontsFeatureProps = {
	exact: true,
	path: '/features',
};

/**
 * Issue
 */

const issuePathProps = {
	exact: true,
	path: '/issues/:priority',
};

// The `priority` in this path is actually the edition issueId, but is mapped to priority
// so as to perserve things like favourite fronts and open fronts
const matchIssuePath = (path: string) =>
	matchPath<FrontsEditParams>(path, issuePathProps);

export const manageEditions = `/manage-editions/:editionName`;

const EditionsRoutes = {
	issuePath: (issueId: string) => editionsApi(`/issues/${issueId}`),
	collectionPath: (collectionId: string) =>
		editionsApi(`/editions/collections/${collectionId}`),
};

export {
	matchFrontsEditPath,
	frontsEditPathProps,
	matchIssuePath,
	issuePathProps,
	frontsFeatureProps,
	EditionsRoutes,
};
