import { getServantDataFromAtlas } from './getServantDataFromAtlas.js';
import { ParsedServant } from './types/parsedServant.js';
import * as core from '@actions/core';
import fs from 'fs';

async function run() {
  const path = core.getInput('servantDataJSONPath', { required: true });
  core.info(`対象ファイル: ${path}`);

  const oldJson = fs.readFileSync(path, 'utf-8');
  const oldData = JSON.parse(oldJson);
  if (!Array.isArray(oldData)) {
    throw new Error('JSONファイルの形式が不正です');
  }
  if (oldData.length > 0 && Number.isNaN(oldData[oldData.length - 1]?.collectionNo)) {
    throw new Error('JSONファイルの形式が不正です');
  }
  const lastCollectionNo: number = oldData[oldData.length - 1]?.collectionNo ?? 0;

  const newData: ParsedServant[] = [];
  for (let collectionNo = lastCollectionNo + 1; ; collectionNo++) {
    const data = await getServantDataFromAtlas(collectionNo);
    if (!data) break;
    core.info(`新しいサーヴァントを取得: ${data.map((s) => s.name).join(', ')}`);
    newData.push(...data);
  }
  if (newData.length === 0) {
    core.info('新しいデータは見つかりませんでした');
    return;
  }

  const json = JSON.stringify([...oldData, ...newData], null, 2);
  fs.writeFileSync(path, json, 'utf-8');
  core.info(`${newData.length}件の新しいサーヴァントを追加しました`);
}

try {
  await run();
} catch (e) {
  core.setFailed(e instanceof Error ? e.message : String(e));
}
