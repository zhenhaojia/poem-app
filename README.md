# 诗词鉴赏网站

一个简洁美观的诗词赏析单页网站，支持搜索、筛选与暗黑模式。

## 功能特性

- 📖 诗词列表展示与详情查看
- 🔍 支持标题、作者、内容、标签搜索
- 🏷️ 按朝代、题材筛选
- 🌙 暗色/亮色模式切换
- 📱 响应式设计，支持移动端
- 📝 包含注释、译文、赏析、创作背景

## 项目结构

```
poem/
├── index.html          # 主页面
├── assets/
│   ├── styles.css      # 样式文件
│   └── script.js       # 交互逻辑
├── data/
│   └── poems.json      # 诗词数据
└── README.md          # 项目说明
```

## 使用方法

1. 直接打开 `index.html` 在浏览器中预览
2. 或使用本地服务器：
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Node.js
   npx serve .
   
   # PHP
   php -S localhost:8000
   ```

## 数据格式

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

## 技术栈

- 纯 HTML/CSS/JavaScript
- 响应式设计
- 本地存储主题偏好
- 哈希路由

## 许可证

MIT License