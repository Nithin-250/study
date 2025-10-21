import { Pool } from 'pg';
import type { User } from './authService';

export interface UserProgress {
  userId: string;
  score: number;
  streak: number;
  badges: string[];
  totalQuestions: number;
  correctAnswers: number;
  lastActive: string;
  studySessions: number;
}

export interface StudySession {
  id?: number;
  userId: string;
  topic: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  startTime: string;
  endTime: string;
  duration: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  questionTypes?: ('true_false' | 'multiple_choice')[];
  timePerQuestion?: number[];
}

export interface TopicPerformance {
  topic: string;
  totalAttempts: number;
  correctAnswers: number;
  totalQuestions: number;
  averageScore: number;
  averageTime: number;
  difficultyBreakdown: {
    easy: { correct: number; total: number; };
    medium: { correct: number; total: number; };
    hard: { correct: number; total: number; };
  };
  lastAttempt: string;
  improvementTrend: 'improving' | 'declining' | 'stable';
}

export interface LearningAnalytics {
  userId: string;
  totalStudySessions: number;
  totalQuizSessions: number;
  overallAccuracy: number;
  averageSessionScore: number;
  weakAreas: string[];
  strongAreas: string[];
  improvementSuggestions: string[];
  topicPerformances: TopicPerformance[];
  studyStreak: number;
  bestStreak: number;
  timeSpentLearning: number; // in minutes
  lastActive: string;
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  userPicture?: string;
  score: number;
  badges: string[];
  rank: number;
}

class DatabaseService {
  private pool: Pool;
  private isOnline: boolean;

  constructor() {
    // PostgreSQL connection configuration
    this.pool = new Pool({
      connectionString: 'postgresql://postgres:Nithin@123@db.bgfcskbyxoowhakrjeeb.supabase.co:5432/postgres',
      ssl: { rejectUnauthorized: false } // For Supabase
    });

    this.isOnline = navigator.onLine;

    // Monitor online/offline status
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('🌐 Back online - database connection active');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('📵 Gone offline - using cached data');
    });

    // Initialize database tables
    this.initializeDatabase();
  }

  private async initializeDatabase(): Promise<void> {
    try {
      // Create tables if they don't exist
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(50) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS user_progress (
          user_id VARCHAR(50) PRIMARY KEY REFERENCES users(id),
          score INTEGER DEFAULT 0,
          streak INTEGER DEFAULT 0,
          badges TEXT[] DEFAULT '{}',
          total_questions INTEGER DEFAULT 0,
          correct_answers INTEGER DEFAULT 0,
          last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          study_sessions INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS study_sessions (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR(50) REFERENCES users(id),
          topic VARCHAR(255) NOT NULL,
          score INTEGER NOT NULL,
          total_questions INTEGER NOT NULL,
          correct_answers INTEGER NOT NULL,
          start_time TIMESTAMP NOT NULL,
          end_time TIMESTAMP NOT NULL,
          duration INTEGER NOT NULL,
          difficulty VARCHAR(20),
          question_types TEXT[],
          time_per_question INTEGER[]
        );

        CREATE TABLE IF NOT EXISTS leaderboard (
          user_id VARCHAR(50) PRIMARY KEY REFERENCES users(id),
          user_name VARCHAR(255) NOT NULL,
          user_picture VARCHAR(500),
          score INTEGER DEFAULT 0,
          badges TEXT[] DEFAULT '{}',
          rank INTEGER DEFAULT 0
        );
      `);

      console.log('🗄️ Database initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing database:', error);
      // Don't throw error - allow app to continue with localStorage fallback
      console.warn('⚠️ Database initialization failed, falling back to localStorage');
      this.isOnline = false;
    }
  }

  // User Progress Management
  async getUserProgress(userId: string): Promise<UserProgress | null> {
    try {
      if (!this.isOnline) {
        // Fallback to localStorage
        const localData = localStorage.getItem(`user_progress_${userId}`);
        return localData ? JSON.parse(localData) : null;
      }

      const result = await this.pool.query(
        'SELECT * FROM user_progress WHERE user_id = $1',
        [userId]
      );

      if (result.rows.length === 0) {
        // Create initial progress
        const initialProgress: UserProgress = {
          userId,
          score: 0,
          streak: 0,
          badges: [],
          totalQuestions: 0,
          correctAnswers: 0,
          lastActive: new Date().toISOString(),
          studySessions: 0
        };

        await this.pool.query(`
          INSERT INTO user_progress (user_id, score, streak, badges, total_questions, correct_answers, last_active, study_sessions)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          initialProgress.userId,
          initialProgress.score,
          initialProgress.streak,
          initialProgress.badges,
          initialProgress.totalQuestions,
          initialProgress.correctAnswers,
          initialProgress.lastActive,
          initialProgress.studySessions
        ]);

        return initialProgress;
      }

      const row = result.rows[0];
      return {
        userId: row.user_id,
        score: row.score,
        streak: row.streak,
        badges: row.badges || [],
        totalQuestions: row.total_questions,
        correctAnswers: row.correct_answers,
        lastActive: row.last_active.toISOString(),
        studySessions: row.study_sessions
      };
    } catch (error) {
      console.error('Error getting user progress:', error);
      // Fallback to localStorage
      console.warn('⚠️ Falling back to localStorage for user progress');
      this.isOnline = false;
      const localData = localStorage.getItem(`user_progress_${userId}`);
      return localData ? JSON.parse(localData) : null;
    }
  }

  async updateUserProgress(userId: string, updates: Partial<UserProgress>): Promise<void> {
    try {
      const currentProgress = await this.getUserProgress(userId);
      if (!currentProgress) return;

      const updatedProgress: UserProgress = {
        ...currentProgress,
        ...updates,
        lastActive: new Date().toISOString()
      };

      if (this.isOnline) {
        await this.pool.query(`
          UPDATE user_progress
          SET score = $1, streak = $2, badges = $3, total_questions = $4,
              correct_answers = $5, last_active = $6, study_sessions = $7
          WHERE user_id = $8
        `, [
          updatedProgress.score,
          updatedProgress.streak,
          updatedProgress.badges,
          updatedProgress.totalQuestions,
          updatedProgress.correctAnswers,
          updatedProgress.lastActive,
          updatedProgress.studySessions,
          updatedProgress.userId
        ]);
      }

      // Always update localStorage as backup
      localStorage.setItem(`user_progress_${userId}`, JSON.stringify(updatedProgress));

      // Update leaderboard
      await this.updateLeaderboard(userId, updatedProgress);

      console.log('✅ User progress updated');
    } catch (error) {
      console.error('Error updating user progress:', error);
      // Fallback to localStorage only
      console.warn('⚠️ Saving to localStorage only');
      this.isOnline = false;
      const currentProgress = await this.getUserProgress(userId);
      if (currentProgress) {
        const updatedProgress: UserProgress = {
          ...currentProgress,
          ...updates,
          lastActive: new Date().toISOString()
        };
        localStorage.setItem(`user_progress_${userId}`, JSON.stringify(updatedProgress));
      }
    }
  }

  // Study Session Management
  async saveStudySession(session: Omit<StudySession, 'id'>): Promise<void> {
    try {
      await this.pool.query(`
        INSERT INTO study_sessions (
          user_id, topic, score, total_questions, correct_answers,
          start_time, end_time, duration, difficulty, question_types, time_per_question
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        session.userId,
        session.topic,
        session.score,
        session.totalQuestions,
        session.correctAnswers,
        session.startTime,
        session.endTime,
        session.duration,
        session.difficulty,
        session.questionTypes,
        session.timePerQuestion
      ]);

      // Update user progress
      const currentProgress = await this.getUserProgress(session.userId);
      if (currentProgress) {
        await this.updateUserProgress(session.userId, {
          score: currentProgress.score + session.score,
          totalQuestions: currentProgress.totalQuestions + session.totalQuestions,
          correctAnswers: currentProgress.correctAnswers + session.correctAnswers,
          studySessions: currentProgress.studySessions + 1
        });
      }

      console.log('✅ Study session saved');
    } catch (error) {
      console.error('Error saving study session:', error);
    }
  }

  async getUserStudySessions(userId: string): Promise<StudySession[]> {
    try {
      const result = await this.pool.query(`
        SELECT * FROM study_sessions
        WHERE user_id = $1
        ORDER BY start_time DESC
      `, [userId]);

      return result.rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        topic: row.topic,
        score: row.score,
        totalQuestions: row.total_questions,
        correctAnswers: row.correct_answers,
        startTime: row.start_time.toISOString(),
        endTime: row.end_time.toISOString(),
        duration: row.duration,
        difficulty: row.difficulty,
        questionTypes: row.question_types,
        timePerQuestion: row.time_per_question
      }));
    } catch (error) {
      console.error('Error getting user sessions:', error);
      return [];
    }
  }

  // Badge System
  async checkAndAwardBadges(userId: string): Promise<string[]> {
    try {
      const progress = await this.getUserProgress(userId);
      if (!progress) return [];

      const newBadges: string[] = [];
      const currentBadges = progress.badges || [];
      const correctAnswers = progress.correctAnswers;

      // Score-based badges
      if (correctAnswers >= 10 && !currentBadges.includes('bronze')) {
        newBadges.push('bronze');
      }
      if (correctAnswers >= 25 && !currentBadges.includes('silver')) {
        newBadges.push('silver');
      }
      if (correctAnswers >= 50 && !currentBadges.includes('gold')) {
        newBadges.push('gold');
      }

      // Streak badges
      if (progress.streak >= 7 && !currentBadges.includes('week_streak')) {
        newBadges.push('week_streak');
      }
      if (progress.streak >= 30 && !currentBadges.includes('month_streak')) {
        newBadges.push('month_streak');
      }

      // Session badges
      if (progress.studySessions >= 5 && !currentBadges.includes('dedicated_learner')) {
        newBadges.push('dedicated_learner');
      }
      if (progress.studySessions >= 20 && !currentBadges.includes('knowledge_seeker')) {
        newBadges.push('knowledge_seeker');
      }

      // Update badges if new ones were earned
      if (newBadges.length > 0) {
        await this.updateUserProgress(userId, {
          badges: [...currentBadges, ...newBadges]
        });
      }

      return newBadges;
    } catch (error) {
      console.error('Error checking badges:', error);
      return [];
    }
  }

  // Leaderboard Management
  async updateLeaderboard(userId: string, progress: UserProgress): Promise<void> {
    try {
      // Get user name from users table
      const userResult = await this.pool.query(
        'SELECT name FROM users WHERE id = $1',
        [userId]
      );

      const userName = userResult.rows[0]?.name || 'Anonymous';

      await this.pool.query(`
        INSERT INTO leaderboard (user_id, user_name, score, badges)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id)
        DO UPDATE SET
          user_name = EXCLUDED.user_name,
          score = EXCLUDED.score,
          badges = EXCLUDED.badges
      `, [userId, userName, progress.score, progress.badges]);

      // Update ranks
      await this.updateLeaderboardRanks();
    } catch (error) {
      console.error('Error updating leaderboard:', error);
    }
  }

  private async updateLeaderboardRanks(): Promise<void> {
    try {
      await this.pool.query(`
        WITH ranked AS (
          SELECT user_id, ROW_NUMBER() OVER (ORDER BY score DESC) as new_rank
          FROM leaderboard
        )
        UPDATE leaderboard
        SET rank = ranked.new_rank
        FROM ranked
        WHERE leaderboard.user_id = ranked.user_id
      `);
    } catch (error) {
      console.error('Error updating leaderboard ranks:', error);
    }
  }

  async getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
    try {
      const result = await this.pool.query(`
        SELECT * FROM leaderboard
        ORDER BY rank ASC
        LIMIT $1
      `, [limit]);

      return result.rows.map(row => ({
        userId: row.user_id,
        userName: row.user_name,
        userPicture: row.user_picture,
        score: row.score,
        badges: row.badges || [],
        rank: row.rank
      }));
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return [];
    }
  }

  // Analytics and Insights
  async getUserAnalytics(userId: string) {
    try {
      const progress = await this.getUserProgress(userId);
      const sessions = await this.getUserStudySessions(userId);

      if (!progress) return null;

      const accuracy = progress.totalQuestions > 0
        ? Math.round((progress.correctAnswers / progress.totalQuestions) * 100)
        : 0;

      const averageSessionScore = sessions.length > 0
        ? Math.round(sessions.reduce((sum, session) => sum + session.score, 0) / sessions.length)
        : 0;

      const topicsStudied = [...new Set(sessions.map(session => session.topic))];

      return {
        totalScore: progress.score,
        accuracy,
        currentStreak: progress.streak,
        totalSessions: progress.studySessions,
        averageSessionScore,
        topicsStudied: topicsStudied.length,
        badges: progress.badges.length,
        recentSessions: sessions.slice(0, 5)
      };
    } catch (error) {
      console.error('Error getting analytics:', error);
      return null;
    }
  }

  // Detailed Learning Analytics for Home Page
  async getLearningAnalytics(userId: string): Promise<LearningAnalytics> {
    try {
      const sessions = await this.getUserStudySessions(userId);
      const userProgress = await this.getUserProgress(userId);

      if (!userProgress || sessions.length === 0) {
        return {
          userId,
          totalStudySessions: 0,
          totalQuizSessions: 0,
          overallAccuracy: 0,
          averageSessionScore: 0,
          weakAreas: [],
          strongAreas: [],
          improvementSuggestions: [
            "🌱 Start with easy topics to build confidence",
            "📅 Practice regularly to develop a learning habit",
            "🎆 Try different subjects to discover your interests"
          ],
          topicPerformances: [],
          studyStreak: userProgress?.streak || 0,
          bestStreak: userProgress?.streak || 0,
          timeSpentLearning: 0,
          lastActive: new Date().toISOString()
        };
      }

      // Analyze topic performances
      const topicMap = new Map<string, TopicPerformance>();
      let totalCorrect = 0;
      let totalQuestions = 0;
      let totalScore = 0;

      sessions.forEach(session => {
        totalCorrect += session.correctAnswers;
        totalQuestions += session.totalQuestions;
        totalScore += session.score;

        const existing = topicMap.get(session.topic) || {
          topic: session.topic,
          totalAttempts: 0,
          correctAnswers: 0,
          totalQuestions: 0,
          averageScore: 0,
          averageTime: session.duration || 600, // 10 minutes default
          difficultyBreakdown: {
            easy: { correct: 0, total: 0 },
            medium: { correct: 0, total: 0 },
            hard: { correct: 0, total: 0 }
          },
          lastAttempt: session.endTime,
          improvementTrend: 'stable' as const
        };

        existing.totalAttempts += 1;
        existing.correctAnswers += session.correctAnswers;
        existing.totalQuestions += session.totalQuestions;
        existing.averageScore = Math.round((existing.averageScore * (existing.totalAttempts - 1) + session.score) / existing.totalAttempts);
        existing.lastAttempt = session.endTime;

        topicMap.set(session.topic, existing);
      });

      const overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
      const averageSessionScore = Math.round(totalScore / sessions.length);

      // Determine weak and strong areas based on accuracy
      const topicPerformances = Array.from(topicMap.values());
      const weakAreas = topicPerformances
        .filter(tp => (tp.correctAnswers / tp.totalQuestions) < 0.6)
        .sort((a, b) => (a.correctAnswers / a.totalQuestions) - (b.correctAnswers / b.totalQuestions))
        .map(tp => tp.topic)
        .slice(0, 3);

      const strongAreas = topicPerformances
        .filter(tp => (tp.correctAnswers / tp.totalQuestions) >= 0.8)
        .sort((a, b) => (b.correctAnswers / b.totalQuestions) - (a.correctAnswers / a.totalQuestions))
        .map(tp => tp.topic)
        .slice(0, 3);

      // Generate personalized improvement suggestions
      const improvementSuggestions = this.generateImprovementSuggestions(
        overallAccuracy,
        userProgress.streak,
        weakAreas,
        strongAreas,
        sessions.length
      );

      return {
        userId,
        totalStudySessions: sessions.filter(s => s.totalQuestions <= 8).length,
        totalQuizSessions: sessions.filter(s => s.totalQuestions > 8).length,
        overallAccuracy,
        averageSessionScore,
        weakAreas,
        strongAreas,
        improvementSuggestions,
        topicPerformances: topicPerformances.slice(0, 10), // Top 10 topics
        studyStreak: userProgress.streak,
        bestStreak: Math.max(userProgress.streak, this.getBestStreakFromSessions(sessions)),
        timeSpentLearning: sessions.length * 10, // Estimate 10 minutes per session
        lastActive: sessions[0]?.endTime || userProgress.lastActive
      };
    } catch (error) {
      console.error('Error getting learning analytics:', error);
      return {
        userId,
        totalStudySessions: 0,
        totalQuizSessions: 0,
        overallAccuracy: 0,
        averageSessionScore: 0,
        weakAreas: [],
        strongAreas: [],
        improvementSuggestions: ['⚠️ Unable to load analytics. Please try again.'],
        topicPerformances: [],
        studyStreak: 0,
        bestStreak: 0,
        timeSpentLearning: 0,
        lastActive: new Date().toISOString()
      };
    }
  }

  private generateImprovementSuggestions(
    accuracy: number,
    streak: number,
    weakAreas: string[],
    strongAreas: string[],
    totalSessions: number
  ): string[] {
    const suggestions: string[] = [];

    // Accuracy-based suggestions
    if (accuracy < 40) {
      suggestions.push("📚 Focus on Learning Mode before taking quizzes");
      suggestions.push("🔍 Review basic concepts and foundational knowledge");
    } else if (accuracy < 60) {
      suggestions.push("🧐 Carefully read explanations after wrong answers");
      suggestions.push("💪 Practice more questions in your weak areas");
    } else if (accuracy < 75) {
      suggestions.push("⏱️ Work on time management during quizzes");
      suggestions.push("🎆 Try tackling medium and hard difficulty questions");
    } else if (accuracy < 85) {
      suggestions.push("🚀 Challenge yourself with advanced topics");
      suggestions.push("🎓 Consider exploring specialized subject areas");
    } else {
      suggestions.push("🎉 Excellent performance! Share knowledge with others");
      suggestions.push("🌍 Explore new challenging domains to expand expertise");
    }

    // Streak-based suggestions
    if (streak < 3) {
      suggestions.push("📅 Build consistency - aim for daily 10-minute sessions");
    } else if (streak >= 7) {
      suggestions.push("🔥 Amazing streak! Keep up the momentum");
    }

    // Topic-specific suggestions
    if (weakAreas.length > 0) {
      suggestions.push(`🎯 Priority focus areas: ${weakAreas.slice(0, 2).join(', ')}`);
    }

    if (strongAreas.length > 0 && weakAreas.length === 0) {
      suggestions.push(`✨ You excel in: ${strongAreas.slice(0, 2).join(', ')}`);
    }

    // Session-based suggestions
    if (totalSessions < 5) {
      suggestions.push("🌱 Complete more sessions to unlock detailed insights");
    }

    return suggestions.slice(0, 5); // Return top 5 suggestions
  }

  private getBestStreakFromSessions(sessions: StudySession[]): number {
    // Simple mock calculation - in real app would analyze session dates
    return Math.max(5, sessions.length);
  }

  // Clear all data (for testing/reset)
  async clearAllData(): Promise<void> {
    try {
      await this.pool.query('DELETE FROM study_sessions');
      await this.pool.query('DELETE FROM user_progress');
      await this.pool.query('DELETE FROM leaderboard');
      await this.pool.query('DELETE FROM users');
      console.log('🗑️ All data cleared successfully');
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  }
}

export const databaseService = new DatabaseService();
export default databaseService;
