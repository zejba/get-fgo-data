import fs from 'fs';
import { getServantDataFromAtlas } from './getServantDataFromAtlas.js';
import { ParsedServant } from './types/parsedServant.js';

const path = 'target_repository/data/servant_data.csv';

async function updateOldServantsCsv() {
  const csvContent = fs.readFileSync(path, 'utf-8');
  const oldData = csvContent.split('\n').map((line) => line.trim().split(','));

  const lastId = oldData[oldData.length - 1]?.[0]?.split('-')[0];
  if (!lastId) {
    throw new Error('CSVファイルが空です');
  }
  const newData: string[][] = [];

  for (let collectionNo = parseInt(lastId) + 1; ; collectionNo++) {
    const servantData = await getServantDataFromAtlas(collectionNo);
    if (!servantData) break;
    console.log('新しいサーヴァントを取得:', servantData.map((s) => s.name).join(', '));
    newData.push(
      ...servantData.map((s, index) => {
        const collectionNo2 = servantData.length > 1 ? `${collectionNo}-${index + 1}` : collectionNo.toString();
        return convertToCsvLine(s, collectionNo2);
      })
    );
  }

  if (newData.length === 0) {
    console.log('新しいデータは見つかりませんでした');
    return;
  }

  const allData = oldData.concat(newData);
  // 列の長さを揃える
  const maxColumns = Math.max(...allData.map((line) => line.length));
  const paddedData = allData.map((line) => {
    const newLine = [...line];
    while (newLine.length < maxColumns) {
      newLine.push('');
    }
    return newLine;
  });

  // CSVに書き込む
  const newCsvContent = paddedData.map((line) => line.join(',')).join('\n');
  fs.writeFileSync(path, newCsvContent, 'utf-8');

  console.log(`CSVファイルを更新しました: ${newData.length}件の新しいサーヴァントを追加`);
}

function convertToCsvLine(servantData: ParsedServant, collectionNo: string): string[] {
  return [
    collectionNo,
    servantData.anotherVersionName ? `${servantData.name}(${servantData.anotherVersionName})` : servantData.name,
    servantData.rarity.toString(),
    servantData.className === 'moonCancer'
      ? 'mooncancer'
      : servantData.className === 'alterEgo'
        ? 'alterego'
        : servantData.className,
    servantData.attribute,
    servantData.atkMax.toString(),
    servantData.atk120.toString(),
    servantData.noblePhantasm.card[0] || 'b',
    servantData.noblePhantasm.value.toString(),
    servantData.npGain.toString(),
    servantData.starGen.toString(),
    servantData.hitCounts.buster.toString(),
    servantData.hitCounts.arts.toString(),
    servantData.hitCounts.quick.toString(),
    servantData.hitCounts.extra.toString(),
    servantData.hitCounts.np.toString(),
    servantData.classPassive.length.toString(),
    ...servantData.classPassive.flatMap((skill) => [typeConverter[skill.type]!, skill.value.toString()])
  ];
}

const typeConverter: Record<string, string> = {
  atkBuff: 'atk_buff',
  busterBuff: 'b_buff',
  busterPowerBuff: 'b_power_buff',
  artsBuff: 'a_buff',
  artsPowerBuff: 'a_power_buff',
  quickBuff: 'q_buff',
  quickPowerBuff: 'q_power_buff',
  extraBuff: 'ex_buff',
  noblePhantasmBuff: 'np_buff',
  criticalBuff: 'cr_buff',
  busterCriticalBuff: 'b_cr_buff',
  artsCriticalBuff: 'a_cr_buff',
  quickCriticalBuff: 'q_cr_buff',
  damagePlus: 'damage_plus',
  npGetBuff: 'npget_buff',
  starGetBuff: 'starget_buff'
};

updateOldServantsCsv().catch((err) => {
  console.error(err);
  process.exit(1);
});
