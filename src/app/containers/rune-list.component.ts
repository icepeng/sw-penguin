import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSort, MatTableDataSource } from '@angular/material';
import { select, Store } from '@ngrx/store';
import { startWith, switchMap, combineLatest } from 'rxjs/operators';
import { RuneView } from '../models/rune.model';
import * as fromRoot from '../reducers';

@Component({
  selector: 'app-rune-list',
  templateUrl: './rune-list.component.html',
  styleUrls: ['./list.component.css'],
})
export class RuneListComponent implements OnInit {
  @ViewChild(MatSort)
  sort: MatSort;

  dataSource = new MatTableDataSource<RuneView>();
  displayedColumns = [
    'location',
    'set',
    'slot',
    'star',
    'upgrade',
    'rarity',
    'maxEfficiency',
    'priEff',
    'prefixEff',
    'secEff',
    'bestMonster'
  ];

  colors = {
    일반: '#FFF',
    마법: '#04D25F',
    희귀: '#49EED6',
    영웅: '#ED88FB',
    전설: '#FDAC51',
  };

  happyCurcuit = new FormControl(false);

  constructor(private store: Store<fromRoot.State>) {}

  ngOnInit() {
    this.dataSource.sort = this.sort;
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
        if (keyTrim === '위치' && data.location !== valueTrim) {
          if (valueTrim === '*' && data.location !== 'Inventory') {
            return match;
          }
          return false;
        }
        if (keyTrim === '추천몹' && data.bestMonster !== valueTrim) {
          return false;
        }
        if (keyTrim === '세트' && data.set !== valueTrim) {
          return false;
        }
        if (keyTrim === '슬롯' && data.slot !== +valueTrim) {
          if (valueTrim === '짝수' && data.slot % 2 === 0) {
            return match;
          }
          if (valueTrim === '홀수' && data.slot % 2 === 1) {
            return match;
          }
          return false;
        }
        if (keyTrim === '등급' && data.star !== +valueTrim) {
          return false;
        }
        if (keyTrim === '강화' && data.upgrade !== +valueTrim) {
          return false;
        }
        if (keyTrim === '희귀도' && data.rarity !== valueTrim) {
          return false;
        }
        if (keyTrim === '주옵' && !data.priEff.includes(valueTrim)) {
          return false;
        }
        if (keyTrim === '접두옵' && !data.prefixEff.includes(valueTrim)) {
          return false;
        }
        if (keyTrim === '부옵' && !data.secEff.includes(valueTrim)) {
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
  }

  applyFilter(filter: string) {
    this.dataSource.filter = filter.trim();
  }

  trackByFn(index: number, rune: RuneView) {
    return rune.id;
  }
}
