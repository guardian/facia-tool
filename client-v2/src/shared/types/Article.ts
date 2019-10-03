import { CapiArticleFields } from 'types/Capi';
import { ExternalArticle } from './ExternalArticle';
import { $Diff } from 'utility-types';
import { ArticleFragmentRootFields, ArticleFragmentMeta } from './Collection';

type DerivedArticle = Partial<
  $Diff<
    ExternalArticle,
    { fields: unknown; frontsMeta?: unknown; type: unknown }
  >
> &
  Partial<$Diff<CapiArticleFields, { isLive?: unknown }>> &
  ArticleFragmentRootFields &
  ArticleFragmentMeta & {
    thumbnail?: string | undefined;
    cutoutThumbnail?: string | undefined;
    kicker?: string;
    pickedKicker?: string;
    isLive: boolean;
    tone: string | undefined;
    hasMainVideo: boolean;
  };

export { DerivedArticle };
