# DailySelfUpdate · 架构与研发流程

> 本文档说明项目从**资源申请 → 准备 → 开发 → 迭代 → 部署 → 上线**的完整流程，
> 并附运行时系统架构与 AI Agent 辅助研发流程分析。所有图为 Mermaid，GitHub 可直接渲染。

---

## 1. 全流程总览（资源 → 开发 → 部署 → 上线）

```mermaid
flowchart TD
    subgraph A[资源申请与准备]
        A1[需求文档<br/>README + 开发指南] --> A2[技术栈选型<br/>Next.js+Express+Prisma+PG]
        A2 --> A3[本地环境<br/>Node / Docker]
        A2 --> A4[AI 资源<br/>GLM网关 / 智谱CogView]
        A2 --> A5[域名 dailyselfupdate.online]
        A2 --> A6[腾讯云服务器 101.34.205.4]
    end

    subgraph B[开发与迭代 - AI Agent 主导]
        B1[需求澄清<br/>AskUserQuestion] --> B2[Plan 模式<br/>探索+设计+计划]
        B2 --> B3[编码实现<br/>Edit / Write]
        B3 --> B4[类型检查<br/>tsc --noEmit]
        B4 --> B5[隔离验证<br/>真实API / 冒烟测试 / DB直查]
        B5 -->|不通过| B3
        B5 -->|通过| B6[git commit]
    end

    subgraph C[版本与同步]
        C1[GitHub 仓库<br/>dreamforever1996] --> C2[git push origin main]
    end

    subgraph D[部署与上线]
        D1[服务器 cron 每分钟轮询] --> D2[deploy.sh<br/>加速镜像 git pull]
        D2 -->|有更新| D3[docker compose<br/>build + up -d]
        D3 --> D4[Postgres + Backend + Frontend 容器]
        D4 --> D5[公网 IP / Tailscale Funnel]
        D5 --> D6[HTTPS 待配 Caddy<br/>语音功能依赖]
    end

    A4 --> B3
    A6 --> D1
    B6 --> C2
    C2 -.加速镜像.-> D2
    D6 --> E[用户访问]
    E -.反馈 / 新需求.-> B1

    style B fill:#e0f0ff
    style D fill:#fff0e0
```

**过程说明**：
- **资源准备**：需求文档定方向，技术栈一次性敲定；其中**域名、服务器、各类 AI key 必须人工申请**（要登录控制台 / 充值 / 实名），是 Agent 无法自动完成的边界。
- **开发迭代**：由 AI Agent 主导，"澄清 → 计划 → 编码 → 检查 → 验证"形成闭环，验证不过自动退回重改。
- **同步**：本地 push 到 GitHub；国内服务器拉取走加速镜像（直连 GitHub 不稳）。
- **部署**：服务器 cron 每分钟跑 `deploy.sh`，检测到新 commit 才重建容器（无更新即跳过，省资源）。
- **上线 → 反馈**：用户使用后提出新需求，回到澄清环，形成持续迭代。

---

## 2. 单次迭代的 Agent 工作循环

```mermaid
flowchart LR
    U[用户提需求] --> Q{需求清晰?}
    Q -->|否| ASK[AskUserQuestion<br/>多选澄清]
    ASK --> Q
    Q -->|是| EXP[Explore Agent<br/>调研现有代码]
    EXP --> REUSE{有可复用?}
    REUSE -->|是| CODE[复用现有模式编码]
    REUSE -->|否| CODE2[新建模块]
    CODE --> TC[tsc 类型检查]
    CODE2 --> TC
    TC -->|报错| FIX[修复] --> TC
    TC -->|通过| VERIFY[隔离验证<br/>真key调AI / curl / DB查]
    VERIFY -->|失败| FIX
    VERIFY -->|通过| PUSH[commit + push]
    PUSH --> DEPLOY[cron 自动部署]
    DEPLOY --> U

    style ASK fill:#ffe0e0
    style EXP fill:#e0ffe0
    style VERIFY fill:#e0e0ff
```

**过程说明**：每个功能（如"每日书句""AI 整理""书籍弹窗"）都走这个环——先澄清产品决策，再探索可复用资产（避免重复造轮子），编码后必经类型检查 + 隔离验证（用真实 GLM 网关 token 跑、curl 端到端、psql 直查），通过才提交。

---

## 3. 运行时系统架构（部署后拓扑）

```mermaid
flowchart TD
    User[用户浏览器] -->|HTTPS 待配| FE[Frontend 容器<br/>Next.js :3000]
    FE -->|/api 同源代理| BE[Backend 容器<br/>Express :3001]
    BE --> PG[(Postgres :5432<br/>8 张表)]
    BE -->|按用户 tier 路由| AI{AI Provider 抽象}
    AI -->|VIP / 默认| GLM[GLM 网关<br/>Anthropic 协议]
    AI -->|文生图| COG[智谱 CogView]
    AI -.调用失败回退.-> RULE[规则 / 兜底金句]
    BE --> JWT[JWT 鉴权<br/>access 1h + refresh 30d]
    BE --> UP[/api/uploads<br/>封面图本地存储/]

    style AI fill:#f0e0ff
    style PG fill:#e0ffe0
```

**过程说明**：
- 前端 Next.js 与后端 Express 分容器，前端用相对路径 `/api` 同源调后端（免 CORS）。
- 后端按用户 **tier（free/vip）** 路由到不同 AI provider；AI 全部带超时 + **失败优雅回退**（规则推荐 / 兜底金句），保证核心功能永不因 AI 挂掉。
- 文生图（周总结封面）走智谱 CogView，生成后下载存本地 `/api/uploads`，避免远程 URL 过期。

---

## 4. 是否符合 AI Agent 辅助研发通用流程？

### 实际遵循的流程
```
需求澄清 → 代码探索 → 计划先行 → 增量编码 → 类型检查 → 隔离验证 → 提交 → 自动部署 → 用户反馈 → 下一轮
```

### 对比通用做法

| 环节 | 业界 AI Agent 通用做法 | 本项目 | 评价 |
|---|---|---|---|
| 需求澄清 | 对话式追问 | AskUserQuestion 多选确认 | 标准 |
| 代码探索 | 语义检索 / RAG | Explore agent + grep | 标准 |
| 计划先行 | Plan / think 模式 | Plan mode + 写计划文件 | 标准 |
| 增量编码 | 小步 diff | Edit / Write | 标准 |
| 验证 | 跑测试 / 类型检查 | tsc + 真实 API 隔离测试 + DB 直查 | **优于平均** |
| 版本控制 | git + PR + review | git，直接 push main，无 PR/CI | 偏简化 |
| 部署 | CI/CD 流水线（推模式） | cron 轮询 + deploy.sh（拉模式） | 非主流但务实 |

### 核心差别（4 点）

1. **验证更扎实**：通用流程常止步"能编译"，本项目每次用真实 key 隔离测 + curl 端到端 + psql 直查，比平均严谨。
2. **缺正式 CI/CD 与测试门禁**：无 GitHub Actions、无 PR review、`smoke.sh` 靠手动跑。个人项目够用，团队/生产级偏弱。
3. **拉模式部署**：cron 每分钟拉取（被动、有延迟），是国内服务器连 GitHub 不稳的务实妥协；通用做法是 webhook/Actions 推模式（即时）。
4. **人在环路位置**：人深度参与**外部资源申请/配置**（域名、服务器、AI key、实名充值）——这是 AI Agent 当前的硬边界。

### 结论
**开发-迭代环（澄清→探索→计划→编码→验证→提交）= 当下 AI Agent 辅助研发的标准范式**，验证环节做得更严。
差距集中在**工程化基础设施层**：缺 CI/CD 自动门禁、缺测试覆盖、用拉模式部署——是本项目定位（个人、快速迭代、国内服务器约束）下的合理取舍。
若向团队/生产级演进，补齐 **GitHub Actions（lint + test + build 门禁）+ webhook 推部署 + 单元/E2E 测试** 即可对齐工业级通用流程。
