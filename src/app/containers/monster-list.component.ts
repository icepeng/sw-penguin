import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatSort, MatTableDataSource } from '@angular/material';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import {
  combineLatest,
  filter,
  map,
  startWith,
  withLatestFrom,
} from 'rxjs/operators';
import { UpdateMonster } from '../actions/monster.actions';
import { Monster } from '../models/monster.model';
import { EFFECT_TYPE } from '../models/rune.model';
import * as fromRoot from '../reducers';

@Component({
  selector: 'app-monster-list',
  templateUrl: './monster-list.component.html',
  styleUrls: ['./list.component.css'],
})
export class MonsterListComponent implements OnInit {
  @ViewChild(MatSort)
  sort: MatSort;

  dataSource = new MatTableDataSource<Monster>();
  displayedColumns = ['select', 'masterName', 'star', 'level'];
  onlyRune = new FormControl(true);
  selection = new SelectionModel<number>(false);

  selectedMonster$: Observable<Monster>;

  formGroup = new FormGroup({
    공퍼: new FormControl(false),
    체퍼: new FormControl(false),
    방퍼: new FormControl(false),
    공속: new FormControl(false),
    치확: new FormControl(false),
    치피: new FormControl(false),
    효적: new FormControl(false),
    효저: new FormControl(false),
  });

  constructor(private store: Store<fromRoot.State>) {}

  ngOnInit() {
    this.dataSource.sort = this.sort;

    this.onlyRune.valueChanges
      .pipe(startWith(true))
      .pipe(combineLatest(this.store.pipe(select(fromRoot.getAllMonsters))))
      .subscribe(
        ([onlyRune, monsters]) =>
          (this.dataSource.data = onlyRune
            ? monsters.filter(x => x.runes.length > 0)
            : monsters),
      );

    this.selectedMonster$ = this.selection.changed.pipe(
      withLatestFrom(this.store.pipe(select(fromRoot.getMonsterEntities))),
      map(
        ([change, monsterEntities]) => monsterEntities[change.added[0]] || null,
      ),
    );

    this.selectedMonster$.pipe(filter(x => !!x)).subscribe(monster =>
      this.formGroup.reset(
        monster.effectiveList.reduce(
          (obj, effect) => {
            obj[effect] = true;
            return obj;
          },
          {
            공퍼: false,
            체퍼: false,
            방퍼: false,
            공속: false,
            치확: false,
            치피: false,
            효적: false,
            효저: false,
          },
        ),
        { emitEvent: false },
      ),
    );

    this.formGroup.valueChanges.subscribe(res =>
      this.store.dispatch(
        new UpdateMonster({
          id: this.selection.selected[0],
          changes: {
            effectiveList: Object.entries(res)
              .filter(([key, value]) => !!value)
              .map(([key]) => key) as EFFECT_TYPE[],
          },
        }),
      ),
    );
  }

  applyFilter(filterString: string) {
    this.dataSource.filter = filterString.trim();
  }

  trackByFn(index: number, monster: Monster) {
    return monster.id;
  }
}
