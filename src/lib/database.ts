import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  User,
  Story,
  StorySegment,
  StoryParticipant
} from '@/types/database';

// 数据文件路径
const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const STORIES_FILE = path.join(DATA_DIR, 'stories.json');
const SEGMENTS_FILE = path.join(DATA_DIR, 'segments.json');
const PARTICIPANTS_FILE = path.join(DATA_DIR, 'participants.json');

// 确保数据目录存在
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// 读取JSON文件
async function readJsonFile<T>(filePath: string): Promise<T[]> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// 写入JSON文件
async function writeJsonFile<T>(filePath: string, data: T[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

// 用户相关操作
export class UserService {
  static async getAllUsers(): Promise<User[]> {
    return readJsonFile<User>(USERS_FILE);
  }

  static async getUserById(id: string): Promise<User | null> {
    const users = await this.getAllUsers();
    return users.find(user => user.id === id) || null;
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    const users = await this.getAllUsers();
    return users.find(user => user.email === email) || null;
  }

  static async createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const users = await this.getAllUsers();
    const newUser: User = {
      id: uuidv4(),
      ...userData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    users.push(newUser);
    await writeJsonFile(USERS_FILE, users);
    return newUser;
  }
}

// 故事相关操作
export class StoryService {
  static async getAllStories(): Promise<Story[]> {
    return readJsonFile<Story>(STORIES_FILE);
  }

  static async getStoryById(id: string): Promise<Story | null> {
    const stories = await this.getAllStories();
    return stories.find(story => story.id === id) || null;
  }

  static async getActiveStories(): Promise<Story[]> {
    const stories = await this.getAllStories();
    return stories.filter(story => story.status === 'active');
  }

  static async createStory(storyData: Omit<Story, 'id' | 'created_at' | 'updated_at' | 'current_participants'>): Promise<Story> {
    const stories = await this.getAllStories();
    const newStory: Story = {
      id: uuidv4(),
      ...storyData,
      current_participants: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    stories.push(newStory);
    await writeJsonFile(STORIES_FILE, stories);
    return newStory;
  }

  static async updateStory(id: string, updates: Partial<Story>): Promise<Story | null> {
    const stories = await this.getAllStories();
    const index = stories.findIndex(story => story.id === id);
    if (index === -1) return null;

    stories[index] = {
      ...stories[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    await writeJsonFile(STORIES_FILE, stories);
    return stories[index];
  }
}

// 故事片段相关操作
export class SegmentService {
  static async getSegmentsByStoryId(storyId: string): Promise<StorySegment[]> {
    const segments = await readJsonFile<StorySegment>(SEGMENTS_FILE);
    return segments
      .filter(segment => segment.story_id === storyId)
      .sort((a, b) => a.order_index - b.order_index);
  }

  static async createSegment(segmentData: Omit<StorySegment, 'id' | 'created_at' | 'updated_at'>): Promise<StorySegment> {
    const segments = await readJsonFile<StorySegment>(SEGMENTS_FILE);
    const newSegment: StorySegment = {
      id: uuidv4(),
      ...segmentData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    segments.push(newSegment);
    await writeJsonFile(SEGMENTS_FILE, segments);
    return newSegment;
  }

  static async getNextOrderIndex(storyId: string): Promise<number> {
    const segments = await this.getSegmentsByStoryId(storyId);
    return segments.length > 0 ? Math.max(...segments.map(s => s.order_index)) + 1 : 0;
  }
}

// 参与者相关操作
export class ParticipantService {
  static async getParticipantsByStoryId(storyId: string): Promise<StoryParticipant[]> {
    const participants = await readJsonFile<StoryParticipant>(PARTICIPANTS_FILE);
    return participants.filter(p => p.story_id === storyId);
  }

  static async addParticipant(storyId: string, userId: string): Promise<StoryParticipant> {
    const participants = await readJsonFile<StoryParticipant>(PARTICIPANTS_FILE);
    
    // 检查是否已经是参与者
    const existing = participants.find(p => p.story_id === storyId && p.user_id === userId);
    if (existing) return existing;

    const newParticipant: StoryParticipant = {
      id: uuidv4(),
      story_id: storyId,
      user_id: userId,
      joined_at: new Date().toISOString(),
      contribution_count: 0,
    };

    participants.push(newParticipant);
    await writeJsonFile(PARTICIPANTS_FILE, participants);
    return newParticipant;
  }

  static async incrementContribution(storyId: string, userId: string): Promise<void> {
    const participants = await readJsonFile<StoryParticipant>(PARTICIPANTS_FILE);
    const index = participants.findIndex(p => p.story_id === storyId && p.user_id === userId);
    
    if (index !== -1) {
      participants[index].contribution_count += 1;
      await writeJsonFile(PARTICIPANTS_FILE, participants);
    }
  }
}
