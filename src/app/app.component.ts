import { Component, OnInit, ViewChild } from '@angular/core';
import {
  MatTableDataSource,
  MatDialog,
  MatPaginator,
  MatSort,
} from '@angular/material';
import { combineLatest, map, startWith } from 'rxjs/operators';
import { RuneView } from './rune.model';
import { RuneService } from './rune.service';
import { FileDialogComponent } from './file-dialog/file-dialog.component';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
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
    'efficiency',
    'efficiency2',
    'maxEfficiency',
    'maxEfficiency2',
    'priEff',
    'prefixEff',
    'secEff',
  ];

  colors = {
    일반: '#FFF',
    마법: '#04D25F',
    희귀: '#49EED6',
    영웅: '#ED88FB',
    전설: '#FDAC51',
  };

  happyCurcuit = new FormControl(false);

  constructor(private runeService: RuneService, public dialog: MatDialog) {}

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
    this.runeService.monsterMap$
      .pipe(
        combineLatest(
          this.runeService.runes$,
          this.happyCurcuit.valueChanges.pipe(startWith(false)),
        ),
        map(([monsterMap, runes, happyCurcuit]) =>
          runes.map(rune =>
            this.runeService.getRuneView(
              happyCurcuit ? this.runeService.happyCurcuit(rune) : rune,
              monsterMap,
            ),
          ),
        ),
      )
      .subscribe(runeViews => (this.dataSource.data = runeViews));
  }

  openDialog() {
    const dialogRef = this.dialog.open(FileDialogComponent);
    dialogRef.afterClosed().subscribe(result => {
      // console.log(result);
    });
  }

  applyFilter(filter: string) {
    this.dataSource.filter = filter.trim();
  }

  trackByFn(rune: RuneView) {
    return rune.id;
  }
}
