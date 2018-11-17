import { Injectable } from '@angular/core';
import { monsterMapping, runeMapping } from '../mapping';
import { Monster } from '../models/monster.model';
import { Rune } from '../models/rune.model';

@Injectable({
  providedIn: 'root',
})
export class ImportService {
  constructor() {}

  import(data) {
    const effectiveListMap = new Map(
      JSON.parse(localStorage.getItem('eff') || '[]'),
    );
    const monsters = data.unit_list.map(x =>
      this.assignMonster(x, effectiveListMap.get(x.unit_id) || []),
    );
    const monsterRunes = data.unit_list
      .reduce((arr, x) => [...arr, ...x.runes], [])
      .map(x => this.assignRune(x));
    const inventoryRunes = data.runes.map(x => this.assignRune(x));
    const runes = [...monsterRunes, ...inventoryRunes];
    return {
      runes,
      monsters,
    };
  }

  assignMonster(data, effectiveList): Monster {
    return {
      id: data.unit_id,
      masterId: data.unit_master_id,
      masterName: this.getMonsterName(data.unit_master_id),
      star: data.class,
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
      effectiveList: effectiveList,
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
}
