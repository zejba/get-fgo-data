import { getServantDataFromAtlas } from './getServantDataFromAtlas';
import { ParsedServant } from './types/others';
import fs from 'fs';

const path = 'target_repository/data/servant_data.json';

async function main() {
  const oldJson = fs.readFileSync(path, 'utf-8');
  const oldData: ParsedServant[] = JSON.parse(oldJson);
  const lastCollectionNo = oldData[oldData.length - 1]?.collectionNo;
  if (!lastCollectionNo) {
    throw new Error('JSONファイルが空です');
  }

  const newData: ParsedServant[] = [];
  for (let collectionNo = lastCollectionNo + 1; ; collectionNo++) {
    try {
      const data = await getServantDataFromAtlas(collectionNo);
      if (!data) break;
      console.log('新しいサーヴァントを取得:', data.map((s) => s.name).join(', '));
      newData.push(...data);
    } catch (e) {
      console.error(`Error fetching data for collectionNo: ${collectionNo}`, e);
    }
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
