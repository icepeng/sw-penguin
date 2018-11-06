import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Rune } from '../models/rune.model';
import {
  ImportActionsUnion,
  ImportActionTypes,
} from '../actions/import.actions';
import { RuneActionsUnion, RuneActionTypes } from '../actions/rune.actions';

export interface State extends EntityState<Rune> {}

export const adapter: EntityAdapter<Rune> = createEntityAdapter<Rune>({
  selectId: (rune: Rune) => rune.id,
  sortComparer: false,
});

export const initialState: State = adapter.getInitialState({});

export function reducer(
  state = initialState,
  action: ImportActionsUnion | RuneActionsUnion,
): State {
  switch (action.type) {
    case ImportActionTypes.Import: {
      return adapter.addAll(action.payload.runes, state);
    }

    case RuneActionTypes.AddRune: {
      return adapter.addOne(action.payload, state);
    }

    default: {
      return state;
    }
  }
}
