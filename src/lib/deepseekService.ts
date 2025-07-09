import { StoryParameters, StoryGenerationRequest } from '@/types/database';

interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface DeepSeekRequest {
  model: string;
  messages: DeepSeekMessage[];
  temperature: number;
  max_tokens: number;
  stream: boolean;
}

interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

// 故事类型对应的中文描述
const GENRE_DESCRIPTIONS = {
  fantasy: '奇幻',
  'sci-fi': '科幻',
  romance: '浪漫',
  mystery: '悬疑',
  adventure: '冒险',
  horror: '恐怖',
  comedy: '喜剧',
  drama: '剧情'
};

// 故事长度对应的字数要求
const LENGTH_REQUIREMENTS = {
  short: '100-150字',
  medium: '200-300字', 
  long: '400-500字'
};

/**
 * 构建故事生成的系统提示词
 */
function buildSystemPrompt(): string {
  return `你是一个专业的故事创作助手，擅长根据用户提供的参数创作引人入胜的故事开头。

你的任务是：
1. 根据用户提供的故事参数（时间、地点、人物、事件、情绪氛围、类型）创作故事开头
2. 故事开头要生动有趣，能够吸引读者继续阅读
3. 要为后续的接龙创作留下足够的发展空间
4. 语言要流畅自然，符合中文表达习惯
5. 要体现指定的故事类型特色

创作要求：
- 故事开头要有明确的场景设定
- 人物形象要鲜明有特色
- 要有适当的悬念或冲突来推动情节
- 语言风格要与故事类型匹配
- 要为接龙者提供明确的故事发展方向

请严格按照用户指定的字数要求创作，不要超出范围。`;
}

/**
 * 构建用户提示词
 */
function buildUserPrompt(request: StoryGenerationRequest): string {
  const { parameters, style = 'fantasy', length = 'medium' } = request;
  
  const genreDesc = GENRE_DESCRIPTIONS[style as keyof typeof GENRE_DESCRIPTIONS] || '奇幻';
  const lengthReq = LENGTH_REQUIREMENTS[length as keyof typeof LENGTH_REQUIREMENTS] || '200-300字';
  
  let prompt = `请创作一个${genreDesc}类型的故事开头，字数要求：${lengthReq}。\n\n`;
  
  prompt += `故事参数：\n`;
  
  if (parameters.time) {
    prompt += `- 时间设定：${parameters.time}\n`;
  }
  
  if (parameters.location) {
    prompt += `- 地点设定：${parameters.location}\n`;
  }
  
  if (parameters.characters && parameters.characters.length > 0 && parameters.characters[0]) {
    prompt += `- 主要人物：${parameters.characters.filter(c => c.trim()).join('、')}\n`;
  }
  
  if (parameters.action) {
    prompt += `- 主要事件：${parameters.action}\n`;
  }
  
  if (parameters.mood) {
    prompt += `- 情绪氛围：${parameters.mood}\n`;
  }
  
  // 添加类型特定的创作指导
  const styleGuidance = getStyleGuidance(style);
  if (styleGuidance) {
    prompt += `\n${styleGuidance}\n`;
  }
  
  prompt += `\n请基于以上参数创作故事开头，要求生动有趣，为后续接龙留下发展空间。直接输出故事内容，不需要额外的说明文字。`;
  
  return prompt;
}

/**
 * 获取不同类型故事的创作指导
 */
function getStyleGuidance(style: string): string {
  const guidance = {
    fantasy: '注重魔法元素和奇幻世界观的构建，可以包含神秘的力量、传说中的生物或古老的预言。',
    'sci-fi': '突出科技元素和未来感，可以涉及先进技术、太空探索或时间旅行等概念。',
    romance: '重点描绘情感氛围和人物间的微妙关系，营造温馨浪漫的感觉。',
    mystery: '营造神秘悬疑的氛围，设置谜题或未解之谜，激发读者的好奇心。',
    adventure: '强调刺激和冒险元素，可以包含探险、挑战或危险的情境。',
    horror: '营造恐怖紧张的氛围，但要适度，避免过于血腥或暴力的内容。',
    comedy: '注重幽默元素，可以通过有趣的情境、对话或人物性格来制造笑点。',
    drama: '重点刻画人物情感和内心冲突，展现深层的人性主题。'
  };
  
  return guidance[style as keyof typeof guidance] || '';
}

/**
 * 调用DeepSeek API生成故事
 */
export async function generateStoryWithAI(request: StoryGenerationRequest): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const apiUrl = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions';
  
  if (!apiKey) {
    throw new Error('DeepSeek API key not configured');
  }
  
  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(request);
  
  const requestBody: DeepSeekRequest = {
    model: 'deepseek-chat',
    messages: [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: userPrompt
      }
    ],
    temperature: 0.8, // 适中的创造性
    max_tokens: 800,  // 足够生成所需长度的故事
    stream: false
  };
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API error:', response.status, errorText);
      throw new Error(`DeepSeek API request failed: ${response.status}`);
    }
    
    const data: DeepSeekResponse = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response from DeepSeek API');
    }
    
    const generatedStory = data.choices[0].message.content.trim();
    
    if (!generatedStory) {
      throw new Error('Empty response from DeepSeek API');
    }
    
    return generatedStory;
    
  } catch (error) {
    console.error('Error calling DeepSeek API:', error);
    
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('Unknown error occurred while generating story');
    }
  }
}

/**
 * 验证API配置
 */
export function validateDeepSeekConfig(): boolean {
  return !!process.env.DEEPSEEK_API_KEY;
}

/**
 * 获取API配置状态
 */
export function getDeepSeekConfigStatus(): { configured: boolean; message: string } {
  const configured = validateDeepSeekConfig();
  
  return {
    configured,
    message: configured 
      ? 'DeepSeek API configured successfully' 
      : 'DeepSeek API key not found in environment variables'
  };
}
