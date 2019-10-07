import { ExternalArticle } from './ExternalArticle';
import { Collection, Card, Group, CardMeta } from './Collection';
import { Actions } from 'lib/createAsyncResourceBundle';
import { copyCardImageMeta } from 'shared/actions/Cards';
import { PageViewStory } from './PageViewData';

interface CardsReceived {
  type: 'SHARED/ARTICLE_FRAGMENTS_RECEIVED';
  payload: { [id: string]: Card };
}
interface ClearCards {
  type: 'SHARED/CLEAR_ARTICLE_FRAGMENTS';
  payload: { ids: string[] };
}
interface GroupsReceived {
  type: 'SHARED/GROUPS_RECEIVED';
  payload: { [id: string]: Group };
}
interface UpdateCardMeta {
  type: 'SHARED/UPDATE_ARTICLE_FRAGMENT_META';
  payload: {
    id: string;
    meta: CardMeta;
    merge: boolean;
  };
}

interface InsertCardPayload {
  id: string;
  index: number;
  cardId: string;
}

type InsertGroupCard = {
  type: 'SHARED/INSERT_GROUP_ARTICLE_FRAGMENT';
} & {
  payload: InsertCardPayload;
};

type InsertSupportingCard = {
  type: 'SHARED/INSERT_SUPPORTING_ARTICLE_FRAGMENT';
} & {
  payload: InsertCardPayload;
};

interface RemoveCardPayload {
  payload: {
    id: string;
    cardId: string;
  };
}

type RemoveGroupCard = {
  type: 'SHARED/REMOVE_GROUP_ARTICLE_FRAGMENT';
} & RemoveCardPayload;

type RemoveSupportingCard = {
  type: 'SHARED/REMOVE_SUPPORTING_ARTICLE_FRAGMENT';
} & RemoveCardPayload;

interface CapGroupSiblings {
  type: 'SHARED/CAP_GROUP_SIBLINGS';
  payload: {
    id: string;
    collectionCap: number;
  };
}

interface MaybeAddFrontPublicationDate {
  type: 'SHARED/MAYBE_ADD_FRONT_PUBLICATION';
  payload: {
    id: string;
    date: number;
  };
}

type CopyCardImageMeta = ReturnType<typeof copyCardImageMeta>;

interface PageViewDataRequested {
  type: 'PAGE_VIEW_DATA_REQUESTED';
  payload: {
    frontId: string;
  };
}

interface PageViewDataReceived {
  type: 'PAGE_VIEW_DATA_RECEIVED';
  payload: {
    data: PageViewStory[];
    frontId: string;
    collectionId: string;
    clearPreviousData: boolean;
  };
}

type Action =
  | GroupsReceived
  | InsertGroupCard
  | InsertSupportingCard
  | RemoveGroupCard
  | RemoveSupportingCard
  | Actions<ExternalArticle>
  | Actions<Collection>
  | CardsReceived
  | ClearCards
  | UpdateCardMeta
  | MaybeAddFrontPublicationDate
  | CapGroupSiblings
  | CopyCardImageMeta
  | PageViewDataRequested
  | PageViewDataReceived;

export {
  Action,
  InsertGroupCard,
  InsertSupportingCard,
  RemoveGroupCard,
  RemoveSupportingCard,
  CardsReceived,
  ClearCards,
  UpdateCardMeta,
  InsertCardPayload,
  RemoveCardPayload,
  CapGroupSiblings,
  MaybeAddFrontPublicationDate,
  PageViewDataRequested,
  PageViewDataReceived
};
