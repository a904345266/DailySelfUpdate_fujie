# DailySelfUpdate 产品开发完整指南

> **给Claude的开发导航文档** - 请先阅读此README，然后按照目录顺序执行开发任务

## 📋 目录导航（开发路线图）

### 🚀 快速开始
- [1. 项目概述与技术栈选择](#1-项目概述与技术栈选择)
- [2. 开发环境搭建](#2-开发环境搭建)
- [3. 项目结构初始化](#3-项目结构初始化)

### 🔐 认证系统（Phase 1）
- [4. 用户认证系统](#4-用户认证系统)
  - [4.1 用户注册功能](#41-用户注册功能)
  - [4.2 用户登录功能](#42-用户登录功能)
  - [4.3 密码重置功能](#43-密码重置功能)
  - [4.4 第三方登录集成](#44-第三方登录集成)

### 📝 核心记录功能（Phase 2）
- [5. 每日记录系统](#5-每日记录系统)
  - [5.1 语音优先交互设计](#51-语音优先交互设计)
  - [5.2 工作记录功能](#52-工作记录功能)
  - [5.3 人际关系记录功能](#53-人际关系记录功能)
  - [5.4 感恩记录功能](#54-感恩记录功能)
  - [5.5 每日三省功能](#55-每日三省功能)

### 📊 数据管理（Phase 2）
- [6. 历史记录与数据管理](#6-历史记录与数据管理)
  - [6.1 历史记录查看](#61-历史记录查看)
  - [6.2 搜索与筛选](#62-搜索与筛选)
  - [6.3 数据导出与导入](#63-数据导出与导入)
  - [6.4 数据备份与恢复](#64-数据备份与恢复)

### 🤖 智能分析（Phase 3）
- [7. 智能总结与分析系统](#7-智能总结与分析系统)
  - [7.1 周总结生成](#71-周总结生成)
  - [7.2 AI智能分析](#72-ai智能分析)
  - [7.3 数据可视化](#73-数据可视化)

### 🎨 用户界面（贯穿所有阶段）
- [8. 用户界面设计](#8-用户界面设计)
  - [8.1 UI框架选择](#81-ui框架选择)
  - [8.2 语音交互界面](#82-语音交互界面)
  - [8.3 响应式设计](#83-响应式设计)
  - [8.4 主题与个性化](#84-主题与个性化)

### 🔧 技术实现
- [9. 后端API设计](#9-后端api设计)
- [10. 数据库设计](#10-数据库设计)
- [11. 安全与性能](#11-安全与性能)

---

## 1. 项目概述与技术栈选择

### 1.1 产品定位
**产品名称**: DailySelfUpdate (每日自我更新)
**核心理念**: "吾日三省吾身" - 通过每日反思记录和智能总结，帮助用户实现自我成长和情感管理
**核心特色**: 语音优先的交互方式，让记录变得轻松自然

### 1.2 推荐技术栈

#### 前端技术栈（已确定）
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

**为什么选择shadcn/ui？**
- ✅ 现代简洁的设计风格，符合2025年设计趋势
- ✅ 基于Radix UI，无障碍访问性优秀
- ✅ 完全可定制，不依赖庞大的组件库
- ✅ TypeScript原生支持
- ✅ 与Tailwind CSS完美集成
- ✅ 组件按需复制，无额外依赖

#### 后端技术栈（已确定）
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

### 1.3 开发优先级
```
Phase 1 (Week 1-2): 认证系统 + 基础框架
Phase 2 (Week 3-4): 核心记录功能 + 语音交互
Phase 3 (Week 5-6): 智能分析 + 数据可视化
Phase 4 (Week 7-8): 优化完善 + 测试部署
```

---

## 2. 开发环境搭建

### 2.1 必需软件
```bash
# Node.js 18+ 
node --version  # 应该显示 v18.x.x 或更高

# PostgreSQL 14+
psql --version  # 应该显示 14.x 或更高

# Git
git --version
```

### 2.2 环境变量模板
创建 `.env.example` 文件：
```env
# 应用配置
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# 数据库
DATABASE_URL=postgresql://postgres:password@localhost:5432/dailyselfupdate

# JWT认证
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_SECRET=your-refresh-token-secret-change-this
REFRESH_TOKEN_EXPIRES_IN=7d

# 邮件服务（用于密码重置）
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@dailyselfupdate.com

# Redis（可选，用于缓存）
REDIS_URL=redis://localhost:6379

# 文件上传
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads

# 日志
LOG_LEVEL=debug
```

---

## 3. 项目结构初始化

### 3.1 完整项目结构
```
dailyselfupdate/
├── frontend/                          # Next.js前端项目
│   ├── app/                          # App Router目录
│   │   ├── (auth)/                   # 认证相关页面组
│   │   │   ├── login/
│   │   │   │   └── page.tsx         # 登录页面
│   │   │   ├── register/
│   │   │   │   └── page.tsx         # 注册页面
│   │   │   ├── forgot-password/
│   │   │   │   └── page.tsx         # 忘记密码页面
│   │   │   └── reset-password/
│   │   │       └── page.tsx         # 重置密码页面
│   │   ├── (dashboard)/              # 仪表板页面组
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx         # 主仪表板
│   │   │   ├── record/
│   │   │   │   └── [date]/
│   │   │   │       └── page.tsx     # 每日记录页面
│   │   │   ├── summary/
│   │   │   │   └── [week]/
│   │   │   │       └── page.tsx     # 周总结页面
│   │   │   ├── history/
│   │   │   │   └── page.tsx         # 历史记录页面
│   │   │   ├── settings/
│   │   │   │   └── page.tsx         # 设置页面
│   │   │   └── profile/
│   │   │       └── page.tsx         # 个人资料页面
│   │   ├── layout.tsx               # 根布局
│   │   ├── page.tsx                 # 首页
│   │   └── globals.css              # 全局样式
│   ├── components/                  # 组件目录
│   │   ├── ui/                      # shadcn/ui组件
│   │   ├── voice/                   # 语音相关组件
│   │   ├── forms/                   # 表单组件
│   │   ├── charts/                  # 图表组件
│   │   ├── layout/                  # 布局组件
│   │   └── common/                  # 通用组件
│   ├── lib/                         # 工具库
│   ├── hooks/                       # 自定义Hooks
│   ├── store/                       # 状态管理
│   └── types/                       # TypeScript类型
├── backend/                         # Node.js后端项目
│   ├── src/
│   │   ├── controllers/             # 控制器
│   │   ├── middleware/              # 中间件
│   │   ├── routes/                  # 路由
│   │   ├── services/                # 业务逻辑
│   │   ├── utils/                   # 工具函数
│   │   └── config/                  # 配置
│   ├── prisma/                      # Prisma配置
│   └── tests/                       # 测试文件
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## 4. 用户认证系统

### 4.1 用户注册功能

#### 4.1.1 功能需求
- ✅ 邮箱注册（唯一性验证）
- ✅ 用户名设置（可选，可后续补充）
- ✅ 密码强度验证（至少8位，包含字母和数字）
- ✅ 邮箱验证（发送验证链接）
- ✅ 用户协议和隐私政策同意
- ✅ 语音辅助注册（可选）

#### 4.1.2 数据结构
```typescript
interface User {
  id: string;
  email: string;
  username?: string;
  password_hash: string;
  email_verified: boolean;
  avatar_url?: string;
  created_at: Date;
  updated_at: Date;
  last_login_at?: Date;
}

interface UserPreferences {
  user_id: string;
  language: string;
  timezone: string;
  theme: 'light' | 'dark' | 'auto';
  voice_enabled: boolean;
  voice_language: string;
  reminder_morning: string;
  reminder_noon: string;
  reminder_evening: string;
  notification_enabled: boolean;
}
```

#### 4.1.3 API设计
```typescript
// POST /api/auth/register
interface RegisterRequest {
  email: string;
  username?: string;
  password: string;
  agree_to_terms: boolean;
}

interface RegisterResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    email: string;
    username?: string;
    email_verified: boolean;
  };
  requires_verification: boolean;
}
```

### 4.2 用户登录功能

#### 4.2.1 功能需求
- ✅ 邮箱+密码登录
- ✅ JWT token认证
- ✅ 记住我功能（持久化登录）
- ✅ 登录失败次数限制（5次/15分钟）
- ✅ 社交账号登录（Google, Apple）
- ✅ 语音辅助登录

#### 4.2.2 API设计
```typescript
// POST /api/auth/login
interface LoginRequest {
  email: string;
  password: string;
  remember_me?: boolean;
}

interface LoginResponse {
  success: boolean;
  message: string;
  user: User;
  tokens: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };
}
```

### 4.3 密码重置功能

#### 4.3.1 功能需求
- ✅ 忘记密码流程
- ✅ 发送密码重置邮件
- ✅ 重置链接有效期（1小时）
- ✅ 新密码验证
- ✅ 重置成功后自动登录

### 4.4 第三方登录集成

#### 4.4.1 功能需求
- ✅ Google OAuth 2.0
- ✅ Apple Sign In
- ✅ 自动账户关联（如果邮箱已存在）
- ✅ 完善用户信息引导

---

## 5. 每日记录系统

### 5.1 语音优先交互设计

#### 5.1.1 设计理念
**核心原则**：语音为主，文字为辅，选项提示为引导

**交互流程**：
1. 用户点击麦克风按钮或使用语音唤醒
2. 系统播放引导语音："今天想记录什么？"
3. 用户语音描述内容
4. 系统实时转文字并显示
5. 系统智能分析内容，提供分类建议
6. 用户确认或修正
7. 保存记录

#### 5.1.2 Web Speech API集成
```typescript
// 语音识别Hook
function useVoiceInput(options: {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recognition = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        recognition.current = new SpeechRecognition();
        recognition.current.lang = options.language || 'zh-CN';
        recognition.current.continuous = options.continuous || false;
        recognition.current.interimResults = options.interimResults || true;

        recognition.current.onresult = (event) => {
          let finalTranscript = '';
          let interimTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }

          setTranscript(finalTranscript);
          setInterimTranscript(interimTranscript);
        };

        recognition.current.onerror = (event) => {
          setError(event.error);
          setIsListening(false);
        };

        recognition.current.onend = () => {
          setIsListening(false);
        };
      }
    }

    return () => {
      if (recognition.current) {
        recognition.current.abort();
      }
    };
  }, [options.language, options.continuous, options.interimResults]);

  const startListening = () => {
    if (recognition.current) {
      setTranscript('');
      setInterimTranscript('');
      setError(null);
      setIsListening(true);
      recognition.current.start();
    }
  };

  const stopListening = () => {
    if (recognition.current) {
      recognition.current.stop();
    }
  };

  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    isSupported: !!recognition.current
  };
}
```

#### 5.1.3 语音输入组件
```typescript
// VoiceInput.tsx
interface VoiceInputProps {
  onTranscript: (text: string) => void;
  placeholder?: string;
  language?: string;
  disabled?: boolean;
}

export function VoiceInput({ onTranscript, placeholder, language, disabled }: VoiceInputProps) {
  const { isListening, transcript, interimTranscript, error, startListening, stopListening, isSupported } = useVoiceInput({ language });
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    if (transcript) {
      const finalText = displayText + transcript;
      setDisplayText(finalText);
      onTranscript(finalText);
    }
  }, [transcript]);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isSupported) {
    return (
      <div className="flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <AlertCircle className="w-5 h-5 text-yellow-600" />
        <p className="text-sm text-yellow-800">
          您的浏览器不支持语音识别功能，请使用Chrome或Edge浏览器。
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-start gap-3">
        <Button
          onClick={toggleListening}
          disabled={disabled}
          className={cn(
            "flex-shrink-0 w-12 h-12 rounded-full transition-all duration-300",
            isListening ? "bg-red-500 hover:bg-red-600 animate-pulse" : "bg-blue-500 hover:bg-blue-600"
          )}
        >
          {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </Button>

        <div className="flex-1">
          <div className="min-h-[100px] p-4 border border-gray-200 rounded-lg bg-white">
            {displayText || interimTranscript ? (
              <div>
                <p className="text-gray-900">{displayText}</p>
                {interimTranscript && (
                  <p className="text-gray-400 italic">{interimTranscript}</p>
                )}
              </div>
            ) : (
              <p className="text-gray-400">{placeholder}</p>
            )}
          </div>

          {isListening && (
            <div className="mt-2 flex items-center gap-2 text-sm text-blue-600">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span>正在聆听...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

### 5.2 工作记录功能

#### 5.2.1 功能需求
- ✅ 每天记录3件工作相关的事情
- ✅ 语音输入为主，文字输入为辅
- ✅ 智能分类（成就/挑战/学习/日常）
- ✅ 情绪标签（满意/焦虑/平静/兴奋）
- ✅ 重要性评分（1-5星）
- ✅ 时间花费记录
- ✅ 标签系统
- ✅ 后续行动提醒

#### 5.2.2 数据结构
```typescript
interface WorkRecord {
  id: string;
  user_id: string;
  date: string;
  content: string;
  category: 'achievement' | 'challenge' | 'learning' | 'routine';
  emotion: 'satisfied' | 'anxious' | 'neutral' | 'excited';
  importance: number;
  time_spent?: string;
  tags: string[];
  follow_up_action?: string;
  created_at: Date;
  updated_at: Date;
}
```

### 5.3 人际关系记录功能

#### 5.3.1 功能需求
- ✅ 朋友记录（每天3件事）
- ✅ 伴侣记录（每天3件事）
- ✅ 联系人管理
- ✅ 互动类型分类
- ✅ 关系健康度分析
- ✅ 重要日期提醒

### 5.4 感恩记录功能

#### 5.4.1 功能需求
- ✅ 每天记录3件感恩的事
- ✅ 语音快速记录
- ✅ 分类（自然/人物/成就/时刻/健康）
- ✅ 影响力评分
- ✅ 照片/视频附件
- ✅ 地点标记
- ✅ 感恩日历可视化

### 5.5 每日三省功能

#### 5.5.1 功能需求
- ✅ 早晨三省：今日目标和期待
- ✅ 中午三省：进度检查和调整
- ✅ 晚上三省：总结反思和感恩
- ✅ 整体评分（1-5星）
- ✅ 语音引导反思

---

## 6. 历史记录与数据管理

### 6.1 历史记录查看

#### 6.1.1 功能需求
- ✅ 按日期查看历史记录
- ✅ 时间轴展示
- ✅ 日历视图
- ✅ 快速跳转到特定日期
- ✅ 记录完整性提示
- ✅ 语音播报历史记录

### 6.2 搜索与筛选

#### 6.2.1 功能需求
- ✅ 全文搜索
- ✅ 按分类筛选
- ✅ 按情绪筛选
- ✅ 按日期范围筛选
- ✅ 按重要性筛选
- ✅ 保存搜索条件
- ✅ 语音搜索

### 6.3 数据导出与导入

#### 6.3.1 功能需求
- ✅ 导出为JSON格式
- ✅ 导出为CSV格式
- ✅ 导出为PDF报告
- ✅ 选择性导出（按日期范围、分类）
- ✅ 导入数据验证
- ✅ 数据合并选项

### 6.4 数据备份与恢复

#### 6.4.1 功能需求
- ✅ 自动每日备份
- ✅ 手动创建备份
- ✅ 备份列表管理
- ✅ 一键恢复
- ✅ 备份加密
- ✅ 云端备份（可选）

---

## 7. 智能总结与分析系统

### 7.1 周总结生成

#### 7.1.1 功能需求
- ✅ 自动生成周总结
- ✅ 工作效率分析
- ✅ 人际关系分析
- ✅ 感恩分析
- ✅ 情绪分析
- ✅ 成长追踪
- ✅ AI建议生成
- ✅ 语音播报总结

### 7.2 AI智能分析

#### 7.2.1 功能需求
- ✅ 模式识别
- ✅ 趋势预测
- ✅ 个性化建议
- ✅ 异常检测
- ✅ 目标追踪
- ✅ 习惯分析

### 7.3 数据可视化

#### 7.3.1 功能需求
- ✅ 情绪变化趋势图
- ✅ 工作完成情况图
- ✅ 感恩来源分布图
- ✅ 关系互动频率图
- ✅ 目标完成进度图
- ✅ 习惯养成日历
- ✅ 交互式图表

---

## 8. 用户界面设计

### 8.1 UI框架选择

#### 8.1.1 shadcn/ui组件库
**选择理由**：
- ✅ 现代简洁的设计风格
- ✅ 基于Radix UI，无障碍访问性优秀
- ✅ 完全可定制，不依赖庞大的组件库
- ✅ TypeScript原生支持
- ✅ 与Tailwind CSS完美集成
- ✅ 组件按需复制，无额外依赖

### 8.2 语音交互界面

#### 8.2.1 设计原则
- ✅ 大尺寸麦克风按钮，易于点击
- ✅ 清晰的视觉反馈（录音中/停止）
- ✅ 实时语音转文字显示
- ✅ 智能建议和提示
- ✅ 无障碍访问支持

### 8.3 响应式设计

#### 8.3.1 断点设置
```typescript
// Tailwind断点
const breakpoints = {
  sm: '640px',   // 手机横屏
  md: '768px',   // 平板
  lg: '1024px',  // 小型笔记本
  xl: '1280px',  // 桌面
  '2xl': '1536px' // 大屏幕
};
```

### 8.4 主题与个性化

#### 8.4.1 主题配置
- ✅ 浅色主题（默认）
- ✅ 深色主题
- ✅ 自动切换（跟随系统）
- ✅ 自定义主题色

---

## 9. 后端API设计

### 9.1 API规范

#### 9.1.1 认证相关API
```
POST /api/auth/register - 用户注册
POST /api/auth/login - 用户登录
POST /api/auth/logout - 用户登出
POST /api/auth/refresh - 刷新token
POST /api/auth/forgot-password - 忘记密码
POST /api/auth/reset-password - 重置密码
```

#### 9.1.2 记录相关API
```
GET /api/records/daily/:date - 获取指定日期的记录
POST /api/records/work - 创建工作记录
POST /api/records/friend - 创建朋友记录
POST /api/records/partner - 创建伴侣记录
POST /api/records/gratitude - 创建感恩记录
POST /api/records/reflection - 创建每日三省
```

#### 9.1.3 分析相关API
```
GET /api/analysis/weekly/:weekStart - 获取周总结
POST /api/analysis/generate-weekly - 生成周总结
GET /api/analysis/trends - 获取趋势分析
```

---

## 10. 数据库设计

### 10.1 数据库表结构

```sql
-- 用户表
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100),
  password_hash VARCHAR(255) NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP
);

-- 用户偏好表
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  language VARCHAR(10) DEFAULT 'zh-CN',
  timezone VARCHAR(50) DEFAULT 'Asia/Shanghai',
  theme VARCHAR(10) DEFAULT 'light',
  voice_enabled BOOLEAN DEFAULT TRUE,
  voice_language VARCHAR(10) DEFAULT 'zh-CN',
  reminder_morning VARCHAR(5) DEFAULT '08:00',
  reminder_noon VARCHAR(5) DEFAULT '12:00',
  reminder_evening VARCHAR(5) DEFAULT '21:00',
  notification_enabled BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 工作记录表
CREATE TABLE work_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(20) NOT NULL,
  emotion VARCHAR(20) NOT NULL,
  importance INTEGER NOT NULL CHECK (importance BETWEEN 1 AND 5),
  time_spent VARCHAR(50),
  tags TEXT[] DEFAULT '{}',
  follow_up_action TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 朋友记录表
CREATE TABLE friend_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  friend_name VARCHAR(100) NOT NULL,
  interaction_type VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  emotion VARCHAR(20) NOT NULL,
  importance INTEGER NOT NULL CHECK (importance BETWEEN 1 AND 5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 伴侣记录表
CREATE TABLE partner_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  partner_name VARCHAR(100) NOT NULL,
  interaction_type VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  emotion VARCHAR(20) NOT NULL,
  importance INTEGER NOT NULL CHECK (importance BETWEEN 1 AND 5),
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 感恩记录表
CREATE TABLE gratitude_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(20) NOT NULL,
  emotion VARCHAR(20) NOT NULL,
  impact_level INTEGER NOT NULL CHECK (impact_level BETWEEN 1 AND 5),
  photo_url TEXT,
  location_latitude DECIMAL(10, 8),
  location_longitude DECIMAL(11, 8),
  location_address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 每日三省表
CREATE TABLE daily_reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  morning_goal TEXT,
  morning_mood VARCHAR(20),
  noon_check TEXT,
  noon_progress INTEGER CHECK (noon_progress BETWEEN 0 AND 100),
  evening_reflection TEXT,
  evening_achievements TEXT[],
  evening_challenges TEXT[],
  overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 5),
  sleep_prediction VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, date)
);

-- 周总结表
CREATE TABLE weekly_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  work_analysis JSONB NOT NULL,
  relationship_analysis JSONB NOT NULL,
  gratitude_analysis JSONB NOT NULL,
  emotional_analysis JSONB NOT NULL,
  growth_tracking JSONB,
  ai_recommendations JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, week_start)
);

-- 创建索引
CREATE INDEX idx_work_records_user_date ON work_records(user_id, date);
CREATE INDEX idx_friend_records_user_date ON friend_records(user_id, date);
CREATE INDEX idx_partner_records_user_date ON partner_records(user_id, date);
CREATE INDEX idx_gratitude_records_user_date ON gratitude_records(user_id, date);
CREATE INDEX idx_daily_reflections_user_date ON daily_reflections(user_id, date);
CREATE INDEX idx_weekly_summaries_user_week ON weekly_summaries(user_id, week_start);
```

---

## 11. 安全与性能

### 11.1 安全要求

#### 11.1.1 认证安全
- ✅ 密码最少8位，包含字母和数字
- ✅ JWT token有效期1小时，refresh token 7天
- ✅ 敏感操作需要重新认证
- ✅ 登录失败次数限制（5次/15分钟）

#### 11.1.2 数据安全
- ✅ 所有API使用HTTPS
- ✅ 密码使用bcrypt加密（salt rounds: 10）
- ✅ SQL注入防护（使用参数化查询）
- ✅ XSS防护（输入验证和输出编码）
- ✅ CSRF防护（使用CSRF token）

#### 11.1.3 隐私保护
- ✅ 用户数据隔离（严格按user_id过滤）
- ✅ 敏感信息不记录日志
- ✅ 提供数据删除功能
- ✅ 遵守GDPR要求

### 11.2 性能要求

#### 11.2.1 响应时间
- ✅ API响应时间 < 200ms (P95)
- ✅ 页面首次加载 < 2s
- ✅ 数据查询 < 100ms

#### 11.2.2 数据库优化
- ✅ 合理使用索引
- ✅ 查询优化（避免N+1查询）
- ✅ 连接池配置
- ✅ 缓存策略（Redis缓存热点数据）

---

## 开发指令

请按照以下步骤进行开发：

### 第一步：确认技术栈
告诉我你打算使用的前端和后端框架，确认是否使用推荐的技术栈。

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
1. 语音输入组件
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

在开发过程中，请：
- 遵循最佳实践和安全规范
- 编写清晰、可维护的代码
- 添加必要的错误处理
- 实现响应式设计
- 确保良好的用户体验
- 优先实现语音交互功能

如果你有任何疑问或需要 clarification，请随时询问。开始开发吧！