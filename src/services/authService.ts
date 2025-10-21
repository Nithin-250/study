import { Pool } from 'pg';

export interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  lastActive?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

class AuthService {
  private pool: Pool;

  constructor() {
    // PostgreSQL connection configuration
    this.pool = new Pool({
      connectionString: 'postgresql://postgres:Nithin@123@db.bgfcskbyxoowhakrjeeb.supabase.co:5432/postgres',
      ssl: { rejectUnauthorized: false } // For Supabase
    });

    console.log('🔐 Email/Password Auth Service initialized with PostgreSQL');
  }

  async register(credentials: RegisterCredentials): Promise<User> {
    try {
      // For demo purposes, we'll use a simple hash instead of bcrypt in production
      // In production, this would use proper password hashing
      console.log('🔄 Registering user:', credentials.email);

      // Hash password (using a simple hash for demo - use bcrypt in production)
      const passwordHash = await this.hashPassword(credentials.password);

      // Create new user
      const userId = 'user_' + Date.now();
      const now = new Date().toISOString();

      await this.pool.query(`
        INSERT INTO users (id, name, email, password_hash, created_at, last_active)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [userId, credentials.name, credentials.email, passwordHash, now, now]);

      const user: User = {
        _id: userId,
        name: credentials.name,
        email: credentials.email,
        createdAt: now,
        lastActive: now
      };

      // Store user session in localStorage (for client-side session management)
      localStorage.setItem('empowerlearn_user', JSON.stringify(user));

      console.log('✅ User registered successfully:', user.name);
      return user;

    } catch (error) {
      console.error('❌ Database registration error:', error);
      console.warn('⚠️ Falling back to localStorage for user registration');

      // Fallback to localStorage
      const existingUsers = JSON.parse(localStorage.getItem('empowerlearn_users') || '[]');
      const userExists = existingUsers.find((u: User) => u.email === credentials.email);

      if (userExists) {
        throw new Error('User with this email already exists');
      }

      // Create new user
      const user: User = {
        _id: 'user_' + Date.now(),
        name: credentials.name,
        email: credentials.email,
        createdAt: new Date().toISOString()
      };

      // Store user credentials (in production, this would be hashed and stored securely)
      const userWithPassword = {
        ...user,
        password: credentials.password // In production, this should be hashed
      };

      existingUsers.push(userWithPassword);
      localStorage.setItem('empowerlearn_users', JSON.stringify(existingUsers));
      localStorage.setItem('empowerlearn_user', JSON.stringify(user));

      console.log('✅ User registered successfully (localStorage):', user.name);
      return user;
    }
  }

  async login(credentials: LoginCredentials): Promise<User> {
    try {
      console.log('🔄 Logging in user:', credentials.email);

      // Get user from database
      const result = await this.pool.query(
        'SELECT * FROM users WHERE email = $1',
        [credentials.email]
      );

      if (result.rows.length === 0) {
        throw new Error('Invalid email or password');
      }

      const userData = result.rows[0];

      // Verify password
      const isValidPassword = await this.verifyPassword(credentials.password, userData.password_hash);
      if (!isValidPassword) {
        throw new Error('Invalid email or password');
      }

      // Update last active
      const now = new Date().toISOString();
      await this.pool.query(
        'UPDATE users SET last_active = $1 WHERE id = $2',
        [now, userData.id]
      );

      // Remove password from user object before storing in session
      const { password_hash, ...user } = userData;

      const userObject: User = {
        _id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.created_at,
        lastActive: now
      };

      localStorage.setItem('empowerlearn_user', JSON.stringify(userObject));

      console.log('✅ User logged in successfully:', user.name);
      return userObject;

    } catch (error) {
      console.error('❌ Database login error:', error);
      console.warn('⚠️ Falling back to localStorage for user login');

      // Fallback to localStorage
      const existingUsers = JSON.parse(localStorage.getItem('empowerlearn_users') || '[]');
      const userWithPassword = existingUsers.find((u: any) =>
        u.email === credentials.email && u.password === credentials.password
      );

      if (!userWithPassword) {
        throw new Error('Invalid email or password');
      }

      // Remove password from user object before storing in session
      const { password, ...user } = userWithPassword;

      const userObject: User = {
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        lastActive: new Date().toISOString()
      };

      localStorage.setItem('empowerlearn_user', JSON.stringify(userObject));

      console.log('✅ User logged in successfully (localStorage):', user.name);
      return userObject;
    }
  }

  getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem('empowerlearn_user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  signOut(): void {
    try {
      localStorage.removeItem('empowerlearn_user');
      localStorage.removeItem('user_progress');
      localStorage.removeItem('study_sessions');

      console.log('✅ User signed out successfully');
      window.location.reload();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  // Helper methods for password hashing
  private async hashPassword(password: string): Promise<string> {
    // In production, use bcrypt or argon2
    // For demo purposes, using a simple hash
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'salt123'); // Simple salt
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    const hashedPassword = await this.hashPassword(password);
    return hashedPassword === hash;
  }

  // Update user last active time
  async updateLastActive(userId: string): Promise<void> {
    try {
      const now = new Date().toISOString();
      await this.pool.query(
        'UPDATE users SET last_active = $1 WHERE id = $2',
        [now, userId]
      );
    } catch (error) {
      console.error('Error updating last active:', error);
    }
  }
}

export const authService = new AuthService();
export default authService;
