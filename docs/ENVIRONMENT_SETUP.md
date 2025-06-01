# Environment Setup Guide

Complete setup guide for H3X-fLups.

## Prerequisites

- Node.js v18.0.0+
- Docker v20.0.0+
- Git v2.30.0+

## Installation Steps

### 1. Clone Repository
```bash
git clone https://github.com/your-org/H3X-fLups.git
cd H3X-fLups
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
```bash
cp .env.example .env
# Edit .env with your settings
```

### 4. Start Services
```bash
npm run env:dev
```

## Verification

```bash
npm run setup-check
npm run test
```

---

*Last updated: 2025-06-01*
