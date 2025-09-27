import { NiceJpServant, Skill } from './types/atlasAcademyResponses';
import { ParsedServant } from './types/others';

export async function getServantDataFromAtlas(collectionNo: number) {
  const url = `https://api.atlasacademy.io/nice/JP/servant/${collectionNo}?lore=false`;
  const response = await fetch(url);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error('Failed to fetch servant data');
  const data = (await response.json()) as NiceJpServant;
  return parseServant(data);
}

function parseServant(data: NiceJpServant): ParsedServant {
  const lastNoblePhantasm = data.noblePhantasms[data.noblePhantasms.length - 1]!;
  const damageNp = lastNoblePhantasm.functions.find((f) => f.funcType.startsWith('damageNp'));
  return {
    id: data.id,
    collectionNo: data.collectionNo,
    name: data.name,
    rarity: data.rarity,
    className: data.className.startsWith('beast') ? 'beast' : data.className,
    attribute: data.attribute,
    atkMax: data.atkMax,
    atk120: data.atkGrowth[data.atkGrowth.length - 1]!,
    starGen: data.starGen / 10,
    npGain: lastNoblePhantasm.npGain.np[0]! / 100,
    hitCounts: {
      buster: data.hitsDistribution.buster.length,
      arts: data.hitsDistribution.arts.length,
      quick: data.hitsDistribution.quick.length,
      extra: data.hitsDistribution.extra.length,
      np: lastNoblePhantasm.npDistribution.length
    },
    noblePhantasm: {
      card: lastNoblePhantasm.card,
      value: (damageNp?.svals[damageNp.svals.length - 1]!.Value ?? 0) / 10
    },
    classPassive: combineClassPassive(data.classPassive.flatMap(parseClassPassive))
  };
}

// 同じtype・turn・countのバフが複数ある場合、値を足し合わせる
function combineClassPassive(passives: ParsedServant['classPassive']) {
  const map = new Map<string, ParsedServant['classPassive'][number]>();
  for (const passive of passives) {
    const key = `${passive.type}-${passive.turn}-${passive.count}`;
    const existing = map.get(key);
    if (existing) {
      existing.value += passive.value;
    } else {
      map.set(key, { ...passive });
    }
  }
  return Array.from(map.values());
}

function parseClassPassive(skill: Skill) {
  const funcs = skill.functions.filter(
    (f) => ['self', 'ptAll'].includes(f.funcTargetType) && ['player', 'playerAndEnemy'].includes(f.funcTargetTeam)
  );
  return funcs.flatMap((func) => {
    return func.buffs.flatMap((buff) => {
      const usedForCalcBuff = usedForCalcBuffs.find((b) => b.id === buff.id);
      if (!usedForCalcBuff) return [];
      const lastSval = func.svals[func.svals.length - 1]!;
      const value = usedForCalcBuff.type === 'damagePlus' ? lastSval.Value : lastSval.Value / 10;
      return {
        type: usedForCalcBuff.type,
        value,
        turn: lastSval.Turn,
        count: lastSval.Count
      };
    });
  });
}

const usedForCalcBuffs = [
  {
    id: 126,
    type: 'atkBuff'
  },
  {
    id: 102,
    type: 'busterBuff'
  },
  {
    id: 30052,
    type: 'busterPowerBuff'
  },
  {
    id: 101,
    type: 'artsBuff'
  },
  {
    id: 30051,
    type: 'artsPowerBuff'
  },
  {
    id: 100,
    type: 'quickBuff'
  },
  {
    id: 30050,
    type: 'quickPowerBuff'
  },
  {
    id: 2537,
    type: 'extraBuff'
  },
  {
    id: 138,
    type: 'noblePhantasmBuff'
  },
  {
    id: 142,
    type: 'criticalBuff'
  },
  {
    id: 952,
    type: 'busterCriticalBuff'
  },
  {
    id: 1624,
    type: 'artsCriticalBuff'
  },
  {
    id: 389,
    type: 'quickCriticalBuff'
  },
  {
    id: 136,
    type: 'damagePlus'
  },
  {
    id: 140,
    type: 'npGetBuff'
  },
  {
    id: 117,
    type: 'starGetBuff'
  }
];
