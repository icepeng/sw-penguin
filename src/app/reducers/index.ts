import {
  ActionReducer,
  ActionReducerMap,
  createFeatureSelector,
  createSelector,
  MetaReducer,
} from '@ngrx/store';
import { storeFreeze } from 'ngrx-store-freeze';
import { environment } from '../../environments/environment';
import * as fromRunes from './rune.reducer';
import * as fromMonsters from './monster.reducer';
import { buildRuneView, happyCurcuit } from './rune.functions';

/**
 * As mentioned, we treat each reducer like a table in a database. This means
 * our top level state interface is just a map of keys to inner state types.
 */
export interface State {
  runes: fromRunes.State;
  monsters: fromMonsters.State;
}

export const reducers: ActionReducerMap<State> = {
  runes: fromRunes.reducer,
  monsters: fromMonsters.reducer,
};

// console.log all actions
export function logger(reducer: ActionReducer<State>): ActionReducer<State> {
  return (state: State, action: any): any => {
    const result = reducer(state, action);
    console.groupCollapsed(action.type);
    console.log('prev state', state);
    console.log('action', action);
    console.log('next state', result);
    console.groupEnd();

    return result;
  };
}

export const metaReducers: MetaReducer<State>[] = !environment.production
  ? [logger, storeFreeze]
  : [];

export const getRunesState = createFeatureSelector<State, fromRunes.State>(
  'runes',
);

export const {
  selectIds: getRuneIds,
  selectEntities: getRuneEntities,
  selectAll: getAllRunes,
  selectTotal: getTotalRunes,
} = fromRunes.adapter.getSelectors(getRunesState);

export const getMonstersState = createFeatureSelector<
  State,
  fromMonsters.State
>('monsters');

export const {
  selectIds: getMonsterIds,
  selectEntities: getMonsterEntities,
  selectAll: getAllMonsters,
  selectTotal: getTotalMonsters,
} = fromMonsters.adapter.getSelectors(getMonstersState);

export const getRuneViews = createSelector(
  getMonsterEntities,
  getAllRunes,
  (monsterEntities, runes) =>
    runes.map(rune => buildRuneView(rune, monsterEntities)),
);
