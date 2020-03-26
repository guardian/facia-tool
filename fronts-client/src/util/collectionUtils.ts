import React from 'react';
import { ThunkResult, Dispatch } from 'types/Store';
import { PosSpec } from 'lib/dnd';
import { insertCardWithCreate } from 'actions/Cards';
import { CapiArticle } from 'types/Capi';

export interface RefDrop {
  type: 'REF';
  data: string;
}
export interface CAPIDrop {
  type: 'CAPI';
  data: CapiArticle;
}

export type MappableDropType = RefDrop | CAPIDrop;

const dropToArticle = (e: React.DragEvent): MappableDropType | null => {
  const map = {
    capi: (data: string): CAPIDrop => ({
      type: 'CAPI',
      data: JSON.parse(data),
    }),
    text: (url: string): RefDrop => ({ type: 'REF', data: url }),
  };

  for (const [type, fn] of Object.entries(map)) {
    const data = e.dataTransfer.getData(type);
    if (data) {
      return fn(data);
    }
  }

  return null;
};

const insertCardFromDropEvent = (
  e: React.DragEvent,
  to: PosSpec,
  persistTo: 'collection' | 'clipboard'
): ThunkResult<void> => {
  return (dispatch: Dispatch) => {
    const dropType = dropToArticle(e);
    if (!dropType) {
      return;
    }
    dispatch(insertCardWithCreate(to, dropType, persistTo));
  };
};

export { insertCardFromDropEvent };
