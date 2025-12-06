import { Skill } from './types/atlasAcademyResponses';
import { ParsedServant } from './types/others';
import { niceJpServantSchema, NiceJpServantValidated } from './types/zodSchemas';

export async function getServantDataFromAtlas(collectionNo: number) {
  const url = `https://api.atlasacademy.io/nice/JP/servant/${collectionNo}?lore=false`;
  const response = await fetch(url);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error('Failed to fetch servant data');

  const rawData = await response.json();
  const parseResult = niceJpServantSchema.safeParse(rawData);

  if (!parseResult.success) {
    throw new Error(`Invalid servant data format: ${parseResult.error.message}`);
  }

  const data = parseResult.data;
  const nps = getNoblePhantasms(data.noblePhantasms);
  if (nps.size === 1) {
    return [parseServant(data, Array.from(nps.values())[0]!, data.id.toString(), undefined)];
  }
  let result: ParsedServant[] = [];
  let index = 1;
  for (const [key, np] of nps) {
    const id = `${data.id}-${index}`;
    index++;
    result.push(parseServant(data, np, id, key));
  }
  return result;
}

// 色・単体/全体の組み合わせで最も高いダメージを与えるNPを取得
function getNoblePhantasms(noblePhantasms: NiceJpServantValidated['noblePhantasms']) {
  const nps: Map<string, NiceJpServantValidated['noblePhantasms'][number]> = new Map();

  for (const np of noblePhantasms) {
    const npFunc = np.functions.find((f) => f.funcType.startsWith('damageNp'));
    if (!npFunc) {
      continue;
    }
    const color = np.card === '2' ? 'B' : np.card === '1' ? 'A' : 'Q';
    const target = npFunc.funcTargetType === 'enemy' ? '単' : '全';
    const key = `${color}${target}`;
    const existingNp = nps.get(key);
    if (!existingNp) {
      nps.set(key, np);
    }
    const npValue = npFunc.svals[npFunc.svals.length - 1]!.Value ?? 0;
    const existingNpValue = existingNp
      ? (existingNp.functions.find((f) => f.funcType.startsWith('damageNp'))?.svals.slice(-1)[0]?.Value ?? 0)
      : 0;
    if (npValue > existingNpValue) {
      nps.set(key, np);
    }
  }
  if (nps.size === 0 && noblePhantasms.length > 0) {
    nps.set('補助', noblePhantasms[noblePhantasms.length - 1]!);
  }
  return nps;
}

function parseServant(
  data: NiceJpServantValidated,
  noblePhantasm: NiceJpServantValidated['noblePhantasms'][number],
  id: string,
  anotherVersionName: string | undefined
): ParsedServant {
  const damageNp = noblePhantasm.functions.find((f) => f.funcType.startsWith('damageNp'));
  return {
    aaId: data.id,
    id,
    collectionNo: data.collectionNo,
    anotherVersionName,
    name: data.name,
    rarity: data.rarity,
    className: data.className.startsWith('beast') ? 'beast' : data.className,
    attribute: data.attribute,
    atkMax: data.atkMax,
    atk120: data.atkGrowth[data.atkGrowth.length - 1]!,
    starGen: data.starGen / 10,
    npGain: noblePhantasm.npGain.np[0]! / 100,
    hitCounts: {
      buster: data.hitsDistribution[2].length,
      arts: data.hitsDistribution[1].length,
      quick: data.hitsDistribution[3].length,
      extra: data.hitsDistribution[4].length,
      np: damageNp ? noblePhantasm.npDistribution.length : 0
    },
    noblePhantasm: {
      card: noblePhantasm.card === '2' ? 'buster' : noblePhantasm.card === '1' ? 'arts' : 'quick',
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
    (f) =>
      ['self', 'ptAll', 'ptFull'].includes(f.funcTargetType) && ['player', 'playerAndEnemy'].includes(f.funcTargetTeam)
  );
  return funcs.flatMap((func) => {
    return func.buffs.flatMap((buff) => {
      const usedForCalcBuff = usedForCalcBuffs.find((b) => b.id === buff.id);
      if (!usedForCalcBuff) return [];
      const lastSval = func.svals[func.svals.length - 1]!;
      const value = usedForCalcBuff.type === 'damagePlus' ? (lastSval.Value ?? 0) : (lastSval.Value ?? 0) / 10;
      return {
        type: usedForCalcBuff.type,
        value,
        turn: lastSval.Turn ?? -1,
        count: lastSval.Count ?? -1
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
