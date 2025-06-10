# H3X - Hexperimental AI Framework

![H3X Logo](./docs/assets/h3x-logo.png)

**H3X** is a comprehensive AI-powered framework for automated code generation, analysis, and optimization. Built with TypeScript and designed for scalability, H3X provides a modular architecture for building intelligent automation systems.

## 🚀 Quick Start

### Prerequisites
- Node.js 18, 20, or 22
- Docker (optional, for containerized deployment)
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/H3X.git
cd H3X

# Install dependencies
npm install

# Setup environment
npm run setup-check

# Start development server
npm run dev
```

## 📁 Project Structure

```
H3X/
├── docs/                    # Documentation
├── src/                     # Source code
│   ├── agent/              # AI agents
│   ├── generators/         # Code generators
│   ├── proof/              # Proof system
│   ├── framework/          # Core framework
│   └── tools/              # Utility tools
├── scripts/                # Automation scripts
├── tests/                  # Test suites
├── config/                 # Configuration files
├── docker/                 # Docker configurations
└── public/                 # Static assets
```

## 🔧 Core Features

### 🤖 AI Agents
- **LM Studio Integration**: Local AI model support
- **OpenAI Compatibility**: Enterprise AI integration
- **Multi-Modal Support**: Text, code, and data processing

### 🏗️ Code Generation
- **TypeScript First**: Modern TypeScript support
- **Template System**: Flexible code templates
- **AST Manipulation**: Advanced syntax tree processing

### 🔬 Proof System
- **Mathematical Proofs**: Automated theorem proving
- **Code Verification**: Static analysis and validation
- **Benchmark Framework**: Performance testing

### 🐳 Deployment
- **Docker Support**: Containerized deployment
- **Multi-Environment**: Dev, staging, production configs
- **CI/CD Ready**: GitHub Actions integration

## 📚 Documentation

- [**Getting Started**](./docs/getting-started.md) - Installation and setup
- [**API Reference**](./docs/api-reference.md) - Complete API documentation
- [**Architecture**](./docs/architecture.md) - System design and patterns
- [**Deployment**](./docs/deployment.md) - Production deployment guide
- [**Contributing**](./docs/contributing.md) - Development guidelines

## 🛠️ Available Scripts

### Development
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run type-check       # TypeScript type checking
npm run lint             # Code linting
npm run format           # Code formatting
```

### Testing
```bash
npm test                 # Run all tests
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests
npm run test:e2e         # End-to-end tests
npm run test:coverage    # Coverage report
```

### Docker
```bash
npm run docker:dev       # Start development environment
npm run docker:prod      # Start production environment
npm run docker:stop      # Stop all containers
```

### Automation
```bash
npm run setup-check      # Verify installation
npm run clean            # Clean build artifacts
npm run reset            # Reset to clean state
```

## 🌟 Key Components

### AI Agents
- **Agent Framework**: Base classes for AI agents
- **LM Studio Agent**: Local model integration
- **OpenAI Agent**: Cloud AI services
- **Multi-Agent System**: Coordinated AI workflows

### Code Generation
- **Template Engine**: Dynamic code generation
- **AST Parser**: Syntax tree manipulation
- **Type System**: Advanced TypeScript support
- **Output Formatters**: Multiple output formats

### Proof System
- **Mathematical Engine**: Theorem proving capabilities
- **Verification Tools**: Code correctness validation
- **Benchmark Suite**: Performance measurement
- **Report Generation**: Detailed analysis reports

## 🔧 Configuration

### Environment Variables
```bash
# AI Configuration
OPENAI_API_KEY=your_openai_key
LM_STUDIO_URL=http://localhost:1234

# Database
MONGODB_URL=mongodb://localhost:27017/h3x
REDIS_URL=redis://localhost:6379

# Server
PORT=3000
NODE_ENV=development
```

### TypeScript Configuration
- **Strict Mode**: Enabled for type safety
- **ES2022**: Modern JavaScript features
- **Module Resolution**: Node.js style
- **Source Maps**: Debug support

### ESLint Configuration
- **TypeScript Support**: Full TS integration
- **Security Rules**: Built-in security checks
- **Style Enforcement**: Consistent code style
- **Import Organization**: Automatic import sorting

## 🚀 Deployment

### Docker Deployment
```bash
# Development
docker-compose -f docker/docker-compose.dev.yml up

# Production
docker-compose -f docker/docker-compose.prod.yml up -d
```

### Cloud Deployment
- **Vercel**: Frontend deployment
- **Railway**: Backend services
- **Digital Ocean**: Full stack deployment
- **AWS**: Enterprise deployment

## 🧪 Testing

### Test Structure
```
tests/
├── unit/               # Unit tests
├── integration/        # Integration tests
├── e2e/               # End-to-end tests
└── fixtures/          # Test data
```

### Test Commands
- `npm test` - Run all tests
- `npm run test:watch` - Watch mode
- `npm run test:debug` - Debug mode
- `npm run test:coverage` - Coverage report

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Update documentation
- Use conventional commits
- Ensure all checks pass

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **LangChain**: AI framework foundation
- **TypeScript**: Type-safe development
- **Docker**: Containerization
- **Jest/Vitest**: Testing frameworks
- **ESLint**: Code quality

## 📞 Support

- **Documentation**: [docs/](./docs/)
- **Issues**: [GitHub Issues](https://github.com/your-org/H3X/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/H3X/discussions)
- **Email**: support@h3x.dev

## 🗺️ Roadmap

### v2.1.0 (Current)
- ✅ Core framework
- ✅ AI agent system
- ✅ Code generation
- ✅ Proof system
- ✅ Docker support

### v2.2.0 (Q2 2025)
- 🔄 Advanced AI models
- 🔄 Real-time collaboration
- 🔄 Cloud deployment
- 🔄 Performance optimization

### v3.0.0 (Q4 2025)
- 📅 Multi-language support
- 📅 Advanced analytics
- 📅 Enterprise features
- 📅 Plugin ecosystem

---

**Built with ❤️ by the H3X Team**
