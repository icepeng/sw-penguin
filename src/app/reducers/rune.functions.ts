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
      priEff: `${runeMapping.effectNames[rune.priEff.type]} + ${
        rune.priEff.amount
      }`,
      prefixEff: rune.prefixEff.type
        ? `${runeMapping.effectNames[rune.prefixEff.type]} + ${
            rune.prefixEff.amount
          }`
        : ``,
      secEff: rune.secEff
        .map(
          x =>
            `${runeMapping.effectNames[x.type]} + ${x.amount}` +
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
      priEff: `${runeMapping.effectNames[best.maxRune.priEff.type]} + ${best.maxRune.priEff.amount}`,
      prefixEff: best.maxRune.prefixEff.type
        ? `${runeMapping.effectNames[best.maxRune.prefixEff.type]} + ${best.maxRune.prefixEff.amount}`
        : ``,
      secEff: best.maxRune.secEff
        .map(
          x =>
            `${runeMapping.effectNames[x.type]} + ${x.amount}` +
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
      'HP_PERCENT',
      'ATK_PERCENT',
      'DEF_PERCENT',
      'SPD',
      'CRIT_RATE',
      'CRIT_DMG',
      'RES',
      'ACC',
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
    (rune.slot === 1 && type === 'DEF_PERCENT') ||
    (rune.slot === 3 && type === 'ATK_PERCENT') ||
    rune.priEff.type === type
  );
}

export function happyCurcuit(rune: Rune, effective: EFFECT_TYPE[]): Rune {
  if (rune.upgrade >= 12) {
    return {
      ...rune,
      priEff: {
        type: rune.priEff.type,
        amount: runeMapping.mainstat[rune.priEff.type].max[rune.star],
      },
      upgrade: 15,
      rarity: 'Legendary',
    };
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
    'HP_PERCENT',
    'ATK_PERCENT',
    'DEF_PERCENT',
    'SPD',
    'CRIT_RATE',
    'CRIT_DMG',
    'RES',
    'ACC',
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
    rarity: 'Legendary',
  };
}

export function getMainNumbers(
  rune: Rune,
  effective: EFFECT_TYPE[],
): { numerator: number; denominator: number } {
  if (rune.slot % 2 !== 0) {
    return {
      numerator: 0,
      denominator: 0,
    };
  }
  const possiblePrimaries = effective.filter(
    x => runeMapping.slotMainStats[rune.slot][x],
  );
  if (possiblePrimaries.length === 0) {
    return {
      numerator: 0,
      denominator: 0,
    };
  }
  const denominator = Math.max(
    ...possiblePrimaries.map(
      x => runeMapping.mainstat[x].max[6] / runeMapping.substat[x].max[6],
    ),
  );
  if (possiblePrimaries.includes(rune.priEff.type)) {
    return {
      numerator:
        runeMapping.mainstat[rune.priEff.type].max[rune.star] /
        runeMapping.substat[rune.priEff.type].max[6],
      denominator,
    };
  }
  return {
    numerator: 0,
    denominator,
  };
}

export function getSubNumbers(
  rune: Rune,
  effective: EFFECT_TYPE[],
): { numerator: number; denominator: number } {
  let numerator = 0.0;
  const possibleEffective = effective.filter(x => !isImpossible(rune, x));
  rune.secEff
    .filter(x => possibleEffective.includes(x.type))
    .forEach(stat => {
      numerator +=
        (stat.grindAmount && stat.grindAmount > 0
          ? stat.amount + stat.grindAmount
          : stat.amount) / runeMapping.substat[stat.type].max[6];
    });

  if (rune.prefixEff && possibleEffective.includes(rune.prefixEff.type)) {
    numerator +=
      rune.prefixEff.amount / runeMapping.substat[rune.prefixEff.type].max[6];
  }

  const denominator =
    Math.min(possibleEffective.length, 1) * 0.8 +
    Math.min(possibleEffective.length, 5) * 0.2;
  return {
    numerator,
    denominator,
  };
}

export function getEfficiency(rune: Rune, effective: EFFECT_TYPE[]) {
  const mainNumbers = getMainNumbers(rune, effective);
  const subNumbers = getSubNumbers(rune, effective);
  return (
    (mainNumbers.numerator + subNumbers.numerator) /
    (mainNumbers.denominator + subNumbers.denominator)
  );
}
