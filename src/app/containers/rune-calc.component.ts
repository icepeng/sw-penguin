import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map, withLatestFrom } from 'rxjs/operators';
import { runeMapping } from '../mapping';
import { ALL_EFFECTS, ALL_SETS, Rune, RuneView } from '../models/rune.model';
import * as fromRoot from '../reducers';
import { buildRuneView } from '../reducers/rune.functions';

@Component({
  selector: 'app-rune-calc',
  templateUrl: './rune-calc.component.html',
  styleUrls: ['./rune-calc.component.css'],
})
export class RuneCalcComponent implements OnInit {
  effectNames = runeMapping.effectNames;
  effects = ALL_EFFECTS;
  sets = ALL_SETS;
  stars = [1, 2, 3, 4, 5, 6];
  slots = [1, 2, 3, 4, 5, 6];
  upgrades = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

  formGroup = new FormGroup({
    set: new FormControl(null),
    star: new FormControl(null, Validators.required),
    upgrade: new FormControl(null, Validators.required),
    slot: new FormControl(null, Validators.required),
    priEff: new FormControl(null, Validators.required),
    priEffAmount: new FormControl(null),
    prefixEff: new FormControl(null),
    prefixEffAmount: new FormControl(null),
    secEff1: new FormControl(null),
    secEff1Amount: new FormControl(null),
    secEff2: new FormControl(null),
    secEff2Amount: new FormControl(null),
    secEff3: new FormControl(null),
    secEff3Amount: new FormControl(null),
    secEff4: new FormControl(null),
    secEff4Amount: new FormControl(null),
  });

  runeView$: Observable<RuneView>;

  constructor(private store: Store<any>) {}

  ngOnInit() {
    this.runeView$ = this.formGroup.valueChanges.pipe(
      withLatestFrom(this.store.pipe(select(fromRoot.getMonsterEntities))),
      map(([value, monsterEntities]) => {
        const rune = {
          set: value.set,
          star: value.star,
          upgrade: value.upgrade,
          slot: value.slot,
          priEff: {
            type: value.priEff,
            amount: value.priEffAmount,
          },
          prefixEff: {
            type: value.prefixEff,
            amount: value.prefixEffAmount,
          },
          secEff: [],
        } as Rune;
        if (value.secEff1 && value.secEff1Amount) {
          rune.secEff.push({
            type: value.secEff1,
            amount: value.secEff1Amount,
            enchantType: null,
            grindAmount: 0,
          });
        }
        if (value.secEff2 && value.secEff2Amount) {
          rune.secEff.push({
            type: value.secEff2,
            amount: value.secEff2Amount,
            enchantType: null,
            grindAmount: 0,
          });
        }
        if (value.secEff3 && value.secEff3Amount) {
          rune.secEff.push({
            type: value.secEff3,
            amount: value.secEff3Amount,
            enchantType: null,
            grindAmount: 0,
          });
        }
        if (value.secEff4 && value.secEff4Amount) {
          rune.secEff.push({
            type: value.secEff4,
            amount: value.secEff4Amount,
            enchantType: null,
            grindAmount: 0,
          });
        }
        try {
          return buildRuneView(rune, monsterEntities).best;
        } catch (err) {
          return null;
        }
      }),
    );
  }
}
