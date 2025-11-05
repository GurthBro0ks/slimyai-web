/**
 * In-Memory Chat Store for Slime Chat
 *
 * This provides a simple storage layer for guild chat messages and users.
 * In production, this should be replaced with a database (MySQL, PostgreSQL, etc.)
 * or integrated with the MCP chat.service.
 */

export interface ChatMessage {
  id: string;
  guildId: string;
  userId: string;
  username: string;
  content: string;
  timestamp: string;
  userColor: string;
}

export interface ChatUser {
  id: string;
  username: string;
  color: string;
  status: 'online' | 'away' | 'offline';
  lastSeen: string;
}

interface GuildData {
  messages: ChatMessage[];
  users: Map<string, ChatUser>;
}

class ChatStore {
  private guilds: Map<string, GuildData> = new Map();
  private readonly MAX_MESSAGES_PER_GUILD = 1000;
  private readonly USER_TIMEOUT = 5 * 60 * 1000; // 5 minutes

  /**
   * Get or create guild data
   */
  private getGuildData(guildId: string): GuildData {
    if (!this.guilds.has(guildId)) {
      this.guilds.set(guildId, {
        messages: [],
        users: new Map(),
      });
    }
    return this.guilds.get(guildId)!;
  }

  /**
   * Get messages for a guild
   */
  getMessages(guildId: string, limit: number = 50, since?: Date): ChatMessage[] {
    const guild = this.getGuildData(guildId);
    let messages = guild.messages;

    if (since) {
      messages = messages.filter(msg => new Date(msg.timestamp) > since);
    }

    // Return most recent messages
    return messages.slice(-limit);
  }

  /**
   * Add a new message to a guild
   */
  addMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage {
    const guild = this.getGuildData(message.guildId);

    const newMessage: ChatMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    };

    guild.messages.push(newMessage);

    // Trim old messages if limit exceeded
    if (guild.messages.length > this.MAX_MESSAGES_PER_GUILD) {
      guild.messages = guild.messages.slice(-this.MAX_MESSAGES_PER_GUILD);
    }

    // Update user's last seen
    this.updateUserStatus(message.guildId, message.userId, message.username, message.userColor);

    return newMessage;
  }

  /**
   * Update user status
   */
  updateUserStatus(
    guildId: string,
    userId: string,
    username: string,
    color?: string
  ): void {
    const guild = this.getGuildData(guildId);

    const user: ChatUser = guild.users.get(userId) || {
      id: userId,
      username,
      color: color || this.generateUserColor(userId),
      status: 'online',
      lastSeen: new Date().toISOString(),
    };

    user.status = 'online';
    user.lastSeen = new Date().toISOString();

    if (color) {
      user.color = color;
    }

    guild.users.set(userId, user);
  }

  /**
   * Get online users for a guild
   */
  getOnlineUsers(guildId: string): ChatUser[] {
    const guild = this.getGuildData(guildId);
    const now = Date.now();
    const onlineUsers: ChatUser[] = [];

    guild.users.forEach(user => {
      const lastSeenTime = new Date(user.lastSeen).getTime();
      const timeSinceLastSeen = now - lastSeenTime;

      // Update status based on last seen
      if (timeSinceLastSeen < this.USER_TIMEOUT) {
        user.status = 'online';
        onlineUsers.push(user);
      } else if (timeSinceLastSeen < this.USER_TIMEOUT * 2) {
        user.status = 'away';
        onlineUsers.push(user);
      } else {
        user.status = 'offline';
      }
    });

    return onlineUsers.sort((a, b) => a.username.localeCompare(b.username));
  }

  /**
   * Generate a consistent color for a user ID
   */
  generateUserColor(userId: string): string {
    const colors = [
      '#06b6d4', // cyan
      '#ec4899', // pink
      '#eab308', // yellow
      '#8b5cf6', // purple
      '#10b981', // green
      '#f97316', // orange
      '#3b82f6', // blue
      '#ef4444', // red
    ];

    // Use userId to generate consistent index
    const hash = userId.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    return colors[Math.abs(hash) % colors.length];
  }

  /**
   * Clear old offline users (cleanup)
   */
  cleanupOfflineUsers(guildId: string): void {
    const guild = this.getGuildData(guildId);
    const now = Date.now();
    const OFFLINE_THRESHOLD = 30 * 60 * 1000; // 30 minutes

    guild.users.forEach((user, userId) => {
      const lastSeenTime = new Date(user.lastSeen).getTime();
      if (now - lastSeenTime > OFFLINE_THRESHOLD) {
        guild.users.delete(userId);
      }
    });
  }

  /**
   * Seed demo data for a guild (for testing)
   */
  seedDemoData(guildId: string): void {
    // Add demo users
    this.updateUserStatus(guildId, 'user_alex', 'Alex', '#06b6d4');
    this.updateUserStatus(guildId, 'user_brooke', 'Brooke', '#ec4899');
    this.updateUserStatus(guildId, 'user_chris', 'Chris', '#eab308');
    this.updateUserStatus(guildId, 'user_devon', 'Devon', '#8b5cf6');

    // Add demo messages
    this.addMessage({
      guildId,
      userId: 'user_alex',
      username: 'Alex',
      content: 'Welcome to slime.chat! 🎉',
      userColor: '#06b6d4',
    });

    this.addMessage({
      guildId,
      userId: 'user_brooke',
      username: 'Brooke',
      content: 'Hey everyone! Excited to be here!',
      userColor: '#ec4899',
    });

    this.addMessage({
      guildId,
      userId: 'user_chris',
      username: 'Chris',
      content: 'This chat looks amazing! 👀',
      userColor: '#eab308',
    });
  }
}

// Singleton instance
let chatStoreInstance: ChatStore | null = null;

export function getChatStore(): ChatStore {
  if (!chatStoreInstance) {
    chatStoreInstance = new ChatStore();

    // Seed demo data for default guild
    chatStoreInstance.seedDemoData('default');
  }
  return chatStoreInstance;
}
