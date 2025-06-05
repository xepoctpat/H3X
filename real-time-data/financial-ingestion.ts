// Auto-generated interfaces
interface ProcessEnv {
  [key: string]: string | undefined;
}

interface ConsoleLog {
  log: (message?: any, ...optionalParams: any[]) => void;
  error: (message?: any, ...optionalParams: any[]) => void;
  warn: (message?: any, ...optionalParams: any[]) => void;
}

// Financial Data Ingestion Service
// Real-time financial market data collection with feedback loop integration

import Redis = require('redis');
import axios = require('axios');

class FinancialIngestionService {
  constructor() {
    this.redis = Redis.createClient({
      url: (process.env as ProcessEnv).REDIS_URL || 'redis://h3x-redis:6379',
    });

    this.apiKey = (process.env as ProcessEnv).API_KEY;
    this.updateInterval = parseInt((process.env as ProcessEnv).UPDATE_INTERVAL) || 60; // 1 minute
    this.isRunning = true;

    // Financial data sources and symbols
    this.symbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'BTC-USD', 'ETH-USD'];
    this.indices = ['SPY', 'QQQ', 'DIA'];
  }

  async start() {
    console.log('💰 Starting Financial Data Ingestion Service');

    try {
      await this.redis.connect();
      console.log('✅ Connected to Redis');

      // Start data collection loop
      this.startDataCollection();

      // Health check endpoint
      this.startHealthServer();
    } catch (error) {
      console.error('❌ Failed to start financial service:', error);
      process.exit(1);
    }
  }

  async startDataCollection() {
    while (this.isRunning) {
      try {
        await this.collectStockData();
        await this.collectCryptoData();
        await this.collectMarketIndices();

        await this.delay(this.updateInterval * 1000);
      } catch (error) {
        console.error('❌ Financial data collection error:', error);
        await this.delay(5000); // Wait 5 seconds on error
      }
    }
  }

  async collectStockData() {
    for (const symbol of this.symbols.filter((s) => !s.includes('-USD'))) {
      try {
        // Using Alpha Vantage API (free tier available)
        const response = await axios.get('https://www.alphavantage.co/query', {
          params: {
            function: 'GLOBAL_QUOTE',
            symbol: symbol,
            apikey: this.apiKey,
          },
          timeout: 10000,
        });

        const quote = response.data['Global Quote'];
        if (!quote) continue;

        const stockData = {
          timestamp: new Date().toISOString(),
          symbol: symbol,
          type: 'stock',
          data: {
            price: parseFloat(quote['05. price']),
            change: parseFloat(quote['09. change']),
            changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
            volume: parseInt(quote['06. volume']),
            open: parseFloat(quote['02. open']),
            high: parseFloat(quote['03. high']),
            low: parseFloat(quote['04. low']),
            previousClose: parseFloat(quote['08. previous close']),
          },
          metrics: {
            volatility: await this.calculateVolatility(symbol),
            momentum: await this.calculateMomentum(symbol, parseFloat(quote['05. price'])),
          },
        };

        await this.storeFinancialData(stockData);
        console.log(
          `📈 Collected ${symbol}: $${stockData.data.price} (${stockData.data.changePercent}%)`,
        );
      } catch (error) {
        console.error(`❌ Failed to collect data for ${symbol}:`, error.message);
      }
    }
  }

  async collectCryptoData() {
    for (const symbol of this.symbols.filter((s) => s.includes('-USD'))) {
      try {
        const cryptoSymbol = symbol.replace('-USD', '');

        // Using CoinGecko API (free tier available)
        const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
          params: {
            ids: cryptoSymbol.toLowerCase(),
            vs_currencies: 'usd',
            include_24hr_change: 'true',
            include_24hr_vol: 'true',
          },
          timeout: 10000,
        });

        const coinId = cryptoSymbol.toLowerCase();
        const data = response.data[coinId];
        if (!data) continue;

        const cryptoData = {
          timestamp: new Date().toISOString(),
          symbol: symbol,
          type: 'crypto',
          data: {
            price: data.usd,
            change24h: data.usd_24h_change || 0,
            volume24h: data.usd_24h_vol || 0,
          },
          metrics: {
            volatility: await this.calculateVolatility(symbol),
            momentum: await this.calculateMomentum(symbol, data.usd),
          },
        };

        await this.storeFinancialData(cryptoData);
        console.log(
          `₿ Collected ${symbol}: $${cryptoData.data.price} (${cryptoData.data.change24h?.toFixed(2)}%)`,
        );
      } catch (error) {
        console.error(`❌ Failed to collect crypto data for ${symbol}:`, error.message);
      }
    }
  }

  async collectMarketIndices() {
    for (const index of this.indices) {
      try {
        const response = await axios.get('https://www.alphavantage.co/query', {
          params: {
            function: 'GLOBAL_QUOTE',
            symbol: index,
            apikey: this.apiKey,
          },
          timeout: 10000,
        });

        const quote = response.data['Global Quote'];
        if (!quote) continue;

        const indexData = {
          timestamp: new Date().toISOString(),
          symbol: index,
          type: 'index',
          data: {
            price: parseFloat(quote['05. price']),
            change: parseFloat(quote['09. change']),
            changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
            volume: parseInt(quote['06. volume']),
          },
          metrics: {
            marketSentiment: this.calculateMarketSentiment(
              parseFloat(quote['10. change percent'].replace('%', '')),
            ),
          },
        };

        await this.storeFinancialData(indexData);
        console.log(
          `📊 Collected ${index}: $${indexData.data.price} (${indexData.data.changePercent}%)`,
        );
      } catch (error) {
        console.error(`❌ Failed to collect index data for ${index}:`, error.message);
      }
    }
  }

  async storeFinancialData(financialData) {
    const symbol = financialData.symbol;

    // Store current data
    await this.redis.setEx(`financial:current:${symbol}`, 3600, JSON.stringify(financialData));

    // Store historical data
    await this.redis.lpush(`financial:history:${symbol}`, JSON.stringify(financialData));
    await this.redis.ltrim(`financial:history:${symbol}`, 0, 99); // Keep last 100 readings

    // Publish for real-time subscribers
    await this.redis.publish('financial:updates', JSON.stringify(financialData));

    // Queue for feedback loop processing
    await this.redis.lpush(
      'feedback:financial:queue',
      JSON.stringify({
        type: 'financial',
        data: financialData,
        timestamp: Date.now(),
      }),
    );
  }

  async calculateVolatility(symbol) {
    try {
      const history = await this.redis.lrange(`financial:history:${symbol}`, 0, 19); // Last 20 readings
      if (history.length < 2) return 0;

      const prices = history.map((item) => JSON.parse(item).data.price);
      const returns = [];

      for (let i = 1; i < prices.length; i++) {
        returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
      }

      const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
      const variance =
        returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;

      return Math.sqrt(variance) * 100; // Convert to percentage
    } catch (error) {
      return 0;
    }
  }

  async calculateMomentum(symbol, currentPrice) {
    try {
      const previousData = await this.redis.lindex(`financial:history:${symbol}`, 4); // 5 periods ago
      if (previousData) {
        const prev = JSON.parse(previousData);
        return ((currentPrice - prev.data.price) / prev.data.price) * 100;
      }
    } catch (error) {
      console.error('Error calculating momentum:', error);
    }
    return 0;
  }

  calculateMarketSentiment(changePercent) {
    if (changePercent > 2) return 'bullish';
    if (changePercent > 0.5) return 'positive';
    if (changePercent > -0.5) return 'neutral';
    if (changePercent > -2) return 'negative';
    return 'bearish';
  }

  startHealthServer() {
    import http = require('http');

    const server = http.createServer((req, res) => {
      if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            status: 'healthy',
            service: 'financial-ingestion',
            timestamp: new Date().toISOString(),
            isRunning: this.isRunning,
          }),
        );
      } else {
        res.writeHead(404);
        res.end('Not Found');
      }
    });

    server.listen(8084, () => {
      console.log('🏥 Financial service health server listening on port 8084');
    });
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async stop() {
    this.isRunning = false;
    await this.redis.disconnect();
    console.log('🛑 Financial Data Ingestion Service stopped');
  }
}

// Start service
const service = new FinancialIngestionService();

process.on('SIGTERM', () => service.stop());
process.on('SIGINT', () => service.stop());

service.start().catch(console.error);
