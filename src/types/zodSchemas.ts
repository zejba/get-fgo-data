import { z } from 'zod';

const skillSValSchema = z.object({
  Turn: z.number().optional(),
  Count: z.number().optional(),
  Value: z.number().optional()
});

const buffSchema = z.object({
  id: z.number()
});

const skillFunctionSchema = z.object({
  funcType: z.string(),
  funcTargetType: z.string(),
  funcTargetTeam: z.string(),
  buffs: z.array(buffSchema),
  svals: z.array(skillSValSchema)
});

const npSValSchema = z.object({
  Value: z.number().optional(),
  Correction: z.number().optional()
});

const npFunctionSchema = z.object({
  funcType: z.string(),
  funcTargetType: z.string(),
  svals: z.array(npSValSchema)
});

const noblePhantasmSchema = z.object({
  card: z.enum(['1', '2', '3']),
  npGain: z.object({
    np: z.array(z.number())
  }),
  npDistribution: z.array(z.number()),
  functions: z.array(npFunctionSchema)
});

const skillSchema = z.object({
  id: z.number(),
  name: z.string(),
  functions: z.array(skillFunctionSchema)
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
