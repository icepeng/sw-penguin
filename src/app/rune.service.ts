import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { monsterMapping, runeMapping } from './mapping';
import { Monster } from './monster.model';
import { Rune, RuneView } from './rune.model';

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
    const eff = this.getEfficiency(rune);
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
        : '',
      secEff: rune.secEff.map(x => `${x.type} + ${x.amount}`).join(', '),
      efficiency: eff.current,
      maxEfficiency: eff.max,
      maxEfficiency2: eff.max2,
      efficiency1: eff.current1,
      efficiency2: eff.current2,
      efficiency3: eff.current3,
      efficiency4: eff.current4,
      location: monster ? monster.masterName : 'Inventory',
    };
  }

  getEfficiency(rune: Rune) {
    let ratio = 0.0;

    if (rune.slot === 2 || rune.slot === 4 || rune.slot === 6) {
      ratio +=
        runeMapping.mainstat[rune.priEff.type].max[rune.star] /
        runeMapping.mainstat[rune.priEff.type].max[6];
    } else {
      ratio += 1;
    }

    const ratios = [];

    rune.secEff.forEach(stat => {
      const value =
        stat.grindAmount && stat.grindAmount > 0
          ? stat.amount + stat.grindAmount
          : stat.amount;
      ratios.push(value / runeMapping.substat[stat.type].max[6]);
    });

    if (rune.prefixEff && rune.prefixEff[0] > 0) {
      ratios.push(
        rune.prefixEff.amount / runeMapping.substat[rune.prefixEff.type].max[6],
      );
    }

    ratios.sort((a, b) => b - a);

    const current1 = ratio + (ratios[0] || 0);
    const current2 = current1 + (ratios[1] || 0);
    const current3 = current2 + (ratios[2] || 0);
    const current4 = current3 + (ratios[3] || 0);
    const current = current4 + (ratios[4] || 0);

    return {
      current: current / 2.8,
      current1: current1 / 2,
      current2: current2 / 2.2,
      current3: current3 / 2.4,
      current4: current4 / 2.6,
      max:
        current / 2.8 +
        (Math.max(Math.ceil((12 - rune.upgrade) / 3.0), 0) * 0.2) / 2.8,
      max2:
        current2 / 2.2 +
        (Math.max(Math.ceil((rune.secEff.length * 3 - rune.upgrade) / 3.0), 0) *
          0.2) /
          2.2,
    };
  }
}
