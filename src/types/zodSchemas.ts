import { z } from 'zod';

const dataValSchema = z.object({
  Turn: z.number().optional(),
  Count: z.number().optional(),
  Value: z.number().optional(),
  Correction: z.number().optional()
});

const buffSchema = z.object({
  id: z.number()
});

const funcSchema = z.object({
  funcType: z.string(),
  funcTargetType: z.string(),
  funcTargetTeam: z.string(),
  buffs: z.array(buffSchema),
  svals: z.array(dataValSchema)
});

const noblePhantasmSchema = z.object({
  card: z.enum(['1', '2', '3']),
  name: z.string(),
  npGain: z.object({
    buster: z.array(z.number()),
    arts: z.array(z.number()),
    quick: z.array(z.number()),
    extra: z.array(z.number()),
    np: z.array(z.number())
  }),
  npDistribution: z.array(z.number()),
  functions: z.array(funcSchema)
});

const skillSchema = z.object({
  id: z.number(),
  name: z.string(),
  functions: z.array(funcSchema)
});

export const niceJpServantSchema = z.object({
  id: z.number(),
  collectionNo: z.number(),
  name: z.string(),
  rarity: z.number(),
  className: z.string(),
  attribute: z.string(),
  atkMax: z.number(),
  atkGrowth: z.array(z.number()),
  starGen: z.number(),
  hitsDistribution: z.object({
    1: z.array(z.number()), // arts
    2: z.array(z.number()), // buster
    3: z.array(z.number()), // quick
    4: z.array(z.number()) // extra
  }),
  cards: z.array(z.string()),
  noblePhantasms: z.array(noblePhantasmSchema),
  classPassive: z.array(skillSchema)
});

export type NiceJpServantValidated = z.infer<typeof niceJpServantSchema>;
