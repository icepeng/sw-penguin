import { runeMapping } from '../mapping';
import { Monster } from '../models/monster.model';
import { EFFECT_TYPE, Rune, RuneView } from '../models/rune.model';

function isImpossible(rune: Rune, type: EFFECT_TYPE) {
  return (
    (rune.slot === 1 && type === '방퍼') ||
    (rune.slot === 3 && type === '공퍼') ||
    rune.priEff.type === type
  );
}

export function buildRuneView(
  rune: Rune,
  monsterEntities: { [id: number]: Monster },
): RuneView {
  const monster = monsterEntities[rune.occupiedId];
  const happyRune = happyCurcuit(rune);
  const eff = getEfficiency(rune);
  const happyEff = getEfficiency(happyRune);
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

export function happyCurcuit(
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
    .filter(type => !isImpossible(rune, type))
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
    .filter(type => !isImpossible(rune, type))
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

export function getEfficiency(
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
    ratio += rune.prefixEff.amount / runeMapping.fullStat[rune.prefixEff.type];
  }

  rune.secEff.filter(x => effective.includes(x.type)).forEach(eff => {
    const value = eff.amount + (eff.grindAmount || 0);
    ratio += value / runeMapping.fullStat[eff.type];
  });

  ratio /= runeMapping.slotDiv[rune.slot];

  return ratio;
}
