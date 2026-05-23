# DailySelfUpdate - 项目开发导航

> **快速开始指南** - 本文档为Claude AI开发助手提供清晰的项目导航和开发指令

## 🎯 项目核心信息

**项目名称**: DailySelfUpdate (每日自我更新)  
**核心理念**: "吾日三省吾身" - 通过每日反思记录和智能总结，帮助用户实现自我成长和情感管理  
**核心特色**: 语音优先的交互方式，让记录变得轻松自然

---

## 📖 文档导航

### 主要文档
1. **[产品开发完整需求文档.md](./产品开发完整需求文档.md)** - 详细的产品需求、功能设计、技术架构
2. **[claude-development-prompt.md](./claude-development-prompt.md)** - 完整的开发指南，包含所有技术实现细节

### 快速链接
- [技术栈选择](#技术栈选择)
- [开发优先级](#开发优先级)
- [核心功能](#核心功能)
- [数据库设计](#数据库设计)
- [API设计](#api设计)

---

## 🛠️ 技术栈选择

### 前端技术栈
```json
{
  "framework": "Next.js 14+ (App Router)",
  "language": "TypeScript",
  "ui_library": "shadcn/ui",
  "styling": "Tailwind CSS",
  "state_management": "Zustand",
  "forms": "React Hook Form + Zod",
  "date_handling": "date-fns",
  "charts": "Recharts",
  "http_client": "Axios",
  "voice_input": "Web Speech API",
  "animations": "Framer Motion"
}
```

### 后端技术栈
```json
{
  "runtime": "Node.js 18+",
  "framework": "Express.js",
  "language": "TypeScript",
  "orm": "Prisma",
  "database": "PostgreSQL",
  "authentication": "JWT (jsonwebtoken)",
  "password_encryption": "bcrypt",
  "validation": "Zod",
  "logging": "Winston",
  "file_upload": "Multer",
  "email_service": "Nodemailer"
}
```

---

## 📅 开发优先级

### Phase 1: 基础功能 (Week 1-2)
**目标**: 搭建基础框架，实现用户认证
- ✅ 项目初始化（前端+后端）
- ✅ 数据库设计与配置
- ✅ 用户注册功能
- ✅ 用户登录功能
- ✅ JWT认证系统
- ✅ 基础UI界面

### Phase 2: 核心记录功能 (Week 3-4)
**目标**: 实现每日记录功能和语音交互
- ✅ 语音输入组件（Web Speech API）
- ✅ 工作记录功能（3件事/天）
- ✅ 朋友记录功能（3件事/天）
- ✅ 伴侣记录功能（3件事/天）
- ✅ 感恩记录功能（3件事/天）
- ✅ 每日三省功能
- ✅ 智能分类和建议

### Phase 3: 智能分析 (Week 5-6)
**目标**: 实现数据分析和可视化
- ✅ 周总结自动生成
- ✅ AI智能分析
- ✅ 数据可视化图表
- ✅ 趋势分析
- ✅ 个性化建议

### Phase 4: 优化完善 (Week 7-8)
**目标**: 优化体验，测试部署
- ✅ 性能优化
- ✅ 安全加固
- ✅ 单元测试
- ✅ 集成测试
- ✅ E2E测试
- ✅ 部署上线

---

## 🎨 核心功能

### 1. 用户认证系统
**功能列表**:
- 邮箱注册/登录
- JWT token认证
- 密码重置（邮件）
- 第三方登录（Google, Apple）
- 记住我功能
- 语音辅助登录

**关键API**:
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

### 2. 语音优先交互系统
**核心特性**:
- Web Speech API集成
- 实时语音转文字
- 智能语音引导
- 语音命令支持
- 多语言支持（中文/英文）
- 错误处理和重试

**关键组件**:
- `useVoiceInput` Hook
- `VoiceInput` 组件
- `VoiceGuide` 系统

### 3. 每日记录系统
**记录类型**:
- **工作记录** (3件事/天)
  - 智能分类（成就/挑战/学习/日常）
  - 情绪标签（满意/焦虑/平静/兴奋）
  - 重要性评分（1-5星）
  - 时间花费记录

- **朋友记录** (3件事/天)
  - 互动类型（聊天/见面/通话/消息）
  - 关系健康度分析
  - 重要日期提醒

- **伴侣记录** (3件事/天)
  - 互动类型（共处时光/对话/争论/支持）
  - 冲突解决追踪
  - 亲密度评分

- **感恩记录** (3件事/天)
  - 分类（自然/人物/成就/时刻/健康）
  - 影响力评分
  - 照片/视频附件
  - 地点标记

- **每日三省**
  - 早晨：今日目标和期待
  - 中午：进度检查和调整
  - 晚上：总结反思和感恩

**关键API**:
```
GET /api/records/daily/:date
POST /api/records/work
POST /api/records/friend
POST /api/records/partner
POST /api/records/gratitude
POST /api/records/reflection
```

### 4. 历史记录与数据管理
**功能列表**:
- 时间轴查看
- 日历视图
- 全文搜索
- 多维度筛选
- 数据导出（JSON/CSV/PDF）
- 数据导入
- 自动备份
- 一键恢复

**关键API**:
```
GET /api/records/history
GET /api/records/search
POST /api/data/export
POST /api/data/import
GET /api/data/backups
```

### 5. 智能总结与分析系统
**分析维度**:
- **工作分析**
  - 完成率统计
  - 效率趋势
  - 挑战识别
  - 改进建议

- **人际关系分析**
  - 互动频率
  - 关系健康度
  - 质量评估
  - 维护建议

- **感恩分析**
  - 幸福来源
  - 积极因素
  - 影响力评分
  - 感恩习惯

- **情绪分析**
  - 情绪分布
  - 压力水平
  - 幸福指数
  - 趋势预测

- **成长追踪**
  - 新技能学习
  - 习惯养成
  - 目标进度
  - 个人洞察

**关键API**:
```
GET /api/analysis/weekly/:weekStart
POST /api/analysis/generate-weekly
GET /api/analysis/trends
GET /api/analysis/insights
```

---

## 🗄️ 数据库设计

### 核心表结构
```sql
-- 用户表
users (id, email, username, password_hash, email_verified, avatar_url, created_at, updated_at, last_login_at)

-- 用户偏好表
user_preferences (user_id, language, timezone, theme, voice_enabled, voice_language, reminder_morning, reminder_noon, reminder_evening, notification_enabled)

-- 工作记录表
work_records (id, user_id, date, content, category, emotion, importance, time_spent, tags, follow_up_action)

-- 朋友记录表
friend_records (id, user_id, date, friend_name, interaction_type, content, emotion, importance)

-- 伴侣记录表
partner_records (id, user_id, date, partner_name, interaction_type, content, emotion, importance, resolved)

-- 感恩记录表
gratitude_records (id, user_id, date, content, category, emotion, impact_level, photo_url, location_latitude, location_longitude, location_address)

-- 每日三省表
daily_reflections (id, user_id, date, morning_goal, morning_mood, noon_check, noon_progress, evening_reflection, evening_achievements, evening_challenges, overall_rating, sleep_prediction)

-- 周总结表
weekly_summaries (id, user_id, week_start, week_end, work_analysis, relationship_analysis, gratitude_analysis, emotional_analysis, growth_tracking, ai_recommendations)
```

---

## 🔌 API设计

### 认证相关
```
POST /api/auth/register          - 用户注册
POST /api/auth/login             - 用户登录
POST /api/auth/logout            - 用户登出
POST /api/auth/refresh           - 刷新token
POST /api/auth/forgot-password   - 忘记密码
POST /api/auth/reset-password    - 重置密码
```

### 用户相关
```
GET /api/user/profile            - 获取用户信息
PUT /api/user/profile            - 更新用户信息
GET /api/user/preferences        - 获取用户偏好
PUT /api/user/preferences        - 更新用户偏好
```

### 记录相关
```
GET /api/records/daily/:date     - 获取指定日期的记录
POST /api/records/work           - 创建工作记录
PUT /api/records/work/:id        - 更新工作记录
DELETE /api/records/work/:id     - 删除工作记录
POST /api/records/friend         - 创建朋友记录
POST /api/records/partner        - 创建伴侣记录
POST /api/records/gratitude      - 创建感恩记录
POST /api/records/reflection     - 创建每日三省
```

### 分析相关
```
GET /api/analysis/weekly/:weekStart    - 获取周总结
POST /api/analysis/generate-weekly     - 生成周总结
GET /api/analysis/trends               - 获取趋势分析
GET /api/analysis/insights             - 获取AI洞察
```

### 数据管理
```
GET /api/data/export             - 导出数据
POST /api/data/import            - 导入数据
GET /api/data/backups            - 获取备份列表
POST /api/data/backup            - 创建备份
POST /api/data/restore           - 恢复备份
```

---

## 🎨 用户界面设计

### UI框架选择: shadcn/ui
**选择理由**:
- ✅ 现代简洁的设计风格，符合2025年设计趋势
- ✅ 基于Radix UI，无障碍访问性优秀
- ✅ 完全可定制，不依赖庞大的组件库
- ✅ TypeScript原生支持
- ✅ 与Tailwind CSS完美集成
- ✅ 组件按需复制，无额外依赖

### 核心页面
```
/login                    - 登录页面
/register                 - 注册页面
/dashboard                - 主仪表板
/record/[date]           - 每日记录页面
/summary/[week]          - 周总结页面
/history                 - 历史记录页面
/settings                - 设置页面
/profile                 - 个人资料页面
```

### 语音交互界面
**设计原则**:
- 大尺寸麦克风按钮，易于点击
- 清晰的视觉反馈（录音中/停止）
- 实时语音转文字显示
- 智能建议和提示
- 无障碍访问支持

---

## 🔒 安全与性能

### 安全要求
- ✅ 密码最少8位，包含字母和数字
- ✅ JWT token有效期1小时，refresh token 7天
- ✅ 敏感操作需要重新认证
- ✅ 登录失败次数限制（5次/15分钟）
- ✅ 所有API使用HTTPS
- ✅ 密码使用bcrypt加密（salt rounds: 10）
- ✅ SQL注入防护（使用参数化查询）
- ✅ XSS防护（输入验证和输出编码）
- ✅ CSRF防护（使用CSRF token）

### 性能要求
- ✅ API响应时间 < 200ms (P95)
- ✅ 页面首次加载 < 2s
- ✅ 数据查询 < 100ms
- ✅ 合理使用索引
- ✅ 查询优化（避免N+1查询）
- ✅ 连接池配置
- ✅ 缓存策略（Redis缓存热点数据）

---

## 🚀 开发指令

### 第一步：确认技术栈
请确认是否使用推荐的技术栈：
- 前端：Next.js 14+ + shadcn/ui + TypeScript
- 后端：Node.js + Express + Prisma + PostgreSQL

### 第二步：搭建项目基础
1. 初始化前端项目（Next.js + shadcn/ui）
2. 初始化后端项目（Node.js + Express + Prisma）
3. 配置数据库连接
4. 设置基础的项目结构

### 第三步：实现认证系统
1. 用户注册功能
2. 用户登录功能
3. JWT认证中间件
4. 密码重置功能

### 第四步：实现核心记录功能
1. 语音输入组件（优先实现）
2. 工作记录功能
3. 人际关系记录功能
4. 感恩记录功能
5. 每日三省功能

### 第五步：实现数据管理
1. 历史记录查看
2. 搜索与筛选
3. 数据导出与导入
4. 数据备份与恢复

### 第六步：实现智能分析
1. 周总结生成
2. AI智能分析
3. 数据可视化

### 第七步：优化与测试
1. 性能优化
2. 安全加固
3. 单元测试
4. 集成测试
5. E2E测试

---

## 📝 开发注意事项

### 优先级排序
1. **语音交互功能** - 这是产品的核心特色，必须优先实现
2. **用户认证系统** - 基础功能，必须稳定可靠
3. **核心记录功能** - 产品的主要价值所在
4. **数据管理功能** - 用户体验的重要组成部分
5. **智能分析功能** - 增值功能，可以逐步完善

### 用户体验原则
- 语音为主，文字为辅，选项提示为引导
- 界面简洁直观，操作流程清晰
- 实时反馈，让用户知道系统状态
- 智能建议，减少用户思考成本
- 无障碍访问，支持所有用户

### 代码质量要求
- 遵循最佳实践和安全规范
- 编写清晰、可维护的代码
- 添加必要的错误处理
- 实现响应式设计
- 确保良好的用户体验
- 添加适当的注释和文档

---

## 📞 获取帮助

如果在开发过程中遇到问题：
1. 查阅 [产品开发完整需求文档.md](./产品开发完整需求文档.md)
2. 查看 [claude-development-prompt.md](./claude-development-prompt.md)
3. 检查API设计和数据库设计
4. 确认技术栈选择是否正确

---

## ✅ 开始开发

现在你已经了解了项目的全貌，可以开始开发了！

**推荐的第一步**：
1. 确认技术栈选择
2. 搭建前端项目（Next.js + shadcn/ui）
3. 搭建后端项目（Node.js + Express + Prisma）
4. 配置数据库连接
5. 实现用户认证系统

**记住**：语音交互是本产品的核心特色，请优先实现语音输入功能！

祝你开发顺利！🎉