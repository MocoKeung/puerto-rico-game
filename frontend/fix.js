import fs from 'fs';
const file = 'src/store/gameStore.ts';
let code = fs.readFileSync(file, 'utf8');
code = code.replace(
  'const role = state.roles.find(r => r.type === roleType',
  `const role = state.roles.find(r => r.type === roleType);
      if (role && !role.isTaken) {
        set((s) => {
          const r = s.roles.find(r => r.type === roleType);
          if (r) r.isTaken = true;
        });
      }
    },`
);
fs.writeFileSync(file, code);
console.log('✅ gameStore.ts 内伤缝合成功！');
