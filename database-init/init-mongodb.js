// MongoDB Initialization Script for H3X Unified System
// This script sets up the database structure, indexes, and initial data

// Connect to the database
use h3x_unified;

// Create admin user
db.createUser({
    user: "h3x_admin",
    pwd: "h3x_secure_password_2025",
    roles: [
        { role: "readWrite", db: "h3x_unified" },
        { role: "dbAdmin", db: "h3x_unified" }
    ]
});

// ================================
// CORE H3X COLLECTIONS
// ================================

// H3X System logs
db.createCollection("system_logs");
db.system_logs.createIndex({ "timestamp": 1 });
db.system_logs.createIndex({ "level": 1 });
db.system_logs.createIndex({ "component": 1 });

// LM Studio interactions
db.createCollection("lmstudio_interactions");
db.lmstudio_interactions.createIndex({ "timestamp": 1 });
db.lmstudio_interactions.createIndex({ "model": 1 });
db.lmstudio_interactions.createIndex({ "session_id": 1 });

// ================================
// REAL-TIME DATA COLLECTIONS
// ================================

// Weather data
db.createCollection("weather_data");
db.weather_data.createIndex({ "timestamp": 1 });
db.weather_data.createIndex({ "location": 1 });
db.weather_data.createIndex({ "source": 1 });

// Financial data
db.createCollection("financial_data");
db.financial_data.createIndex({ "timestamp": 1 });
db.financial_data.createIndex({ "symbol": 1 });
db.financial_data.createIndex({ "data_type": 1 });

// Social media data
db.createCollection("social_data");
db.social_data.createIndex({ "timestamp": 1 });
db.social_data.createIndex({ "platform": 1 });
db.social_data.createIndex({ "sentiment": 1 });

// ================================
// FEEDBACK LOOP COLLECTIONS
// ================================

// Feedback processing results
db.createCollection("feedback_results");
db.feedback_results.createIndex({ "timestamp": 1 });
db.feedback_results.createIndex({ "processor_id": 1 });
db.feedback_results.createIndex({ "correlation_strength": 1 });

// Virtual pulse data
db.createCollection("virtual_pulses");
db.virtual_pulses.createIndex({ "timestamp": 1 });
db.virtual_pulses.createIndex({ "pulse_type": 1 });
db.virtual_pulses.createIndex({ "frequency": 1 });

// Predictive intelligence results
db.createCollection("prediction_results");
db.prediction_results.createIndex({ "timestamp": 1 });
db.prediction_results.createIndex({ "prediction_type": 1 });
db.prediction_results.createIndex({ "confidence": 1 });

// ================================
// FLUPS INTEGRATION COLLECTIONS
// ================================

// fLups system state
db.createCollection("flups_state");
db.flups_state.createIndex({ "timestamp": 1 });
db.flups_state.createIndex({ "component": 1 });

// Hexagonal processing data
db.createCollection("hexagonal_data");
db.hexagonal_data.createIndex({ "timestamp": 1 });
db.hexagonal_data.createIndex({ "hex_id": 1 });
db.hexagonal_data.createIndex({ "triad_position": 1 });

// ================================
// SYSTEM CONFIGURATION
// ================================

// Configuration storage
db.createCollection("system_config");

// Insert initial system configuration
db.system_config.insertOne({
    "_id": "main_config",
    "version": "2.0.0",
    "system_name": "H3X Unified System",
    "initialization_date": new Date(),
    "modules": {
        "h3x_core": { "enabled": true, "version": "1.0.0" },
        "flups_integration": { "enabled": true, "version": "1.0.0" },
        "real_time_data": { "enabled": true, "version": "1.0.0" },
        "feedback_loops": { "enabled": true, "version": "1.0.0" },
        "lmstudio_integration": { "enabled": true, "version": "1.0.0" }
    },
    "settings": {
        "data_retention_days": 30,
        "max_concurrent_processes": 10,
        "feedback_learning_rate": 0.01,
        "auto_cleanup": true
    }
});

// Insert initial feedback configuration
db.system_config.insertOne({
    "_id": "feedback_config",
    "stability_coefficient": 0.95,
    "momentum_factor": 0.9,
    "volatility_threshold": 0.1,
    "learning_rate": 0.01,
    "adaptation_speed": 0.05,
    "pulse_frequency": 0.1,
    "pulse_amplitude": 1.0,
    "correlation_threshold": 0.7
});

// ================================
// INITIAL TEST DATA
// ================================

// Insert sample weather data
db.weather_data.insertOne({
    "timestamp": new Date(),
    "location": "Global",
    "temperature": 20.5,
    "humidity": 65,
    "pressure": 1013.25,
    "wind_speed": 5.2,
    "source": "initialization",
    "data_quality": "test"
});

// Insert sample financial data
db.financial_data.insertOne({
    "timestamp": new Date(),
    "symbol": "TEST",
    "price": 100.0,
    "volume": 1000,
    "change": 0.0,
    "change_percent": 0.0,
    "source": "initialization",
    "data_type": "stock"
});

// Insert initial system log
db.system_logs.insertOne({
    "timestamp": new Date(),
    "level": "info",
    "component": "database_init",
    "message": "MongoDB initialization completed successfully",
    "data": {
        "collections_created": 10,
        "indexes_created": 20,
        "initial_configs": 2
    }
});

print("H3X Unified System MongoDB initialization completed successfully!");
print("Collections created:", db.getCollectionNames().length);
print("System ready for unified operations.");
