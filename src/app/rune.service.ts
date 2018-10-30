import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { monsterMapping, runeMapping } from './mapping';
import { Monster } from './monster.model';
import { EFFECT_TYPE, Rune, RuneView } from './rune.model';

@Injectable({
  providedIn: 'root',
})
export class RuneService {
  runes$: BehaviorSubject<Rune[]>;
  monsterMap$: BehaviorSubject<Map<number, Monster>>;

  constructor() {
    this.runes$ = new BehaviorSubject([]);
    this.monsterMap$ = new BehaviorSubject(new Map());
  }

  import(data): void {
    const monsterMap = new Map<number, Monster>(
      data.unit_list.map(x => [x.unit_id, this.assignMonster(x)]),
    );
    const monsterRunes = data.unit_list
      .reduce((arr, x) => [...arr, ...x.runes], [])
      .map(x => this.assignRune(x));
    const inventoryRunes = data.runes.map(x => this.assignRune(x));
    this.monsterMap$.next(monsterMap);
    this.runes$.next([...monsterRunes, ...inventoryRunes]);
  }

  assignMonster(data): Monster {
    return {
      id: data.unit_id,
      masterId: data.unit_master_id,
      masterName: this.getMonsterName(data.unit_master_id),
      level: data.unit_level,
      atk: data.atk,
      con: data.con,
      def: data.def,
      spd: data.spd,
      accuracy: data.accuracy,
      resist: data.resist,
      criticalRate: data.critical_rate,
      criticalDamage: data.critical_damage,
      runes: data.runes.map(x => x.rune_id),
    };
  }

  assignRune(data): Rune {
    return {
      id: data.rune_id,
      slot: data.slot_no,
      occupiedId: data.occupied_id,
      star: data.class,
      rarity: runeMapping.rarity[data.rank],
      set: runeMapping.sets[data.set_id],
      upgrade: data.upgrade_curr,
      priEff: {
        type: runeMapping.effectTypes[data.pri_eff[0]],
        amount: data.pri_eff[1],
      },
      prefixEff: {
        type: runeMapping.effectTypes[data.prefix_eff[0]],
        amount: data.prefix_eff[1],
      },
      secEff: data.sec_eff.map(s => ({
        type: runeMapping.effectTypes[s[0]],
        amount: s[1],
        enchantType: runeMapping.effectTypes[s[2]],
        grindAmount: s[3],
      })),
    };
  }

  getMonsterName(id: number) {
    if (monsterMapping.names[id]) {
      return monsterMapping.names[id];
    }
    const family = Number(id.toString().substr(0, 3));

    if (monsterMapping.names[family]) {
      const attribute = Number(id.toString().slice(-1));
      return `${monsterMapping.names[family]} (${
        monsterMapping.attributes[attribute]
      })`;
    }
    return 'Unknown Monster';
  }

  getRuneView(rune: Rune, monsterMap: Map<number, Monster>): RuneView {
    const monster = monsterMap.get(rune.occupiedId);
    const happyRune = this.happyCurcuit(rune);
    const eff = this.getEfficiency(rune);
    const happyEff = this.getEfficiency(happyRune);
    return {
      id: rune.id,
      set: rune.set,
      rarity: rune.rarity,
      star: rune.star,
      upgrade: rune.upgrade,
      slot: rune.slot,
      priEff: `${rune.priEff.type} + ${rune.priEff.amount}`,
      prefixEff: rune.prefixEff.type
        ? `${rune.prefixEff.type} + ${rune.prefixEff.amount}`
        : ``,
      secEff: rune.secEff
        .map(
          x =>
            `${x.type} + ${x.amount}` +
            (x.grindAmount ? `(+${x.grindAmount})` : ''),
        )
        .join(', '),
      efficiency: eff,
      maxEfficiency: happyEff,
      location: monster ? monster.masterName : 'Inventory',
    };
  }

  private isImpossible(rune: Rune, type: EFFECT_TYPE) {
    return (
      (rune.slot === 1 && type === '방퍼') ||
      (rune.slot === 3 && type === '공퍼') ||
      rune.priEff.type === type
    );
  }

  happyCurcuit(
    rune: Rune,
    effective: EFFECT_TYPE[] = [
      '체퍼',
      '공퍼',
      '방퍼',
      '공속',
      '치확',
      '치피',
      '효저',
      '효적',
    ],
  ): Rune {
    if (rune.upgrade === 15) {
      return rune;
    }

    const upgradeFrom = Math.min(Math.floor(rune.upgrade / 3), 4);
    const secEffLines = rune.secEff.length;
    const upgradeExisting = Math.max(secEffLines - upgradeFrom, 0);
    const upgradeNew = 4 - upgradeFrom - upgradeExisting;

    const existingPriority = effective
      .filter(type => rune.secEff.find(x => x.type === type))
      .filter(type => !this.isImpossible(rune, type))
      .sort((a, b) => {
        return (
          runeMapping.substat[b].max[rune.star] / runeMapping.fullStat[b] -
          runeMapping.substat[a].max[rune.star] / runeMapping.fullStat[a]
        );
      });
    const newPriority = effective
      .filter(
        type => ![...rune.secEff, rune.prefixEff].find(x => x.type === type),
      )
      .filter(type => !this.isImpossible(rune, type))
      .sort((a, b) => {
        return (
          runeMapping.substat[b].max[rune.star] / runeMapping.fullStat[b] -
          runeMapping.substat[a].max[rune.star] / runeMapping.fullStat[a]
        );
      });

    const secEff = rune.secEff.map(x => ({ ...x }));
    if (existingPriority[0]) {
      const toUpgrade = secEff.find(x => x.type === existingPriority[0]);
      toUpgrade.amount +=
        runeMapping.substat[existingPriority[0]].max[rune.star] *
        upgradeExisting *
        0.2;
    }
    for (let i = 0; i < upgradeNew; i += 1) {
      secEff.push({
        amount: runeMapping.substat[newPriority[i]].max[rune.star] * 0.2,
        type: newPriority[i],
        enchantType: null,
        grindAmount: 0,
      });
    }
    return {
      ...rune,
      priEff: {
        type: rune.priEff.type,
        amount: runeMapping.mainstat[rune.priEff.type].max[rune.star],
      },
      secEff,
      upgrade: 15,
      rarity: '전설',
    };
  }

  getEfficiency(
    rune: Rune,
    effective: EFFECT_TYPE[] = [
      '체퍼',
      '공퍼',
      '방퍼',
      '공속',
      '치확',
      '치피',
      '효저',
      '효적',
    ],
  ) {
    let ratio = 0.0;
    if (effective.includes(rune.priEff.type)) {
      ratio += rune.priEff.amount / runeMapping.fullStat[rune.priEff.type];
    }

    if (rune.prefixEff && effective.includes(rune.prefixEff.type)) {
      ratio +=
        rune.prefixEff.amount / runeMapping.fullStat[rune.prefixEff.type];
    }

    rune.secEff.filter(x => effective.includes(x.type)).forEach(eff => {
      const value = eff.amount + (eff.grindAmount || 0);
      ratio += value / runeMapping.fullStat[eff.type];
    });

    ratio /= runeMapping.slotDiv[rune.slot];

    return ratio;
  }
}
