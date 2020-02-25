import { Action } from "redux";
import { ThunkResult } from "./Store";

export type RemoveActionCreator = (id: string, cardId: string) => Action;

export type InsertActionCreator = (
  id: string,
  index: number,
  cardId: string,
  persistTo: 'collection' | 'clipboard'
) => ThunkResult<void> | Action;

export type InsertThunkActionCreator = (
  persistTo: 'collection' | 'clipboard'
) => (
  id: string,
  index: number,
  cardId: string,
  removeAction?: Action
) => ThunkResult<void>;
