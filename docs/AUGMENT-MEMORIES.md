# 🧠 H3X Augment Agent Memory System

This document explains the dynamic memory generation system for Augment Agent, designed to help the AI assistant better understand your H3X project structure, conventions, and patterns.

## 🎯 What It Does

The memory system automatically analyzes your codebase and generates contextual memories that help Augment Agent:

- **Understand your architecture** - Project structure, module organization, design patterns
- **Follow your conventions** - Coding standards, naming patterns, TypeScript configurations  
- **Use your workflows** - Build processes, testing approaches, deployment methods
- **Leverage your integrations** - AI backends, databases, external services
- **Respect your patterns** - How you organize code, handle errors, structure tests

## 🚀 Quick Start

### Generate Memories Once
```bash
npm run memory:generate
```

### Auto-Update Memories (Recommended)
```bash
npm run memory:watch
```
This starts a file watcher that automatically updates memories when significant changes are detected.

### Force Update Memories
```bash
npm run memory:force-update
```

## 📁 Generated Files

The system creates two files:

### `.augment-memories.json`
- **Structured data** for programmatic use
- **Confidence scores** for each memory (0.0 - 1.0)
- **Source attribution** showing where each insight came from
- **Timestamps** for tracking when memories were generated

### `.augment-memories-summary.md`
- **Human-readable format** for easy review
- **Categorized memories** by type (architecture, conventions, etc.)
- **Confidence indicators** to help you assess reliability
- **Perfect for sharing** with Augment Agent

## 🔍 What Gets Analyzed

The memory generator examines:

### 📦 **Configuration Files**
- `package.json` - Dependencies, scripts, project metadata
- `tsconfig*.json` - TypeScript configurations and compiler settings
- `docker-compose*.yml` - Containerization and deployment setup
- `.env.example` - Environment configuration patterns

### 🏗️ **Project Structure**
- Directory organization (`/src`, `/scripts`, `/tests`, `/docker`)
- File naming patterns and conventions
- Module boundaries and relationships

### 🔧 **Source Code Patterns**
- TypeScript usage and type safety practices
- Testing frameworks and organization
- Error handling approaches
- Async/await vs Promise patterns

### 📚 **Documentation**
- README files and project documentation
- Inline code comments and JSDoc
- Architecture decision records

### 🤖 **Automation & Workflows**
- Build and deployment scripts
- Git automation and PR workflows
- CI/CD configurations
- Development tooling

## 📊 Memory Categories

Memories are organized into these categories:

- **🏗️ Architecture** - Project structure, design patterns, module organization
- **📝 Convention** - Coding standards, naming patterns, style guidelines  
- **🔧 Technology** - Frameworks, libraries, language features used
- **🧪 Testing** - Test frameworks, organization, coverage approaches
- **🚀 Deployment** - Docker, containerization, environment management
- **⚡ Workflow** - Build processes, automation scripts, development flows
- **🔗 Integration** - External services, APIs, database connections
- **📖 Documentation** - Available docs, guides, architectural decisions

## 🎛️ Configuration

### File Watcher Settings

The memory watcher monitors these paths by default:
```typescript
watchPaths: [
  'package.json',
  'tsconfig*.json', 
  'src/**/*.ts',
  'scripts/**/*.ts',
  'docker/**/*',
  'docs/**/*.md',
  'README*.md',
  '.env.example'
]
```

### Significant Change Detection

The system considers these changes "significant" and triggers immediate updates:
- Changes to `package.json`, `tsconfig.json`, `README.md`
- New TypeScript files in `/src` or `/scripts`
- Docker configuration changes
- Documentation updates

## 💡 Best Practices

### For Developers

1. **Run the generator after major changes**
   ```bash
   npm run memory:generate
   ```

2. **Use the watcher during active development**
   ```bash
   npm run memory:watch
   ```

3. **Review generated memories periodically** to ensure accuracy

4. **Update the generator** if you add new significant file types or patterns

### For Augment Agent

1. **Share the summary file** when starting new work:
   > "Please review and remember the contents of .augment-memories-summary.md"

2. **Reference specific memories** when asking for help:
   > "Based on our project memories, what's the best way to add a new test?"

3. **Update memories** after making significant changes:
   > "I've updated the Docker configuration. Please run npm run memory:generate and review the new memories."

## 🔧 Customization

### Adding New Analysis Patterns

To analyze additional file types or patterns, extend the `MemoryGenerator` class:

```typescript
// In scripts/generate-memories.ts
private async analyzeCustomFiles() {
  // Your custom analysis logic
  const customFiles = await glob('custom/**/*.ext');
  // Generate memories based on findings
  this.addMemory('category', 'insight', confidence, 'source');
}
```

### Adjusting Confidence Scores

Confidence scores help prioritize memories:
- **0.9-1.0**: High confidence, core project patterns
- **0.7-0.8**: Medium confidence, likely accurate
- **0.5-0.6**: Lower confidence, may need verification
- **<0.5**: Experimental or uncertain insights

### Custom Memory Categories

Add new categories by extending the `ProjectAnalysis` interface and updating the generation logic.

## 🚨 Troubleshooting

### Memory Generation Fails
```bash
# Check for syntax errors
npm run type-check

# Verify file permissions
ls -la .augment-memories*
```

### Watcher Not Detecting Changes
```bash
# Restart the watcher
npm run memory:watch

# Check if files are in ignored paths
# Review ignorePaths in memory-watcher.ts
```

### Outdated Memories
```bash
# Force regeneration
npm run memory:force-update

# Clear old files and regenerate
rm .augment-memories*
npm run memory:generate
```

## 🤝 Contributing

To improve the memory system:

1. **Add new analysis patterns** for file types specific to your workflow
2. **Improve confidence scoring** based on real-world accuracy
3. **Extend categorization** for better memory organization
4. **Enhance the watcher** to detect more types of significant changes

---

*This memory system is designed to evolve with your project. As your codebase grows and changes, the memories will automatically adapt to provide Augment Agent with the most current and relevant context.*
