import { ExternalArticle } from './ExternalArticle';
import { Collection, Card, Group, CardMeta } from 'types/Collection';
import { Actions } from 'lib/createAsyncResourceBundle';
import { copyCardImageMeta } from 'actions/Cards';
import { PageViewStory } from './PageViewData';
import { PersistMeta } from 'util/storeMiddleware';

interface CardsReceived {
  type: 'SHARED/CARDS_RECEIVED';
  payload: { [id: string]: Card };
}
interface ClearCards {
  type: 'SHARED/CLEAR_CARDS';
  payload: { ids: string[] };
}
interface GroupsReceived {
  type: 'SHARED/GROUPS_RECEIVED';
  payload: { [id: string]: Group };
}
interface UpdateCardMeta {
  type: 'SHARED/UPDATE_CARD_META';
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
  type: 'SHARED/INSERT_GROUP_CARD';
} & {
  payload: InsertCardPayload;
  meta: PersistMeta;
};

type InsertSupportingCard = {
  type: 'SHARED/INSERT_SUPPORTING_CARD';
} & {
  payload: InsertCardPayload;
  meta: PersistMeta;
};

interface RemoveCardPayload {
  payload: {
    id: string;
    cardId: string;
  };
}

type RemoveGroupCard = {
  type: 'SHARED/REMOVE_GROUP_CARD';
} & RemoveCardPayload;

type RemoveSupportingCard = {
  type: 'SHARED/REMOVE_SUPPORTING_CARD';
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
