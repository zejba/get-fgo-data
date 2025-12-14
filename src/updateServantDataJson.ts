import { getServantDataFromAtlas } from './getServantDataFromAtlas';
import { ParsedServant } from './types/parsedServant';
import fs from 'fs';

const path = 'target_repository/src/data/servant_data.json';

async function main() {
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
    console.log('新しいサーヴァントを取得:', data.map((s) => s.name).join(', '));
    newData.push(...data);
  }
  if (newData.length === 0) {
    console.log('新しいデータは見つかりませんでした');
    return;
  }

  const json = JSON.stringify([...oldData, ...newData], null, 2);
  fs.writeFileSync(path, json, 'utf-8');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
