import { Action } from '@ngrx/store';
import { Monster } from '../models/monster.model';
import { Update } from '@ngrx/entity';

export enum MonsterActionTypes {
  AddMonster = '[Monster] Add',
  UpdateMonster = '[Monster] Update',
}

export class AddMonster implements Action {
  readonly type = MonsterActionTypes.AddMonster;

  constructor(public payload: Monster) {}
}

export class UpdateMonster implements Action {
  readonly type = MonsterActionTypes.UpdateMonster;

  constructor(public payload: Update<Monster>) {}
}

export type MonsterActionsUnion = AddMonster | UpdateMonster;
