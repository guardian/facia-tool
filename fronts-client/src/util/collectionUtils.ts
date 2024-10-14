import React from 'react';
import { ThunkResult, Dispatch } from 'types/Store';
import { PosSpec } from 'lib/dnd';
import { insertCardWithCreate } from 'actions/Cards';
import { CapiArticle } from 'types/Capi';
import { Recipe } from '../types/Recipe';
import { Chef } from '../types/Chef';
import { CardTypesMap } from 'constants/cardTypes';
import { Card } from '../types/Collection';

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
	data: Card;
}

export type MappableDropType =
	| RefDrop
	| CAPIDrop
	| RecipeDrop
	| ChefDrop
	| FeastCollectionDrop;

const dropToCardMap = {
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
		data: JSON.parse(data),
	}),
	text: (url: string): RefDrop => ({ type: 'REF', data: url }),
};

export type InsertDropType = keyof typeof dropToCardMap;

const dropToCard = (e: React.DragEvent): MappableDropType | null => {
	for (const [type, fn] of Object.entries(dropToCardMap)) {
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
	persistTo: 'collection' | 'clipboard',
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
