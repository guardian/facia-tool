import { Element, Tag, CapiArticle } from 'types/Capi';
import { ExternalArticle } from '../shared/types/ExternalArticle';
import { ArticleFragmentMeta } from '../shared/types/Collection';
import { notLiveLabels, liveBlogTones } from 'constants/fronts';
import startCase from 'lodash/startCase';

const getIdFromURL = (
  url: string,
  ensureLeadingSlash: boolean = false
): string | undefined => {
  const [, id = null] =
    url.match(
      /^https:\/\/(?:www.theguardian.com\/|viewer.gutools.co.uk(?:\/(?:preview|live))?\/)([^?]*)/
    ) || [];
  if (typeof id !== 'string') {
    return;
  }
  return !ensureLeadingSlash || id[0] === '/' ? id : `/${id}`;
};

// TODO: get apiKey from context (or speak directly to FrontsAPI)
const getThumbnailFromElements = (elements: Element[]) => {
  if (!elements || !elements.length) {
    return undefined;
  }
  const imageElements = elements.filter(
    element => element.type === 'image' && element.relation === 'thumbnail'
  );

  if (!imageElements.length) {
    return undefined;
  }

  const { assets } = imageElements[0];

  let smallestAsset;

  for (const asset of assets) {
    {
      if (
        !smallestAsset ||
        (asset.typeData.width &&
          smallestAsset.typeData.width &&
          +asset.typeData.width < +smallestAsset.typeData.width)
      ) {
        smallestAsset = asset;
      }
    }
  }

  return smallestAsset && smallestAsset.file;
};

function getContributorImage(externalArticle: ExternalArticle) {
  const contributor =
    externalArticle.tags &&
    externalArticle.tags.find(tag => tag.type === 'contributor');

  return contributor && contributor.bylineLargeImageUrl;
}

function getThumbnail(
  meta: ArticleFragmentMeta,
  externalArticle?: ExternalArticle
): string | undefined {
  const isReplacingImage = meta.imageReplace;
  const metaImageSrcThumb = isReplacingImage && meta.imageSrcThumb;
  const imageSrc = isReplacingImage && meta.imageSrc;

  if (metaImageSrcThumb && metaImageSrcThumb !== '') {
    return metaImageSrcThumb;
  } else if (imageSrc) {
    return imageSrc;
  } else if (meta.imageCutoutReplace && externalArticle) {
    return (
      meta.imageCutoutSrc ||
      getContributorImage(externalArticle) ||
      externalArticle.fields.secureThumbnail ||
      externalArticle.fields.thumbnail ||
      undefined
    );
  } else if (
    meta.imageSlideshowReplace &&
    meta.imageSlideshowReplace &&
    meta.slideshow &&
    meta.slideshow[0]
  ) {
    return meta.slideshow[0].src;
  }

  return (
    (externalArticle && externalArticle.fields.secureThumbnail) ||
    (externalArticle && externalArticle.fields.thumbnail) ||
    (externalArticle && getThumbnailFromElements(externalArticle.elements))
  );
}

const getTags = (externalArticle: ExternalArticle): Tag[] =>
  externalArticle.tags || [];

const getPrimaryTag = (externalArticle: ExternalArticle): Tag | null =>
  getTags(externalArticle)[0] || null;

const isLive = (article: CapiArticle) => {
  // `isLive` is `undefined` if item is from Live CAPI, so return `true`
  // `CapiBool` is either a `string` or `boolean`, so cast it as a string and compare 🤢
  const isLiveField = article.fields.isLive;
  return isLiveField === undefined || isLiveField.toString() === 'true';
};

const getArticleLabel = (article: CapiArticle) => {
  const {
    fields: { firstPublicationDate },
    sectionName,
    frontsMeta: { tone }
  } = article;
  if (!isLive(article)) {
    if (firstPublicationDate) {
      return notLiveLabels.takenDown;
    }
    return notLiveLabels.draft;
  }

  if (tone === liveBlogTones.dead || tone === liveBlogTones.live) {
    return startCase(liveBlogTones.live);
  }

  return startCase(sectionName);
};

export {
  getIdFromURL,
  getThumbnailFromElements,
  getThumbnail,
  getContributorImage,
  getPrimaryTag,
  getArticleLabel,
  isLive
};
