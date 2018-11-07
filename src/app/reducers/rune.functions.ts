import { runeMapping } from '../mapping';
import { Monster } from '../models/monster.model';
import { EFFECT_TYPE, Rune, RuneView } from '../models/rune.model';

export function buildRuneView(
  rune: Rune,
  monsterEntities: { [id: number]: Monster },
): { actual: RuneView; best: RuneView } {
  const monster = monsterEntities[rune.occupiedId];
  const best = bestMatch(rune, Object.values(monsterEntities));
  return {
    actual: {
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
      maxEfficiency: best.maxEff,
      bestMonster: best.monster ? best.monster.masterName : 'None',
      location: monster ? monster.masterName : 'Inventory',
    },
    best: {
      id: best.maxRune.id,
      set: best.maxRune.set,
      rarity: best.maxRune.rarity,
      star: best.maxRune.star,
      upgrade: best.maxRune.upgrade,
      slot: best.maxRune.slot,
      priEff: `${best.maxRune.priEff.type} + ${best.maxRune.priEff.amount}`,
      prefixEff: best.maxRune.prefixEff.type
        ? `${best.maxRune.prefixEff.type} + ${best.maxRune.prefixEff.amount}`
        : ``,
      secEff: best.maxRune.secEff
        .map(
          x =>
            `${x.type} + ${x.amount}` +
            (x.grindAmount ? `(+${x.grindAmount})` : ''),
        )
        .join(', '),
      maxEfficiency: best.maxEff,
      bestMonster: best.monster ? best.monster.masterName : 'None',
      location: monster ? monster.masterName : 'Inventory',
    },
  };
}

export function bestMatch(rune: Rune, monsters: Monster[]) {
  const checkMonsters = monsters.filter(x => x.effectiveList.length > 0);
  if (checkMonsters.length === 0) {
    const defaultEffective = [
      '체퍼',
      '공퍼',
      '방퍼',
      '공속',
      '치확',
      '치피',
      '효저',
      '효적',
    ] as EFFECT_TYPE[];
    const maxRune = happyCurcuit(rune, defaultEffective);
    const maxEff = getEfficiency(maxRune, defaultEffective);
    return {
      monster: null,
      maxRune,
      maxEff,
    };
  }
  return checkMonsters
    .map(monster => {
      const maxRune = happyCurcuit(rune, monster.effectiveList);
      const maxEff = getEfficiency(maxRune, monster.effectiveList);
      return {
        monster,
        maxRune,
        maxEff,
      };
    })
    .sort((a, b) => b.maxEff - a.maxEff)[0];
}

function isImpossible(rune: Rune, type: EFFECT_TYPE) {
  return (
    (rune.slot === 1 && type === '방퍼') ||
    (rune.slot === 3 && type === '공퍼') ||
    rune.priEff.type === type
  );
}

export function happyCurcuit(rune: Rune, effective: EFFECT_TYPE[]): Rune {
  if (rune.upgrade === 15) {
    return rune;
  }

  const existingPriority = effective
    .filter(type => rune.secEff.find(x => x.type === type))
    .sort((a, b) => {
      return (
        runeMapping.substat[b].max[rune.star] / runeMapping.substat[b].max[6] -
        runeMapping.substat[a].max[rune.star] / runeMapping.substat[a].max[6]
      );
    });
  const newPriority = effective
    .filter(
      type => ![...rune.secEff, rune.prefixEff].find(x => x.type === type),
    )
    .filter(type => !isImpossible(rune, type))
    .sort((a, b) => {
      return (
        runeMapping.substat[b].max[rune.star] / runeMapping.substat[b].max[6] -
        runeMapping.substat[a].max[rune.star] / runeMapping.substat[a].max[6]
      );
    });

  ([
    '체퍼',
    '공퍼',
    '방퍼',
    '공속',
    '치확',
    '치피',
    '효저',
    '효적',
  ] as EFFECT_TYPE[]).forEach(x => {
    if (isImpossible(rune, x)) {
      return;
    }
    if (effective.includes(x)) {
      return;
    }
    newPriority.push(x);
  });

  const upgradeFrom = Math.min(Math.floor(rune.upgrade / 3), 4);
  const secEffLines = rune.secEff.length;
  const upgradeExisting = Math.max(secEffLines - upgradeFrom, 0);
  const upgradeNew = 4 - upgradeFrom - upgradeExisting;

  const secEff = rune.secEff.map(x => ({ ...x }));
  if (upgradeExisting > 0) {
    const toUpgrade =
      secEff.find(x => x.type === existingPriority[0]) || secEff[0];
    toUpgrade.amount +=
      runeMapping.substat[toUpgrade.type].max[rune.star] *
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

export function getEfficiency(rune: Rune, effective: EFFECT_TYPE[]) {
  const possibleEffective = effective.filter(x => !isImpossible(rune, x));
  const divider = 0.8 + Math.min(possibleEffective.length, 5) * 0.2;

  let ratio = 0.0;

  if (rune.slot === 2 || rune.slot === 4 || rune.slot === 6) {
    if (effective.includes(rune.priEff.type)) {
      ratio +=
        runeMapping.mainstat[rune.priEff.type].max[rune.star] /
          runeMapping.mainstat[rune.priEff.type].max[6];
    }
    ratio -= 1;
  }

  rune.secEff.filter(x => possibleEffective.includes(x.type)).forEach(stat => {
    const value =
      stat.grindAmount && stat.grindAmount > 0
        ? stat.amount + stat.grindAmount
        : stat.amount;
    ratio += value / runeMapping.substat[stat.type].max[6];
  });

  if (rune.prefixEff && possibleEffective.includes(rune.prefixEff.type)) {
    ratio +=
      rune.prefixEff.amount / runeMapping.substat[rune.prefixEff.type].max[6];
  }

  return ratio / divider;
}
