import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Monster } from '../models/monster.model';
import {
  ImportActionsUnion,
  ImportActionTypes,
} from '../actions/import.actions';
import { MonsterActionsUnion, MonsterActionTypes } from '../actions/monster.actions';

export interface State extends EntityState<Monster> {
  //   selectedMonsterId: number | null;
}

export const adapter: EntityAdapter<Monster> = createEntityAdapter<Monster>({
  selectId: (monster: Monster) => monster.id,
  sortComparer: false,
});

export const initialState: State = adapter.getInitialState({
  //   selectedMonsterId: null,
});

export function reducer(
  state = initialState,
  action: ImportActionsUnion | MonsterActionsUnion,
): State {
  switch (action.type) {
    case ImportActionTypes.Import: {
      return adapter.addAll(action.payload.monsters, state);
    }

    case MonsterActionTypes.AddMonster: {
      return adapter.addOne(action.payload, state);
    }

    default: {
      return state;
    }
  }
}

// export const getSelectedId = (state: State) => state.selectedMonsterId;
