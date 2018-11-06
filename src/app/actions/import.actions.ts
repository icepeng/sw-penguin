import { Action } from '@ngrx/store';
import { Monster } from '../models/monster.model';
import { Rune } from '../models/rune.model';

export enum ImportActionTypes {
  Import = '[Import] Import',
}

export class Import implements Action {
  readonly type = ImportActionTypes.Import;

  constructor(public payload: { runes: Rune[]; monsters: Monster[] }) {}
}

export type ImportActionsUnion = Import;
