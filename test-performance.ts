#!/usr/bin/env node

/**
 * H3X Performance Testing Script
 * Tests performance of HTML interfaces and API endpoints
 */

import * as puppeteer from 'puppeteer';
import * as lighthouse from 'lighthouse';
import * as fs from 'fs';
import * as path from 'path';

class PerformanceTester {
  results: any[];
  browser: any;

  constructor() {
    this.results = [];
    this.browser = null;
  }

  async init() {
    try {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      console.log('🚀 Performance testing environment initialized');
    } catch (error) {
      console.log('⚠️ Could not initialize browser for performance testing:', error.message);
      console.log('📝 Continuing with file-based tests only...');
    }
  }

  async testFilePerformance() {
    console.log('📊 Testing file system performance...');

    const publicDir = 'Public';
    if (!fs.existsSync(publicDir)) {
      console.log('❌ Public directory not found');
      return;
    }

    const htmlFiles = fs
      .readdirSync(publicDir)
      .filter((file) => file.endsWith('.html'))
      .map((file) => path.join(publicDir, file));

    for (const file of htmlFiles) {
      const start = Date.now();
      const content = fs.readFileSync(file, 'utf8');
      const loadTime = Date.now() - start;

      const size = Buffer.byteLength(content, 'utf8');
      const lines = content.split('\n').length;

      this.results.push({
        file: path.basename(file),
        loadTime: `${loadTime}ms`,
        size: `${(size / 1024).toFixed(2)}KB`,
        lines: lines,
        status: loadTime < 50 ? 'excellent' : loadTime < 200 ? 'good' : 'needs-optimization',
      });

      console.log(`✅ ${path.basename(file)}: ${loadTime}ms, ${(size / 1024).toFixed(2)}KB`);
    }
  }

  async testLighthousePerformance() {
    if (!this.browser) {
      console.log('⚠️ Skipping Lighthouse tests - browser not available');
      return;
    }

    console.log('🔍 Running Lighthouse performance audits...');

    // Test local files if server is running
    const testUrls = [
      'http://localhost:3978', // Main app
      'file://' + path.resolve('Public/ai-integration-control-center.html'),
      'file://' + path.resolve('Public/hex-genesis-nexus-interface.html'),
    ];

    for (const url of testUrls) {
      try {
        const { lhr } = await lighthouse(url, {
          port: new URL(this.browser.wsEndpoint()).port,
          output: 'json',
          logLevel: 'error',
        });

        const scores = {
          performance: Math.round(lhr.categories.performance.score * 100),
          accessibility: Math.round(lhr.categories.accessibility.score * 100),
          'best-practices': Math.round(lhr.categories['best-practices'].score * 100),
          seo: Math.round(lhr.categories.seo.score * 100),
        };

        console.log(`📊 ${url}:`);
        console.log(`   Performance: ${scores.performance}/100`);
        console.log(`   Accessibility: ${scores.accessibility}/100`);
        console.log(`   Best Practices: ${scores['best-practices']}/100`);
        console.log(`   SEO: ${scores.seo}/100`);

        this.results.push({
          url: url,
          type: 'lighthouse',
          scores: scores,
        });
      } catch (error) {
        console.log(`⚠️ Could not test ${url}: ${error.message}`);
      }
    }
  }

  async testMemoryUsage() {
    console.log('💾 Testing memory usage patterns...');

    const initialMemory = process.memoryUsage();

    // Simulate loading multiple files
    const publicFiles = fs.existsSync('Public')
      ? fs.readdirSync('Public').filter((f) => f.endsWith('.html'))
      : [];

    const fileContents = [];
    for (const file of publicFiles) {
      const content = fs.readFileSync(path.join('Public', file), 'utf8');
      fileContents.push(content);
    }

    const afterLoadMemory = process.memoryUsage();

    // Calculate memory impact
    const memoryIncrease = {
      heapUsed: afterLoadMemory.heapUsed - initialMemory.heapUsed,
      heapTotal: afterLoadMemory.heapTotal - initialMemory.heapTotal,
      external: afterLoadMemory.external - initialMemory.external,
    };

    console.log('📈 Memory Usage Analysis:');
    console.log(`   Heap Used: ${(memoryIncrease.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Heap Total: ${(memoryIncrease.heapTotal / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   External: ${(memoryIncrease.external / 1024 / 1024).toFixed(2)} MB`);

    this.results.push({
      type: 'memory',
      impact: memoryIncrease,
      filesLoaded: publicFiles.length,
    });
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: this.results.length,
        fileTests: this.results.filter((r) => r.file).length,
        lighthouseTests: this.results.filter((r) => r.type === 'lighthouse').length,
        memoryTests: this.results.filter((r) => r.type === 'memory').length,
      },
      results: this.results,
    };

    const reportPath = 'performance-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📋 Performance report saved to ${reportPath}`);

    return report;
  }

  async run() {
    console.log('🔥 Starting H3X Performance Testing Suite');
    console.log('=' * 50);

    await this.init();
    await this.testFilePerformance();
    await this.testMemoryUsage();
    await this.testLighthousePerformance();

    const report = await this.generateReport();
    await this.cleanup();

    console.log('🏁 Performance testing completed!');
    console.log(`📊 Total tests run: ${report.summary.totalTests}`);

    return report;
  }
}

// Run performance tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new PerformanceTester();
  tester.run().catch(console.error);
}

export default PerformanceTester;
