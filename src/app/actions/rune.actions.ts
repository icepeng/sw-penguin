import { Action } from '@ngrx/store';
import { Rune } from '../models/rune.model';

export enum RuneActionTypes {
  AddRune = '[Rune] Add',
}

export class AddRune implements Action {
  readonly type = RuneActionTypes.AddRune;

  constructor(public payload: Rune) {}
}

export type RuneActionsUnion = AddRune;
