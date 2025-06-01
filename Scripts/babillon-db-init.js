#!/usr/bin/env node

/**
 * Babillon Unified System - Database Initialization Script
 * Sets up MongoDB, Redis, and PostgreSQL with initial data and configurations
 */

const { MongoClient } = require('mongodb');
const redis = require('redis');
const { Client: PostgresClient } = require('pg');

class BabillonDatabaseInitializer {
    constructor() {
        this.mongoUrl = process.env.MONGODB_URL || 'mongodb://localhost:27017';
        this.redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
        this.postgresConfig = {
            host: process.env.POSTGRES_HOST || 'localhost',
            port: process.env.POSTGRES_PORT || 5432,
            database: process.env.POSTGRES_DB || 'babillon',
            user: process.env.POSTGRES_USER || 'babillon',
            password: process.env.POSTGRES_PASSWORD || 'babillon_pass'
        };
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
                    name: 'sessions',
                    indexes: [{ sessionId: 1 }, { userId: 1 }, { expiresAt: 1 }],
                    ttl: { expiresAt: 1 }
                },
                {
                    name: 'agents',
                    indexes: [{ agentId: 1 }, { status: 1 }, { createdAt: -1 }],
                    initialData: [
                        {
                            agentId: 'babillon-agent-001',
                            name: 'Primary Babillon Agent',
                            type: 'coordinator',
                            status: 'active',
                            capabilities: ['coordination', 'monitoring', 'communication'],
                            createdAt: new Date()
                        }
                    ]
                },
                {
                    name: 'system_logs',
                    indexes: [{ timestamp: -1 }, { level: 1 }, { service: 1 }],
                    initialData: [
                        {
                            timestamp: new Date(),
                            level: 'info',
                            service: 'database-init',
                            message: 'MongoDB initialized successfully',
                            metadata: { version: '1.0.0' }
                        }
                    ]
                },
                {
                    name: 'configurations',
                    indexes: [{ key: 1 }, { service: 1 }],
                    initialData: [
                        {
                            key: 'system.version',
                            value: '1.0.0',
                            service: 'babillon-core',
                            updatedAt: new Date()
                        },
                        {
                            key: 'features.h3x_integration',
                            value: true,
                            service: 'babillon-core',
                            updatedAt: new Date()
                        },
                        {
                            key: 'features.sir_integration',
                            value: true,
                            service: 'babillon-core',
                            updatedAt: new Date()
                        }
                    ]
                },
                {
                    name: 'metrics',
                    indexes: [{ timestamp: -1 }, { metric_name: 1 }, { service: 1 }]
                },
                {
                    name: 'feedback_data',
                    indexes: [{ timestamp: -1 }, { source: 1 }, { type: 1 }]
                }
            ];

            for (const collectionConfig of collections) {
                console.log(`  📁 Creating collection: ${collectionConfig.name}`);
                
                // Create collection
                await db.createCollection(collectionConfig.name);
                const collection = db.collection(collectionConfig.name);

                // Create indexes
                for (const index of collectionConfig.indexes) {
                    await collection.createIndex(index);
                }

                // Set TTL if specified
                if (collectionConfig.ttl) {
                    await collection.createIndex(collectionConfig.ttl);
                }

                // Insert initial data
                if (collectionConfig.initialData && collectionConfig.initialData.length > 0) {
                    await collection.insertMany(collectionConfig.initialData);
                    console.log(`    ✅ Inserted ${collectionConfig.initialData.length} initial documents`);
                }
            }

            console.log('  ✅ MongoDB initialization complete');
            
        } catch (error) {
            console.error('  ❌ MongoDB initialization failed:', error.message);
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

            // Initialize Redis with default configurations
            const initialData = {
                'config:cache_ttl': '3600',
                'config:session_ttl': '86400',
                'config:rate_limit': '100',
                'system:version': '1.0.0',
                'system:startup_time': new Date().toISOString(),
                'features:real_time_updates': 'true',
                'features:caching_enabled': 'true'
            };

            console.log('  🔧 Setting initial configurations...');
            for (const [key, value] of Object.entries(initialData)) {
                await client.set(key, value);
            }

            // Create some initial lists and sets
            await client.lPush('system:startup_log', `System initialized at ${new Date().toISOString()}`);
            await client.sAdd('active_services', 'babillon-web', 'babillon-api', 'babillon-agents');

            // Set up some sample counters
            await client.set('counters:total_requests', '0');
            await client.set('counters:active_users', '0');
            await client.set('counters:system_errors', '0');

            console.log('  ✅ Redis initialization complete');
            
        } catch (error) {
            console.error('  ❌ Redis initialization failed:', error.message);
            throw error;
        } finally {
            if (client) {
                await client.quit();
            }
        }
    }

    async initializePostgreSQL() {
        console.log('🐘 Initializing PostgreSQL...');
        
        let client;
        try {
            client = new PostgresClient(this.postgresConfig);
            await client.connect();

            // Create initial tables
            const tables = [
                {
                    name: 'system_events',
                    sql: `
                        CREATE TABLE IF NOT EXISTS system_events (
                            id SERIAL PRIMARY KEY,
                            event_type VARCHAR(100) NOT NULL,
                            event_data JSONB,
                            service_name VARCHAR(100),
                            timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                        );
                        
                        CREATE INDEX IF NOT EXISTS idx_system_events_timestamp ON system_events(timestamp);
                        CREATE INDEX IF NOT EXISTS idx_system_events_type ON system_events(event_type);
                        CREATE INDEX IF NOT EXISTS idx_system_events_service ON system_events(service_name);
                    `
                },
                {
                    name: 'performance_metrics',
                    sql: `
                        CREATE TABLE IF NOT EXISTS performance_metrics (
                            id SERIAL PRIMARY KEY,
                            metric_name VARCHAR(100) NOT NULL,
                            metric_value DECIMAL(10,4),
                            metric_unit VARCHAR(20),
                            service_name VARCHAR(100),
                            timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                        );
                        
                        CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON performance_metrics(timestamp);
                        CREATE INDEX IF NOT EXISTS idx_performance_metrics_name ON performance_metrics(metric_name);
                    `
                },
                {
                    name: 'audit_logs',
                    sql: `
                        CREATE TABLE IF NOT EXISTS audit_logs (
                            id SERIAL PRIMARY KEY,
                            user_id VARCHAR(100),
                            action VARCHAR(100) NOT NULL,
                            resource VARCHAR(200),
                            details JSONB,
                            ip_address INET,
                            user_agent TEXT,
                            timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                        );
                        
                        CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
                        CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
                        CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
                    `
                }
            ];

            for (const table of tables) {
                console.log(`  📋 Creating table: ${table.name}`);
                await client.query(table.sql);
            }

            // Insert initial data
            const initialEvents = [
                {
                    event_type: 'system_initialization',
                    event_data: JSON.stringify({ version: '1.0.0', component: 'database' }),
                    service_name: 'babillon-database-init'
                },
                {
                    event_type: 'service_startup',
                    event_data: JSON.stringify({ service: 'postgresql', status: 'initialized' }),
                    service_name: 'babillon-database'
                }
            ];

            for (const event of initialEvents) {
                await client.query(
                    'INSERT INTO system_events (event_type, event_data, service_name) VALUES ($1, $2, $3)',
                    [event.event_type, event.event_data, event.service_name]
                );
            }

            console.log('  ✅ PostgreSQL initialization complete');
            
        } catch (error) {
            console.error('  ❌ PostgreSQL initialization failed:', error.message);
            throw error;
        } finally {
            if (client) {
                await client.end();
            }
        }
    }

    async runInitialization() {
        console.log('🚀 Babillon Unified Database Initialization');
        console.log('============================================');
        console.log(`Started at: ${new Date().toISOString()}`);
        console.log('');

        try {
            await this.initializeMongoDB();
            console.log('');
            
            await this.initializeRedis();
            console.log('');
            
            await this.initializePostgreSQL();
            console.log('');

            console.log('✅ All databases initialized successfully!');
            console.log('');
            console.log('🎯 Next Steps:');
            console.log('  1. Start the Babillon unified system: npm run babillon:unified:start');
            console.log('  2. Run health checks: npm run babillon:health:all');
            console.log('  3. Access the web interface: http://localhost:80');
            
        } catch (error) {
            console.error('❌ Database initialization failed:', error.message);
            process.exit(1);
        }
    }
}

// Run initialization if this script is executed directly
if (require.main === module) {
    const initializer = new BabillonDatabaseInitializer();
    initializer.runInitialization().catch(error => {
        console.error('❌ Initialization script failed:', error.message);
        process.exit(1);
    });
}

module.exports = BabillonDatabaseInitializer;
