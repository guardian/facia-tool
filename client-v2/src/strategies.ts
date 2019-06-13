import { frontsEdit } from 'constants/routes';
import { matchPath } from 'react-router';
import {
  fetchEditionsIssueAsConfig,
  fetchFrontsConfig
} from 'services/faciaApi';

const isValidPathForEdition = (priority: string, id?: string): id is string =>
  !!id && priority === 'edition';

const isValidPathForOtherPriority = (priority: string, id?: string) =>
  !id && priority !== 'edition';

const fetchFrontsConfigStrategy = (path: string) => {
  const trimmedPath = path.replace(/^\/v2/, '');

  const editMatch = matchPath<{ priority: string; editionId?: string }>(
    trimmedPath,
    {
      path: frontsEdit
    }
  );

  if (!editMatch) {
    return null;
  }

  const {
    params: { priority, editionId }
  } = editMatch;

  if (isValidPathForEdition(priority, editionId)) {
    return fetchEditionsIssueAsConfig(editionId);
  } else if (isValidPathForOtherPriority(priority, editionId)) {
    return fetchFrontsConfig();
  }
  return null;
};

export { fetchFrontsConfigStrategy };
