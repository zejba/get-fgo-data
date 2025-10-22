interface SkillSVal {
  Turn: number;
  Count: number;
  Value: number;
}

interface Buff {
  id: number;
}

interface SkillFunction {
  funcType: string;
  funcTargetType: string;
  funcTargetTeam: string;
  buffs: Buff[];
  svals: SkillSVal[];
}

interface NpSVal {
  Value: number;
  Correction?: number;
}

interface NpFunction {
  funcType: string;
  funcTargetType: string;
  svals: NpSVal[];
}

interface NoblePhantasm {
  card: string;
  npGain: {
    np: number[];
  };
  npDistribution: number[];
  functions: NpFunction[];
}

export interface Skill {
  id: number;
  name: string;
  functions: SkillFunction[];
}

export interface NiceJpServant {
  id: number;
  collectionNo: number;
  name: string;
  rarity: number;
  className: string;
  attribute: string;
  atkMax: number;
  atkGrowth: number[];
  starGen: number;
  hitsDistribution: {
    1: number[]; // arts
    2: number[]; // buster
    3: number[]; // quick
    4: number[]; // extra
  };
  cards: string[];
  noblePhantasms: NoblePhantasm[];
  classPassive: Skill[];
}
