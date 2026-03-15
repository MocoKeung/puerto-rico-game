import fs from 'fs';

// 1. 修复 PlayerPanel.tsx 的智障 import
const ppPath = 'src/components/PlayerPanel.tsx';
let ppCode = fs.readFileSync(ppPath, 'utf8');
ppCode = ppCode.replace('import { useGameStore from type ResourceType }', 'import useGameStore, { type ResourceType }');
fs.writeFileSync(ppPath, ppCode);

// 2. 修复 gameStore.ts 第 134 行的提前闭合
const gsPath = 'src/store/gameStore.ts';
let gsCode = fs.readFileSync(gsPath, 'utf8');
gsCode = gsCode.replace('},);', '},');
fs.writeFileSync(gsPath, gsCode);

console.log('✅ 隐藏的语法内伤已全部清除！准备起飞...');
