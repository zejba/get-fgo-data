interface DataVal {
  Turn?: number;
  Count?: number;
  Value?: number;
  Correction?: number;
}

interface Buff {
  id: number;
}

interface Func {
  funcType: string;
  funcTargetType: string;
  funcTargetTeam: string;
  buffs: Buff[];
  svals: DataVal[];
}

export interface NoblePhantasm {
  card: '1' | '2' | '3';
  name: string;
  npGain: {
    buster: number[];
    arts: number[];
    quick: number[];
    extra: number[];
    np: number[];
  };
  npDistribution: number[];
  functions: Func[];
}

export interface Skill {
  id: number;
  name: string;
  functions: Func[];
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
    '1': number[]; // arts
    '2': number[]; // buster
    '3': number[]; // quick
    '4': number[]; // extra
  };
  cards: string[];
  noblePhantasms: NoblePhantasm[];
  classPassive: Skill[];
}
