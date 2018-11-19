import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { combineLatest, map, startWith, withLatestFrom } from 'rxjs/operators';
import { Rune, RuneView } from '../models/rune.model';
import * as fromRoot from '../reducers';

@Component({
  selector: 'app-rune-list',
  templateUrl: './rune-list.component.html',
  styleUrls: ['./list.component.css'],
})
export class RuneListComponent implements OnInit {
  @ViewChild(MatSort)
  sort: MatSort;
  @ViewChild(MatPaginator)
  paginator: MatPaginator;

  dataSource = new MatTableDataSource<RuneView>();
  colors = {
    Common: '#FFF',
    Magic: '#04D25F',
    Rare: '#49EED6',
    Hero: '#ED88FB',
    Legendary: '#FDAC51',
  };
  displayedColumns = [
    'select',
    'location',
    'set',
    'slot',
    'star',
    'upgrade',
    'maxEfficiency',
    'priEff',
    'prefixEff',
    'secEff',
    'bestMonster',
  ];
  happyCurcuit = new FormControl(false);
  selection = new SelectionModel<number>(false);

  selectedRune$: Observable<Rune>;

  constructor(private store: Store<fromRoot.State>) {}

  ngOnInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.dataSource.filterPredicate = (data: RuneView, str: string) => {
      if (!str.trim()) {
        return true;
      }
      const filters = str.split(',');
      return filters.reduce((match, filter) => {
        const [key, value] = filter.split(':');
        if (key === undefined || value === undefined) {
          return false;
        }
        const keyTrim = key.trim();
        const valueTrim = value.trim();
        if (keyTrim === 'Location' && data.location !== valueTrim) {
          if (valueTrim === '*' && data.location !== 'Inventory') {
            return match;
          }
          return false;
        }
        if (keyTrim === 'Recommended' && data.bestMonster !== valueTrim) {
          return false;
        }
        if (keyTrim === 'Set' && data.set !== valueTrim) {
          return false;
        }
        if (keyTrim === 'Slot' && data.slot !== +valueTrim) {
          if (valueTrim === 'Even' && data.slot % 2 === 0) {
            return match;
          }
          if (valueTrim === 'Odd' && data.slot % 2 === 1) {
            return match;
          }
          return false;
        }
        if (keyTrim === 'Star' && data.star !== +valueTrim) {
          return false;
        }
        if (keyTrim === 'Upgrade' && data.upgrade !== +valueTrim) {
          return false;
        }
        if (keyTrim === 'Rarity' && data.rarity !== valueTrim) {
          return false;
        }
        if (keyTrim === 'Mainstat' && !data.priEff.includes(valueTrim)) {
          return false;
        }
        if (keyTrim === 'Innatestat' && !data.prefixEff.includes(valueTrim)) {
          return false;
        }
        if (keyTrim === 'Substats' && !data.secEff.includes(valueTrim)) {
          return false;
        }
        return match;
      }, true);
    };
    this.happyCurcuit.valueChanges
      .pipe(
        startWith(false),
        combineLatest(this.store.pipe(select(fromRoot.getRuneViews))),
      )
      .subscribe(
        ([isHappy, runeViews]) =>
          (this.dataSource.data = isHappy
            ? runeViews.map(x => x.best)
            : runeViews.map(x => x.actual)),
      );

    this.selectedRune$ = this.selection.changed.pipe(
      withLatestFrom(this.store.pipe(select(fromRoot.getRuneEntities))),
      map(
        ([change, monsterEntities]) => monsterEntities[change.added[0]] || null,
      ),
    );
  }

  applyFilter(filter: string) {
    this.dataSource.filter = filter.trim();
  }

  trackByFn(index: number, rune: RuneView) {
    return rune.id;
  }
}
