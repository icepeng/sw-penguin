export type SET_TYPE =
  | 'Energy'
  | 'Guard'
  | 'Swift'
  | 'Blade'
  | 'Rage'
  | 'Focus'
  | 'Endure'
  | 'Fatal'
  | 'Despair'
  | 'Vampire'
  | 'Violent'
  | 'Nemesis'
  | 'Will'
  | 'Shield'
  | 'Revenge'
  | 'Destroy'
  | 'Fight'
  | 'Determination'
  | 'Enhance'
  | 'Accuracy'
  | 'Tolerance'
  | 'Immemorial';

export type EFFECT_TYPE =
  | 'HP_FLAT'
  | 'HP_PERCENT'
  | 'ATK_FLAT'
  | 'ATK_PERCENT'
  | 'DEF_FLAT'
  | 'DEF_PERCENT'
  | 'SPD'
  | 'CRIT_RATE'
  | 'CRIT_DMG'
  | 'RES'
  | 'ACC';

export type RARITY_TYPE = 'Common' | 'Magic' | 'Rare' | 'Hero' | 'Legendary';

export const ALL_SETS: SET_TYPE[] = [
  'Energy',
  'Guard',
  'Swift',
  'Blade',
  'Rage',
  'Focus',
  'Endure',
  'Fatal',
  'Despair',
  'Vampire',
  'Violent',
  'Nemesis',
  'Will',
  'Shield',
  'Revenge',
  'Destroy',
  'Fight',
  'Determination',
  'Enhance',
  'Accuracy',
  'Tolerance',
  'Immemorial',
];

export const ALL_EFFECTS: EFFECT_TYPE[] = [
  'HP_FLAT',
  'HP_PERCENT',
  'ATK_FLAT',
  'ATK_PERCENT',
  'DEF_FLAT',
  'DEF_PERCENT',
  'SPD',
  'CRIT_RATE',
  'CRIT_DMG',
  'RES',
  'ACC',
];

export interface Rune {
  id: number;
  occupiedId: number;
  star: number;
  priEff: {
    type: EFFECT_TYPE;
    amount: number;
  };
  prefixEff: {
    type: EFFECT_TYPE;
    amount: number;
  };
  secEff: {
    type: EFFECT_TYPE;
    amount: number;
    enchantType: EFFECT_TYPE;
    grindAmount: number;
  }[];
  slot: 1 | 2 | 3 | 4 | 5 | 6;
  set: SET_TYPE;
  upgrade: number;
  rarity: RARITY_TYPE;
}

export interface RuneView {
  id: number;
  set: SET_TYPE;
  upgrade: number;
  rarity: RARITY_TYPE;
  star: number;
  slot: 1 | 2 | 3 | 4 | 5 | 6;
  priEff: string;
  prefixEff: string;
  secEff: string;
  location: string;
  maxEfficiency: number;
  bestMonster: string;
}
