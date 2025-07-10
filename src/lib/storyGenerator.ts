import { StoryParameters, StoryGenerationRequest } from '@/types/database';
import { generateStoryWithAI, validateDeepSeekConfig } from './deepseekService';

// 故事模板和素材库
const STORY_TEMPLATES = {
  fantasy: {
    times: ['古代', '中世纪', '魔法时代', '远古时期', '传说时代'],
    locations: ['魔法森林', '古老城堡', '神秘洞穴', '飞空岛屿', '龙之巢穴', '精灵王国', '矮人矿山'],
    characters: ['勇敢的骑士', '神秘法师', '精灵弓箭手', '矮人战士', '龙族守护者', '魔法学徒', '森林德鲁伊'],
    actions: ['寻找传说中的宝藏', '拯救被困的公主', '阻止邪恶巫师', '探索古老遗迹', '驯服巨龙', '解开魔法诅咒']
  },
  'sci-fi': {
    times: ['2050年', '2100年', '遥远的未来', '星际时代', '机器人时代'],
    locations: ['太空站', '外星球', '地下城市', '飞行汽车上', '虚拟现实世界', '火星基地', '时空隧道'],
    characters: ['太空探险家', '机器人伙伴', '外星生物', '科学家', '时空旅行者', '赛博朋克黑客', 'AI助手'],
    actions: ['探索新星球', '阻止机器人叛乱', '寻找失落的文明', '修复时空裂缝', '与外星人交流', '拯救地球']
  },
  romance: {
    times: ['春天的午后', '夏日黄昏', '秋天的雨夜', '冬日雪夜', '樱花盛开时'],
    locations: ['咖啡厅', '图书馆', '海边', '公园', '小镇', '大学校园', '艺术画廊'],
    characters: ['温柔的作家', '阳光的学生', '神秘的艺术家', '可爱的书店老板', '善良的医生', '才华横溢的音乐家'],
    actions: ['偶然相遇', '重逢旧友', '一起看星星', '共同完成项目', '互相帮助', '分享秘密']
  },
  mystery: {
    times: ['深夜', '暴风雨夜', '迷雾笼罩的早晨', '月黑风高夜', '黄昏时分'],
    locations: ['古老庄园', '废弃工厂', '神秘小镇', '图书馆密室', '地下室', '孤岛', '老式火车'],
    characters: ['私家侦探', '神秘陌生人', '管家', '失踪者', '目击者', '嫌疑人', '警察'],
    actions: ['调查失踪案', '寻找线索', '解开谜题', '追踪嫌疑人', '发现秘密', '揭露真相']
  },
  adventure: {
    times: ['黎明时分', '正午烈日下', '傍晚时分', '午夜时刻', '暴风雨中'],
    locations: ['热带雨林', '沙漠绿洲', '雪山之巅', '深海', '火山口', '古代遗迹', '无人岛'],
    characters: ['冒险家', '向导', '考古学家', '探险队员', '当地居民', '野生动物专家', '寻宝者'],
    actions: ['寻找失落宝藏', '穿越危险地带', '拯救队友', '逃离陷阱', '征服高峰', '探索未知领域']
  },
  horror: {
    times: ['深夜', '午夜时分', '黎明前', '暴风雨夜', '月圆之夜'],
    locations: ['废弃医院', '古老墓地', '阴森森林', '荒废小镇', '地下室', '老旧房屋', '迷雾山谷'],
    characters: ['勇敢的调查员', '神秘访客', '当地居民', '失踪者', '守夜人', '研究员', '幸存者'],
    actions: ['调查超自然现象', '寻找失踪的人', '逃离危险', '解开诅咒', '对抗邪恶力量', '寻求真相']
  },
  comedy: {
    times: ['阳光明媚的早晨', '热闹的午餐时间', '周末的下午', '节日庆典', '平凡的一天'],
    locations: ['热闹的餐厅', '办公室', '学校', '公园', '商场', '家庭聚会', '社区中心'],
    characters: ['搞笑的朋友', '古怪的邻居', '幽默的老师', '可爱的宠物', '滑稽的同事', '有趣的家人'],
    actions: ['制造意外的笑话', '参加搞笑比赛', '解决荒谬的问题', '策划恶作剧', '误会连连', '化解尴尬']
  },
  drama: {
    times: ['人生转折点', '重要的一天', '多年以后', '关键时刻', '命运的十字路口'],
    locations: ['家庭客厅', '医院', '法庭', '学校', '工作场所', '老家', '城市街头'],
    characters: ['坚强的母亲', '迷茫的青年', '睿智的长者', '奋斗的父亲', '叛逆的孩子', '忠诚的朋友'],
    actions: ['面对人生选择', '处理家庭矛盾', '追求梦想', '克服困难', '寻找自我', '重建关系']
  }
} as const;

// 随机选择函数
function randomChoice<T>(array: readonly T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// 使用AI生成故事开头（主要方法）
export async function generateStoryBeginningWithAI(request: StoryGenerationRequest): Promise<string> {
  // 检查是否配置了DeepSeek API
  if (validateDeepSeekConfig()) {
    try {
      // 使用AI生成故事
      const aiStory = await generateStoryWithAI(request);
      return aiStory;
    } catch (error) {
      console.error('AI generation failed, falling back to template:', error);
      // AI生成失败时，回退到模板生成
      return generateStoryBeginning(request);
    }
  } else {
    console.warn('DeepSeek API not configured, using template generation');
    // 没有配置API时，使用模板生成
    return generateStoryBeginning(request);
  }
}

// 生成故事开头（模板方法，作为备用）
export function generateStoryBeginning(request: StoryGenerationRequest): string {
  const { parameters, style = 'fantasy', length = 'medium' } = request;

  // 获取对应类型的模板
  const template = STORY_TEMPLATES[style as keyof typeof STORY_TEMPLATES] || STORY_TEMPLATES.fantasy;
  
  // 使用用户提供的参数或随机生成
  const time = parameters.time || randomChoice(template.times);
  const location = parameters.location || randomChoice(template.locations);
  const character = parameters.characters?.[0] || randomChoice(template.characters);
  const action = parameters.action || randomChoice(template.actions);
  const mood = parameters.mood || generateMood(style);
  
  // 根据长度生成不同详细程度的开头
  let story = '';
  
  switch (length) {
    case 'short':
      story = `在${time}，${character}来到了${location}。他们决定${action}。`;
      break;
    case 'medium':
      story = `在${time}，${character}来到了${location}。这里${generateLocationDescription(location, mood)}。面对眼前的情况，他们决定${action}。这将是一个充满${mood}的冒险。`;
      break;
    case 'long':
      story = `在${time}，${character}来到了${location}。这里${generateLocationDescription(location, mood)}。${generateCharacterBackground(character)}。面对眼前的情况，他们决定${action}。这将是一个充满${mood}的冒险，而他们还不知道前方等待着什么样的挑战和机遇。`;
      break;
  }
  
  return story;
}

// 生成情绪描述
function generateMood(style: string): string {
  const moods = {
    fantasy: ['神秘', '魔幻', '史诗', '传奇', '奇幻'],
    'sci-fi': ['未来感', '科技感', '神秘', '惊险', '创新'],
    romance: ['温馨', '浪漫', '甜蜜', '感人', '温暖'],
    mystery: ['悬疑', '紧张', '神秘', '惊悚', '扣人心弦'],
    adventure: ['刺激', '冒险', '惊险', '激动人心', '充满挑战'],
    horror: ['恐怖', '阴森', '诡异', '令人不安', '毛骨悚然'],
    comedy: ['搞笑', '轻松', '幽默', '欢乐', '有趣'],
    drama: ['感人', '深刻', '真实', '动人', '发人深省']
  };

  return randomChoice(moods[style as keyof typeof moods] || moods.fantasy);
}

// 生成地点描述
function generateLocationDescription(location: string, mood: string): string {
  const descriptions = [
    `弥漫着${mood}的氛围`,
    `散发着${mood}的气息`,
    `充满了${mood}的感觉`,
    `给人一种${mood}的印象`,
    `透露出${mood}的韵味`
  ];
  
  return randomChoice(descriptions);
}

// 生成角色背景
function generateCharacterBackground(character: string): string {
  const backgrounds = [
    `${character}有着丰富的经验和坚定的意志`,
    `${character}虽然年轻，但充满了勇气和智慧`,
    `${character}带着神秘的过去和未知的目标`,
    `${character}拥有特殊的能力和独特的见解`,
    `${character}怀着崇高的理想和坚定的信念`
  ];
  
  return randomChoice(backgrounds);
}

// 生成故事参数建议
export function generateStoryParameters(style: string = 'fantasy'): StoryParameters {
  const template = STORY_TEMPLATES[style as keyof typeof STORY_TEMPLATES] || STORY_TEMPLATES.fantasy;
  
  return {
    time: randomChoice(template.times),
    location: randomChoice(template.locations),
    characters: [randomChoice(template.characters)],
    action: randomChoice(template.actions),
    mood: generateMood(style),
    genre: style
  };
}

// 验证故事参数
export function validateStoryParameters(parameters: StoryParameters): boolean {
  return !!(parameters.time || parameters.location || parameters.characters || parameters.action);
}

// 生成接龙建议
export function generateContinuationSuggestions(currentStory: string, parameters: StoryParameters): string[] {
  const suggestions = [
    `突然，${parameters.characters?.[0] || '主角'}发现了一个意想不到的线索...`,
    `就在这时，${parameters.location || '这个地方'}发生了奇怪的变化...`,
    `${parameters.characters?.[0] || '主角'}回想起${parameters.time || '过去'}的一段记忆...`,
    `一个神秘的声音在${parameters.location || '远处'}响起...`,
    `${parameters.characters?.[0] || '主角'}必须做出一个重要的决定...`
  ];
  
  return suggestions.slice(0, 3); // 返回3个建议
}
