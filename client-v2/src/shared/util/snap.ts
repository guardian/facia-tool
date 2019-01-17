import { getAbsolutePath, isGuardianUrl, isPreviewUrl } from './url';
import fetchOpenGraphData from './openGraph';
import { ArticleFragment } from '../types/Collection';
import v4 from 'uuid/v4';

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

function convertToSnap({ id, ...rest }: ArticleFragment): ArticleFragment {
  let href;

  if (isGuardianUrl(id) || isPreviewUrl(id)) {
    href = '/' + getAbsolutePath(id, true);
  } else {
    href = id;
  }

  return {
    id: generateId(),
    ...rest,
    meta: {
      href,
      ...rest.meta
    }
  };
}

async function createLinkSnap(url: string): Promise<ArticleFragment> {
  const uuid = v4();
  try {
    const { title, description, siteName } = await fetchOpenGraphData(url);
    return convertToSnap({
      uuid,
      id: url,
      frontPublicationDate: Date.now(),
      meta: {
        headline: title,
        trailText: description,
        byline: siteName,
        showByline: siteName ? true : false,
        snapType: 'link'
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

export { generateId, validateId, createLatestSnap, createLinkSnap };
