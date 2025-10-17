import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// 简单的AI聊天服务，可以集成OpenAI或其他AI服务
Deno.serve(async (req: Request) => {
  // 处理CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { message, currentPoem } = await req.json();
    
    if (!message) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 简单的AI回复逻辑 - 实际应用中可替换为真实的AI API
    const response = await generateAIResponse(message, currentPoem);
    
    return new Response(JSON.stringify({ response }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

// 增强的AI回复生成器
async function generateAIResponse(message: string, currentPoem?: any): Promise<string> {
  const lowerMessage = message.toLowerCase();
  
  // 诗词知识库
  const poemKnowledge = {
    '春晓': {
      author: '孟浩然',
      dynasty: '唐',
      analysis: '这首诗通过"春眠不觉晓"的日常场景，描绘了春天的美好。诗中"处处闻啼鸟"展现生机，"夜来风雨声"暗示变化，"花落知多少"则带有淡淡的惋惜，体现了诗人对自然变化的细腻感受。',
      background: '孟浩然为盛唐山水田园诗人，此诗传达其恬淡自守的审美趣味。'
    },
    '登鹳雀楼': {
      author: '王之涣',
      dynasty: '唐', 
      analysis: '前两句"白日依山尽，黄河入海流"描绘壮阔的自然景观，后两句"欲穷千里目，更上一层楼"由景入情，表达了不断进取的精神追求。',
      background: '鹳雀楼为唐代名胜，登高望远成为诗人抒怀传统意象。'
    },
    '江南': {
      author: '汉乐府',
      dynasty: '汉',
      analysis: '节奏明快、重章叠句，构成活泼的舞蹈感。景中寓情，呈现江南风物与青春爱情的生命律动。',
      background: '汉乐府民歌真实自然，常以生活场景为核心。'
    },
    '饮酒·其五': {
      author: '陶渊明',
      dynasty: '魏晋',
      analysis: '诗中形与神俱佳，以清淡之笔勾勒理想的栖居与精神的自由。末句"欲辨已忘言"直指言说之限，颇具玄思之美。',
      background: '陶渊明为隐逸诗人，作品体现其返璞归真的人生态度。'
    }
  };

  // 智能回复逻辑
  if (lowerMessage.includes('你好') || lowerMessage.includes('您好')) {
    return '您好！我是AI诗词助手，很高兴为您提供诗词相关的帮助。';
  }
  
  if (lowerMessage.includes('帮助') || lowerMessage.includes('功能')) {
    return '我可以帮您：\n• 解析诗词内容和意境\n• 介绍作者生平和创作背景\n• 提供诗词翻译和注释\n• 推荐相关诗词作品\n• 解答诗词相关的疑问\n\n请告诉我您想了解的具体诗词或问题。';
  }
  
  // 诗词特定问答
  for (const [title, info] of Object.entries(poemKnowledge)) {
    if (lowerMessage.includes(title.toLowerCase()) || lowerMessage.includes(info.author.toLowerCase())) {
      return `《${title}》是${info.dynasty}诗人${info.author}的作品。\n\n${info.analysis}\n\n创作背景：${info.background}`;
    }
  }
  
  if (lowerMessage.includes('推荐') || lowerMessage.includes('建议')) {
    const recommendations = [
      '喜欢山水田园：陶渊明《饮酒》、王维《山居秋暝》',
      '喜欢豪放风格：李白《将进酒》、苏轼《念奴娇》',
      '喜欢婉约抒情：李清照《声声慢》、李商隐《无题》',
      '喜欢边塞诗：王昌龄《出塞》、岑参《白雪歌》',
      '喜欢哲理诗：杜甫《春望》、白居易《赋得古原草送别》'
    ];
    return `根据您的兴趣，我推荐：\n${recommendations.map(r => `• ${r}`).join('\n')}`;
  }
  
  if (lowerMessage.includes('谢谢') || lowerMessage.includes('感谢')) {
    return '不客气！如果您还有其他关于诗词的问题，随时可以问我。';
  }
  
  // 默认回复 - 可以集成真实的AI API
  return `关于"${message}"，这是一个很好的问题！\n\n虽然我目前的知识库有限，但建议您：\n1. 查看本站的诗词详情页面获取详细信息\n2. 搜索具体的诗词标题或作者名\n3. 关注诗词的创作背景和时代特征\n\n如果您有具体的诗词作品想要了解，请告诉我诗名或作者，我会尽力为您解答。`;
}