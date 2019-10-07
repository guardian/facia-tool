import { getAbsolutePath, isGuardianUrl } from './url';
import fetchOpenGraphData from './openGraph';
import { Card, CardMeta } from '../types/Collection';
import v4 from 'uuid/v4';
import set from 'lodash/fp/set';
import { PartialBy } from 'types/Util';

function generateId() {
  return 'snap/' + new Date().getTime();
}
function validateId(id: string) {
  return (
    ([] as Array<string | null>).concat(
      getAbsolutePath(id || '').match(/^snap\/\d+$/)
    )[0] || undefined
  );
}

function convertToSnap({ id, ...rest }: PartialBy<Card, 'id'>): Card {
  const fragment = {
    id: generateId(),
    ...rest,
    meta: rest.meta
  };

  if (!id) {
    return fragment;
  }

  const href = isGuardianUrl(id) ? '/' + getAbsolutePath(id, true) : id;
  return set(['meta', 'href'], href, fragment);
}

async function createSnap(url?: string, meta?: CardMeta): Promise<Card> {
  const uuid = v4();
  try {
    const { title, description, siteName } =
      meta || !url ? ({} as any) : await fetchOpenGraphData(url);
    return convertToSnap({
      uuid,
      id: url,
      frontPublicationDate: Date.now(),
      meta: {
        headline: title,
        trailText: description,
        byline: siteName,
        showByline: siteName ? true : false,
        snapType: 'link',
        ...meta
      }
    });
  } catch (e) {
    return convertToSnap({
      uuid,
      id: url,
      frontPublicationDate: Date.now(),
      meta: {
        headline: 'Invalid page',
        snapType: 'link'
      }
    });
  }
}

function createLatestSnap(url: string, kicker: string) {
  return convertToSnap({
    id: url,
    uuid: v4(),
    frontPublicationDate: Date.now(),
    meta: {
      snapType: 'latest',
      snapUri: getAbsolutePath(url),
      showKickerCustom: true,
      customKicker: kicker
    }
  });
}

export { generateId, validateId, createLatestSnap, createSnap };
