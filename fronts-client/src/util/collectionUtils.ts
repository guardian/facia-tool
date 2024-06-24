import React from 'react';
import { ThunkResult, Dispatch } from 'types/Store';
import { PosSpec } from 'lib/dnd';
import { insertCardWithCreate } from 'actions/Cards';
import { CapiArticle } from 'types/Capi';
import { Recipe } from '../types/Recipe';
import { Chef } from '../types/Chef';
import { CardTypesMap } from 'constants/cardTypes';

export interface RefDrop {
  type: 'REF';
  data: string;
}
export interface CAPIDrop {
  type: 'CAPI';
  data: CapiArticle;
}

export interface RecipeDrop {
  type: 'RECIPE';
  data: Recipe;
}

export interface ChefDrop {
  type: 'CHEF';
  data: Chef;
}

export interface FeastCollectionDrop {
  type: 'FEAST_COLLECTION';
}

export type MappableDropType =
  | RefDrop
  | CAPIDrop
  | RecipeDrop
  | ChefDrop
  | FeastCollectionDrop;

const dropToCard = (e: React.DragEvent): MappableDropType | null => {
  const map = {
    capi: (data: string): CAPIDrop => ({
      type: 'CAPI',
      data: JSON.parse(data),
    }),
    [CardTypesMap.RECIPE]: (data: string): RecipeDrop => ({
      type: 'RECIPE',
      data: JSON.parse(data),
    }),
    [CardTypesMap.CHEF]: (data: string): ChefDrop => ({
      type: 'CHEF',
      data: JSON.parse(data),
    }),
    [CardTypesMap.FEAST_COLLECTION]: (data: string): FeastCollectionDrop => ({
      type: 'FEAST_COLLECTION',
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
    const dropType = dropToCard(e);
    if (!dropType) {
      return;
    }
    dispatch(insertCardWithCreate(to, dropType, persistTo));
  };
};

export { insertCardFromDropEvent };
