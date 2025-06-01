// Weather Data Ingestion Service
// Real-time weather data collection with feedback loop integration

const Redis = require('redis');
const axios = require('axios');

class WeatherIngestionService {
    constructor() {
        this.redis = Redis.createClient({
            url: process.env.REDIS_URL || 'redis://h3x-redis:6379'
        });
        
        this.apiKey = process.env.API_KEY;
        this.updateInterval = parseInt(process.env.UPDATE_INTERVAL) || 300; // 5 minutes
        this.isRunning = true;
        
        // Weather data sources
        this.dataSources = [
            {
                name: 'openweather',
                url: 'https://api.openweathermap.org/data/2.5',
                cities: ['London', 'New York', 'Tokyo', 'Sydney', 'Berlin']
            }
        ];
    }

    async start() {
        console.log('🌦️ Starting Weather Data Ingestion Service');
        
        try {
            await this.redis.connect();
            console.log('✅ Connected to Redis');
            
            // Start data collection loop
            this.startDataCollection();
            
            // Health check endpoint
            this.startHealthServer();
            
        } catch (error) {
            console.error('❌ Failed to start weather service:', error);
            process.exit(1);
        }
    }

    async startDataCollection() {
        while (this.isRunning) {
            try {
                for (const source of this.dataSources) {
                    await this.collectWeatherData(source);
                }
                
                await this.delay(this.updateInterval * 1000);
                
            } catch (error) {
                console.error('❌ Data collection error:', error);
                await this.delay(10000); // Wait 10 seconds on error
            }
        }
    }

    async collectWeatherData(source) {
        for (const city of source.cities) {
            try {
                const response = await axios.get(`${source.url}/weather`, {
                    params: {
                        q: city,
                        appid: this.apiKey,
                        units: 'metric'
                    },
                    timeout: 10000
                });

                const weatherData = {
                    timestamp: new Date().toISOString(),
                    source: source.name,
                    city: city,
                    data: {
                        temperature: response.data.main.temp,
                        humidity: response.data.main.humidity,
                        pressure: response.data.main.pressure,
                        windSpeed: response.data.wind?.speed || 0,
                        cloudiness: response.data.clouds?.all || 0,
                        weather: response.data.weather[0]?.main || 'Unknown'
                    },
                    metrics: {
                        tempChange: await this.calculateTempChange(city, response.data.main.temp),
                        pressureChange: await this.calculatePressureChange(city, response.data.main.pressure)
                    }
                };

                // Store in Redis with various keys for different access patterns
                await this.redis.setEx(`weather:current:${city}`, 3600, JSON.stringify(weatherData));
                await this.redis.lpush(`weather:history:${city}`, JSON.stringify(weatherData));
                await this.redis.ltrim(`weather:history:${city}`, 0, 99); // Keep last 100 readings
                
                // Publish for real-time subscribers
                await this.redis.publish('weather:updates', JSON.stringify(weatherData));
                
                // Queue for feedback loop processing
                await this.redis.lpush('feedback:weather:queue', JSON.stringify({
                    type: 'weather',
                    data: weatherData,
                    timestamp: Date.now()
                }));

                console.log(`📊 Collected weather data for ${city}: ${weatherData.data.temperature}°C`);
                
            } catch (error) {
                console.error(`❌ Failed to collect weather for ${city}:`, error.message);
            }
        }
    }

    async calculateTempChange(city, currentTemp) {
        try {
            const previousData = await this.redis.lindex(`weather:history:${city}`, 0);
            if (previousData) {
                const prev = JSON.parse(previousData);
                return currentTemp - prev.data.temperature;
            }
        } catch (error) {
            console.error('Error calculating temperature change:', error);
        }
        return 0;
    }

    async calculatePressureChange(city, currentPressure) {
        try {
            const previousData = await this.redis.lindex(`weather:history:${city}`, 0);
            if (previousData) {
                const prev = JSON.parse(previousData);
                return currentPressure - prev.data.pressure;
            }
        } catch (error) {
            console.error('Error calculating pressure change:', error);
        }
        return 0;
    }

    startHealthServer() {
        const http = require('http');
        
        const server = http.createServer((req, res) => {
            if (req.url === '/health') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    status: 'healthy',
                    service: 'weather-ingestion',
                    timestamp: new Date().toISOString(),
                    isRunning: this.isRunning
                }));
            } else {
                res.writeHead(404);
                res.end('Not Found');
            }
        });
        
        server.listen(8083, () => {
            console.log('🏥 Weather service health server listening on port 8083');
        });
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async stop() {
        this.isRunning = false;
        await this.redis.disconnect();
        console.log('🛑 Weather Data Ingestion Service stopped');
    }
}

// Start service
const service = new WeatherIngestionService();

process.on('SIGTERM', () => service.stop());
process.on('SIGINT', () => service.stop());

service.start().catch(console.error);
