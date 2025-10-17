# 诗词赏析平台

一个简洁美观的诗词赏析单页网站，支持搜索、筛选、暗黑模式以及AI聊天助手。

## 🌟 功能特性

- 📖 **诗词展示** - 精美的诗词列表和详情页面
- 🔍 **智能搜索** - 支持标题、作者、内容、标签全文搜索
- 🏷️ **多维度筛选** - 按朝代、题材、有无注释筛选
- 🤖 **AI聊天助手** - 悬浮式AI助手，随时解答诗词问题
- 🌙 **主题切换** - 亮色/暗黑模式，自动保存偏好
- 📱 **响应式设计** - 完美适配桌面和移动设备
- 🚀 **一键部署** - 支持Netlify等平台快速部署

## 🎯 新增AI聊天助手功能

在首页右下角悬浮的AI助手按钮，点击即可打开聊天窗口：

- **智能问答**：解答诗词含义、作者背景、创作背景等问题
- **实时对话**：模拟AI思考过程，提供专业诗词解析
- **移动优化**：在手机端自动适配屏幕尺寸
- **上下文感知**：根据当前浏览的诗词提供针对性建议

## 🚀 完整部署指南

### 1. Netlify前端部署

#### 方法一：直接拖拽部署
1. 访问 [Netlify](https://netlify.com)
2. 将整个项目文件夹拖拽到部署区域
3. 等待部署完成，获取专属网址

#### 方法二：Git仓库连接
1. 将项目推送到GitHub/GitLab
2. 在Netlify中选择"New site from Git"
3. 连接仓库，设置构建命令为空白（静态站点）
4. 发布目录设置为根目录 `.`
5. 点击部署

### 2. Supabase后端部署（AI聊天助手）

#### 步骤1：创建Supabase项目
1. 访问 [Supabase](https://supabase.com) 并注册账号
2. 创建新项目，选择合适的地域
3. 获取项目URL和匿名密钥

#### 步骤2：部署Edge Function
1. 安装Supabase CLI：`npm install -g supabase`
2. 登录：`supabase login`
3. 链接项目：`supabase link --project-ref your-project-ref`
4. 部署AI聊天函数：`supabase functions deploy ai-chat`

#### 步骤3：配置环境变量
在Netlify中设置环境变量：
```
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
```

### 部署配置说明
- 项目已包含 `netlify.toml` 前端部署配置
- 包含 `supabase/config.toml` 后端配置
- AI聊天助手已集成Supabase Edge Functions
- 支持真实的AI服务集成

## 📁 项目结构

```
poem/
├── index.html              # 主页面（包含AI聊天助手）
├── netlify.toml           # Netlify部署配置
├── package.json           # 项目配置
├── assets/
│   ├── styles.css         # 样式文件（含AI助手样式）
│   └── script.js          # 交互逻辑（含AI助手功能）
├── data/
│   └── poems.json         # 诗词数据
└── README.md              # 项目说明
```

## 🛠️ 本地开发

```bash
# 使用Python本地服务器
python -m http.server 8000

# 使用Node.js serve
npx serve .

# 使用PHP本地服务器
php -S localhost:8000
```

## 📊 数据格式

编辑 `data/poems.json` 添加更多诗词：

```json
{
  "id": "唯一标识",
  "title": "诗词标题", 
  "author": "作者",
  "dynasty": "朝代",
  "tags": ["标签1", "标签2"],
  "content": "诗词内容\\n分行显示",
  "notes": ["注释1", "注释2"],
  "translation": "译文",
  "analysis": "赏析", 
  "background": "创作背景"
}
```

## 🎨 技术特色

- **纯前端技术**：HTML5、CSS3、原生JavaScript
- **现代化设计**：CSS变量、Flexbox、Grid布局
- **用户体验**：平滑动画、加载状态、错误处理
- **SEO友好**：语义化HTML、meta标签优化
- **性能优化**：懒加载、本地存储、高效搜索算法

## 🌐 访问地址

部署到Netlify后，您将获得类似这样的网址：
`https://your-app-name.netlify.app`

## 📄 许可证

MIT License - 可自由使用和修改

---

**提示**：部署完成后，记得测试AI聊天助手功能是否正常工作！