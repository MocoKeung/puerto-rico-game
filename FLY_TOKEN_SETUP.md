# Fly.io API Token 設置指南

## 🔑 你的 Token
```
FlyV1 fm2_lJPECAAAAAAAEl3WxBBYlWKL+nzmhnh85H94ZmJUwrVodHRwczovL2FwaS5mbHkuaW8vdjGUAJLOABdXxB8Lk7lodHRwczovL2FwaS5mbHkuaW8vYWFhL3YxxDxsLokPFrPOBXdrUfwyh/tWcbbBY7H6jb9PbcR1RpQiG91IoWyQPM0pHKAqlDdC+iKw/ECRuecyEOg4uhXETsOCsuIujIOIWsa/UA51CI/bNgS4vgXdpgGGSmOk8uc8tPPCI67naTbgDw/s/D/75zRRxEKyGWw6UvchBimzFKKv8tbf5Ffhfe15y5l9hMQgqLkkfIHntYoL/1pDpCIF8jWEza/oZVRC0y6Yr7Ldx3A=,fm2_lJPETsOCsuIujIOIWsa/UA51CI/bNgS4vgXdpgGGSmOk8uc8tPPCI67naTbgDw/s/D/75zRRxEKyGWw6UvchBimzFKKv8tbf5Ffhfe15y5l9hMQQ2GGkhrfT9l8sc7N1MMstKsO5aHR0cHM6Ly9hcGkuZmx5LmlvL2FhYS92MZgEks5pspK3zwAAAAElqrDVF84AFmGqCpHOABZhqgzEEHsHSywh6dYDFUl1WIMbRqPEIIvoj1HAOnXwYFKgsuqTQpjYumWu5CGf+6uc0Vzsee/x
```

## ⚠️ 安全警告
**這個 Token 可以在任何地方以你的身份控制 Fly.io！**
- ❌ 不要在聊天中分享
- ✅ 立即添加到 GitHub Secrets
- ✅ 不要在代碼中硬編碼

## 設置步驟

### 1. GitHub Secrets 設置
1. 前往: https://github.com/MocoKeung/puerto-rico-game/settings/secrets/actions
2. 點擊 "New repository secret"
3. Name: `FLY_API_TOKEN`
4. Value: 上面的 Token
5. 點擊 "Add secret"

### 2. 創建 Fly.io 應用（首次）
```bash
# 安裝 flyctl（如果還沒安裝）
curl -L https://fly.io/install.sh | sh

# 登入（使用 Token）
flyctl auth token < 你的_token

# 進入後端目錄
cd backend

# 創建應用
flyctl launch --name puerto-rico-backend --region sin --no-deploy

# 部署
flyctl deploy
```

### 3. 驗證部署
部署成功後會輸出：
```
https://puerto-rico-backend.fly.dev
```

## 🔧 自動部署
配置完畢後，每次推送代碼到 GitHub：
```bash
git push origin master
```
GitHub Actions 會自動部署到 Fly.io！