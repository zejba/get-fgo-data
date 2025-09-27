export type ParsedServant = {
  id: number;
  collectionNo: number;
  name: string;
  rarity: number;
  className: string;
  attribute: string;
  atkMax: number;
  atk120: number;
  starGen: number;
  npGain: number;
  hitCounts: {
    buster: number;
    arts: number;
    quick: number;
    extra: number;
    np: number;
  };
  noblePhantasm: {
    card: string;
    value: number;
  };
  classPassive: {
    type: string;
    value: number;
    turn: number;
    count: number;
  }[];
};
