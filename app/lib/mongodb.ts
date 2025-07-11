import { MongoClient, Db } from 'mongodb';

interface MongoConnection {
  client: MongoClient;
  db: Db;
}

class MongoDB {
  private static instance: MongoDB;
  private client: MongoClient | null = null;
  private db: Db | null = null;

  private constructor() {}

  static getInstance(): MongoDB {
    if (!MongoDB.instance) {
      MongoDB.instance = new MongoDB();
    }
    return MongoDB.instance;
  }

  async connect(): Promise<MongoConnection> {
    if (this.client && this.db) {
      return { client: this.client, db: this.db };
    }

    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    try {
      this.client = new MongoClient(uri);
      await this.client.connect();
      
      // Extract database name from URI or use default
      const dbName = this.extractDatabaseName(uri) || 'journaline';
      this.db = this.client.db(dbName);

      console.log('Connected to MongoDB');
      return { client: this.client, db: this.db };
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw new Error('Failed to connect to MongoDB');
    }
  }

  private extractDatabaseName(uri: string): string | null {
    try {
      const url = new URL(uri);
      const pathname = url.pathname.slice(1); // Remove leading slash
      const dbName = pathname.split('?')[0]; // Remove query parameters
      return dbName || null;
    } catch {
      return null;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      console.log('Disconnected from MongoDB');
    }
  }

  getDb(): Db {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }
}

export default MongoDB; 