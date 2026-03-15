import fs from 'fs';
const file = 'src/store/gameStore.ts';
let code = fs.readFileSync(file, 'utf8');

// 使用正则匹配从 selectRole 开始，直到 nextPlayer 之前的所有代码
const regex = /selectRole:\s*\(roleType\)\s*=>\s*\{[\s\S]*?nextPlayer:\s*\(\)\s*=>/m;

// 替换为干净的统一逻辑
const cleanCode = `selectRole: (roleType) => {
    const state = get();
    const role = state.roles.find(r => r.type === roleType);
    if (role && !role.selected) {
      set((s) => ({
        selectedRole: roleType,
        roles: s.roles.map(r => r.type === roleType ? { ...r, selected: true, isTaken: true } : r)
      }));
    }
  },

  nextPlayer: () =>`;

code = code.replace(regex, cleanCode);
fs.writeFileSync(file, code);
console.log('✅ 毒瘤已切除！selectRole 语法完全修复。');
