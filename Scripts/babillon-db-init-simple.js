#!/usr/bin/env node

/**
 * Babillon Unified System - Simple Database Initialization Script
 * Sets up MongoDB and Redis with initial data and configurations
 */

const { MongoClient } = require('mongodb');
const redis = require('redis');

class BabillonDatabaseInitializer {    constructor() {
        this.mongoUrl = process.env.MONGODB_URL || 'mongodb://babillon:babillon-secure-password@localhost:27017/babillon?authSource=admin';
        this.redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    }

    async initializeMongoDB() {
        console.log('🍃 Initializing MongoDB...');
        
        let client;
        try {
            client = new MongoClient(this.mongoUrl);
            await client.connect();
            
            const db = client.db('babillon');
            
            // Create collections with initial data
            const collections = [
                {
                    name: 'users',
                    indexes: [{ email: 1 }, { username: 1 }],
                    initialData: [
                        {
                            _id: 'admin',
                            username: 'admin',
                            email: 'admin@babillon.local',
                            role: 'administrator',
                            createdAt: new Date(),
                            isActive: true
                        }
                    ]
                },
                {
                    name: 'agents',
                    indexes: [{ name: 1 }, { type: 1 }],
                    initialData: [
                        {
                            _id: 'babillon-assistant',
                            name: 'Babillon Assistant',
                            type: 'conversational',
                            status: 'active',
                            capabilities: ['conversation', 'help', 'information'],
                            createdAt: new Date()
                        }
                    ]
                },
                {
                    name: 'conversations',
                    indexes: [{ userId: 1 }, { createdAt: -1 }],
                    initialData: []
                },
                {
                    name: 'system_config',
                    indexes: [{ key: 1 }],
                    initialData: [
                        {
                            key: 'system_version',
                            value: '1.0.0',
                            updatedAt: new Date()
                        },
                        {
                            key: 'api_settings',
                            value: {
                                rateLimit: 1000,
                                timeout: 30000
                            },
                            updatedAt: new Date()
                        }
                    ]
                }
            ];

            for (const collection of collections) {
                console.log(`  Creating collection: ${collection.name}`);
                
                // Create collection
                await db.createCollection(collection.name);
                
                // Create indexes
                if (collection.indexes && collection.indexes.length > 0) {
                    await db.collection(collection.name).createIndexes(
                        collection.indexes.map(index => ({ key: index }))
                    );
                }
                
                // Insert initial data
                if (collection.initialData && collection.initialData.length > 0) {
                    await db.collection(collection.name).insertMany(collection.initialData);
                    console.log(`    Inserted ${collection.initialData.length} initial documents`);
                }
            }
            
            console.log('✅ MongoDB initialization completed');
            
        } catch (error) {
            console.error('❌ MongoDB initialization failed:', error.message);
            throw error;
        } finally {
            if (client) {
                await client.close();
            }
        }
    }

    async initializeRedis() {
        console.log('🔴 Initializing Redis...');
        
        let client;
        try {
            client = redis.createClient({ url: this.redisUrl });
            await client.connect();
            
            // Set initial cache values
            const initialData = {
                'system:status': 'active',
                'system:startup_time': new Date().toISOString(),
                'config:cache_ttl': '3600',
                'config:session_timeout': '1800'
            };

            for (const [key, value] of Object.entries(initialData)) {
                await client.set(key, value);
                console.log(`  Set cache key: ${key}`);
            }
            
            // Set up some hash data
            await client.hSet('system:stats', {
                'requests_count': '0',
                'active_sessions': '0',
                'last_restart': new Date().toISOString()
            });
            
            console.log('✅ Redis initialization completed');
            
        } catch (error) {
            console.error('❌ Redis initialization failed:', error.message);
            throw error;
        } finally {
            if (client) {
                await client.quit();
            }
        }
    }

    async initialize() {
        console.log('🚀 Starting Babillon Unified System Database Initialization');
        console.log('================================================');
        
        try {
            await this.initializeMongoDB();
            await this.initializeRedis();
            
            console.log('================================================');
            console.log('✅ All databases initialized successfully!');
            console.log('🎉 Babillon Unified System is ready to use');
            
        } catch (error) {
            console.error('================================================');
            console.error('❌ Database initialization failed:', error.message);
            console.error('💡 Please check your database connections and try again');
            process.exit(1);
        }
    }
}

// Run initialization if script is executed directly
if (require.main === module) {
    const initializer = new BabillonDatabaseInitializer();
    initializer.initialize().catch(console.error);
}

module.exports = BabillonDatabaseInitializer;
