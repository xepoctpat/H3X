// MongoDB initialization script for H3X project

// Create H3X database
db = db.getSiblingDB('h3x');

// Create collections
db.createCollection('nodes');
db.createCollection('triads');
db.createCollection('cflups');
db.createCollection('amendments');
db.createCollection('logs');
db.createCollection('metrics');

// Create indexes for performance
db.nodes.createIndex({ "id": 1 }, { unique: true });
db.nodes.createIndex({ "x": 1, "y": 1, "z": 1 });
db.nodes.createIndex({ "timestamp": 1 });

db.triads.createIndex({ "id": 1 }, { unique: true });
db.triads.createIndex({ "nodeIds": 1 });
db.triads.createIndex({ "timestamp": 1 });

db.cflups.createIndex({ "id": 1 }, { unique: true });
db.cflups.createIndex({ "status": 1 });
db.cflups.createIndex({ "createdAt": 1 });

db.amendments.createIndex({ "id": 1 }, { unique: true });
db.amendments.createIndex({ "cflupId": 1 });
db.amendments.createIndex({ "timestamp": 1 });

db.logs.createIndex({ "timestamp": 1 });
db.logs.createIndex({ "level": 1 });

db.metrics.createIndex({ "timestamp": 1 });
db.metrics.createIndex({ "type": 1 });

// Insert sample data
db.nodes.insertMany([
    {
        id: "node-001",
        x: 0,
        y: 0,
        z: 0,
        color: 0x3498db,
        radius: 1.0,
        visible: true,
        timestamp: new Date()
    },
    {
        id: "node-002", 
        x: 2,
        y: 0,
        z: 0,
        color: 0xe74c3c,
        radius: 1.0,
        visible: true,
        timestamp: new Date()
    },
    {
        id: "node-003",
        x: 1,
        y: 1.732,
        z: 0,
        color: 0x2ecc71,
        radius: 1.0,
        visible: true,
        timestamp: new Date()
    }
]);

db.triads.insertOne({
    id: "triad-001",
    nodeIds: ["node-001", "node-002", "node-003"],
    color: 0xffffff,
    width: 2,
    visible: true,
    strength: 1.0,
    type: "hexagonal",
    timestamp: new Date()
});

print('H3X database initialized successfully');
