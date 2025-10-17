// Supabase配置 - 用于AI聊天助手
const SUPABASE_CONFIG = {
  // 您的Supabase项目URL
  url: 'https://pbrlkenmlyefcuyxpovi.supabase.co',
  // 您的匿名密钥（公开使用是安全的）
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBicmxrZW5tbHllZmN1eXhwb3ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MjgzNzUsImV4cCI6MjA3NjIwNDM3NX0.vjP_TGF32GGHaeexp6ivofKiToQ5zE_U5yEYZFhOvdQ',
  // AI聊天Edge Function URL
  aiChatFunction: 'https://pbrlkenmlyefcuyxpovi.supabase.co/functions/v1/ai-chat'
};

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SUPABASE_CONFIG;
}