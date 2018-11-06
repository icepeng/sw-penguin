import { Action } from '@ngrx/store';
import { Monster } from '../models/monster.model';

export enum MonsterActionTypes {
  AddMonster = '[Monster] Add',
}

export class AddMonster implements Action {
  readonly type = MonsterActionTypes.AddMonster;

  constructor(public payload: Monster) {}
}

export type MonsterActionsUnion = AddMonster;
