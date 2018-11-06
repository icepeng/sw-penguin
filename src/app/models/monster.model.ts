import { EFFECT_TYPE } from './rune.model';

export class Monster {
  id: string;
  masterId: string;
  masterName: string;
  atk: number;
  accuracy: number;
  def: number;
  con: number;
  criticalDamage: number;
  criticalRate: number;
  spd: number;
  resist: number;
  star: 1 | 2 | 3 | 4 | 5 | 6;
  level: number;
  runes: number[];
  effectiveList: EFFECT_TYPE[];
}
