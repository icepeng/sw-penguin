import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import * as MonsterActions from '../actions/monster.actions';
import * as fromRoot from '../reducers';

@Injectable()
export class MonsterEffects {
  @Effect({ dispatch: false })
  save$: Observable<any> = this.actions$.pipe(
    ofType<MonsterActions.UpdateMonster>(
      MonsterActions.MonsterActionTypes.UpdateMonster,
    ),
    switchMap(() => this.store.select(fromRoot.getAllMonsters)),
    tap(monsters =>
      localStorage.setItem(
        'eff',
        JSON.stringify(
          monsters
            .filter(x => x.effectiveList.length > 0)
            .map(monster => [monster.id, monster.effectiveList]),
        ),
      ),
    ),
  );

  constructor(private actions$: Actions, private store: Store<any>) {}
}
