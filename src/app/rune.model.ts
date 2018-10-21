export type SET_TYPE =
  | '활력'
  | '수호'
  | '신속'
  | '칼날'
  | '격노'
  | '집중'
  | '인내'
  | '맹공'
  | '절망'
  | '흡혈'
  | '폭주'
  | '응보'
  | '의지'
  | '보호'
  | '반격'
  | '파괴'
  | '투지'
  | '결의'
  | '고양'
  | '명중'
  | '근성';

export type EFFECT_TYPE =
  | '깡체'
  | '체퍼'
  | '깡공'
  | '공퍼'
  | '깡방'
  | '방퍼'
  | '공속'
  | '치확'
  | '치피'
  | '효저'
  | '효적';

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
  rarity: string;
}

export interface RuneView {
  id: number;
  set: SET_TYPE;
  upgrade: number;
  rarity: string;
  star: number;
  slot: 1 | 2 | 3 | 4 | 5 | 6;
  priEff: string;
  prefixEff: string;
  secEff: string;
  location: string;
  efficiency: number;
  maxEfficiency: number;
  maxEfficiency2: number;
  efficiency1: number;
  efficiency2: number;
  efficiency3: number;
  efficiency4: number;
}
