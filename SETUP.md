# DailySelfUpdate — 启动与部署指南

「吾日三省吾身」 · 语音优先的每日反思记录 Web 应用。

## 功能总览（已实现）

### 🔐 认证（Phase 1）
- 邮箱注册 / 登录 / 登出
- JWT access (1h) + refresh token (7d) with **rotation**
- 忘记密码 / 重置密码（链接 1h 有效，未配 SMTP 时打日志）
- 登录限流 5 次 / 15 分钟，其他认证端点 10 次 / 15 分钟
- bcrypt salt 10，refresh token 哈希存库

### 🎙️ 语音优先记录（Phase 2）
- `useVoiceInput` hook + `VoiceInput` 组件（Web Speech API，支持中文）
- 大圆形麦克风按钮 · 实时 interim transcript · 文字键盘回退
- 5 类记录：工作 / 朋友 / 伴侣 / 感恩 / 每日三省
- 每类带分类、情绪、重要性、附加字段
- 每日三省按 `(user, date)` upsert，可分早/中/晚多次填写

### 🔍 历史与数据管理（Phase 3）
- 统一时间轴（5 类合并 + cursor 分页）
- 多维筛选：日期范围 / 类型 / 情绪 / 最低重要性
- 全文 ILIKE 搜索（content / 姓名 / 标签 / 三省字段）
- 一键导出 JSON（含 exportVersion=1） / CSV
- 导入：`merge`（追加） 或 `replace`（先清空）— 事务原子保证

### 📊 智能分析（Phase 4，基于规则）
- 周总结：5 类 totals · 工作分类/情绪分布 · 平均重要性 · 朋友联系名单 · 未解决争论 · 感恩来源 · 每日评分线 · 成就与挑战
- 规则推荐：根据阈值生成中文建议（如焦虑高、评分低、未解决争论）
- 跨周趋势：4/8/12/26/52 周窗口 · 记录数趋势线 · 平均评分趋势
- 图表：Recharts 折线 / 柱 / 饼

### 🛡️ 安全（贯穿全部 Phase）
- Helmet · CORS · Zod 校验 · 参数化查询 · 严格 user_id 隔离 · onDelete: Cascade
- 生产模式拒绝启动使用默认的 JWT placeholder secrets
- 生产模式 `trust proxy=1` 适配反向代理后的限流

---

## 端口
- 前端: **3000** · 后端: **3001** · Postgres: **5432**

---

## 本地开发

### 前置依赖
- Node.js 18+ · Docker Desktop · npm 9+

### 首次启动
```bash
# 1. 启动 Postgres
docker compose up -d

# 2. 后端
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev                # http://localhost:3001

# 3. 前端 (新终端)
cd frontend
cp .env.local.example .env.local
npm install
npm run dev                # http://localhost:3000
```

### 验证
1. 打开 http://localhost:3000/register 注册账号
2. 自动登录跳转到 /dashboard
3. 点蓝色按钮「开始记录」进入今天的 record 页（Chrome/Edge/Safari 才有语音）
4. 点麦克风（首次会请求权限），说几句话 → 文字实时出现
5. 顶部导航条试一下「历史」、「设置」、「本周总结」、「趋势分析」

---

## 测试

### 端到端冒烟测试（25 个用例）
```bash
cd backend
npm run test:smoke
# → 测试覆盖 auth / records / history / search / analysis / export / import / refresh rotation
```

### Type-check
```bash
cd backend && npx tsc --noEmit
cd frontend && npx tsc --noEmit
```

### 生产构建
```bash
cd backend && npm run build       # → dist/
cd frontend && npm run build      # → .next/
```

---

## 部署（Docker Compose）

### 1. 准备环境变量
```bash
cp .env.prod.example .env

# 生成强随机密钥
echo "JWT_SECRET=$(openssl rand -base64 48)" >> .env
echo "REFRESH_TOKEN_SECRET=$(openssl rand -base64 48)" >> .env

# 编辑 .env 设置 POSTGRES_PASSWORD / FRONTEND_URL / NEXT_PUBLIC_API_BASE_URL
$EDITOR .env
```

### 2. 启动
```bash
docker compose -f docker-compose.prod.yml --env-file .env up -d --build
```

Backend 容器启动时会自动执行 `prisma migrate deploy`（只跑 `prisma/migrations/` 里已生成的迁移，不修改 schema）。

### 3. 反向代理建议
建议在 nginx/Caddy 后面：
- frontend (3000) → `your-domain.com`
- backend (3001) → `api.your-domain.com`
- 配置 HTTPS + HSTS

### 4. 验证部署
```bash
curl https://api.your-domain.com/api/health
# 应返回 {"success":true,"status":"ok",...}
```

---

## 常用命令

```bash
# 本地数据库
docker compose up -d              # 启动
docker compose down               # 停止
docker compose down -v            # 停止并清空数据
cd backend && npx prisma studio   # 可视化查看 DB
cd backend && npx prisma migrate reset  # 重置 + 重新跑迁移

# 跑冒烟测试
cd backend && npm run test:smoke

# 生产
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml restart backend
```

---

## 文件结构

```
DailySelfUpdate/
├── docker-compose.yml            # 本地开发：仅 Postgres
├── docker-compose.prod.yml       # 生产：postgres + backend + frontend
├── .env.prod.example             # 生产环境变量模板
├── SETUP.md                      # 本文件
├── backend/
│   ├── Dockerfile                # 多阶段构建
│   ├── prisma/schema.prisma      # 8 张表
│   ├── src/
│   │   ├── config/               # env, prisma
│   │   ├── utils/                # logger, jwt, password, mailer, errors, date helpers
│   │   ├── middleware/           # auth, validate, errorHandler, rateLimit
│   │   ├── services/             # authService, recordsService, historyService, dataService, analysisService
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── app.ts
│   │   └── server.ts
│   └── scripts/smoke.sh          # 端到端冒烟测试
└── frontend/
    ├── Dockerfile
    ├── app/
    │   ├── (auth)/login, register, forgot-password, reset-password
    │   └── (dashboard)/dashboard, record/[date], history, summary/[week], analysis, settings
    ├── components/
    │   ├── ui/                   # button, input, card, tabs, star-rating, ...
    │   ├── voice/VoiceInput.tsx  # 核心语音组件
    │   ├── records/              # 5 种记录表单
    │   ├── analysis/Charts.tsx   # Recharts 包装
    │   └── AuthGuard.tsx
    ├── hooks/useVoiceInput.ts    # Web Speech API hook
    ├── lib/                      # api client, authApi, recordsApi, historyApi, dataApi, analysisApi
    └── store/authStore.ts        # Zustand + persist
```

---

## 浏览器兼容性

| 功能 | Chrome | Edge | Safari | Firefox |
|---|---|---|---|---|
| 全站 | ✓ | ✓ | ✓ | ✓ |
| **语音输入** | ✓ | ✓ | ✓ | ✗ |

VoiceInput 会自动检测并在 Firefox 上显示提示。文字键盘输入始终可用。

---

## 路线图（未实施）

可选的后续工作（按文档原始路线图，但产品已可用）：
- AI 智能分析（接 Claude API 或 OpenAI 替换规则推荐）
- 第三方登录（Google / Apple）
- 邮箱验证流程
- 照片附件上传（gratitude.photoUrl 已在 schema 里）
- 地理位置（gratitude.location_* 已在 schema 里）
- 浏览器通知（早/中/晚提醒）
- 日历视图（目前是时间轴）
- PWA / 离线支持
- E2E 测试（Playwright）

---

## HTTPS 部署（Caddy 自动证书，语音功能必需）

语音识别（Web Speech API）只在 HTTPS 或 localhost 下可用。生产用 Caddy
自动申请 Let's Encrypt 证书，并在单域名上做路径分流。

### 前提
- 一个域名，A 记录指向服务器公网 IP
- 大陆服务器用标准 443 端口需 ICP 备案；用高端口（如 :8443）通常免备案

### 步骤（服务器上）
```bash
cd ~/Projects/DailySelfUpdate
git pull

# 1. 前端必须用相对路径 /api（同源，免 CORS），并设 HTTPS 域名
#    编辑 .env：
#      NEXT_PUBLIC_API_BASE_URL=/api
#      FRONTEND_URL=https://yourdomain.com        （或 https://yourdomain.com:8443）
#      SITE_ADDRESS=yourdomain.com                （或 yourdomain.com:8443）
nano .env

# 2. 带 Caddy 一起启动（叠加 caddy overlay）
docker compose -f docker-compose.prod.yml -f docker-compose.caddy.yml --env-file .env up -d --build

# 3. Caddy 会自动申请证书（首次几十秒）。验证：
curl -I https://yourdomain.com
```

之后访问 `https://yourdomain.com`，语音功能即可用。

> 注意：改了 `NEXT_PUBLIC_API_BASE_URL` 必须重新 build 前端（它是构建期注入的）。
> 上面命令带了 `--build` 会自动重建。
