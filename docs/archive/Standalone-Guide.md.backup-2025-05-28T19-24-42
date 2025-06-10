# Standalone SIR Control Interface Configuration

## 🚀 Standalone Deployment Guide

Since you have an M365 account, standalone deployment gives you the best of both worlds:

- Full bot capabilities without playground limitations
- Easy transition to Teams when ready
- Real-world testing environment

## Quick Setup

### 1. Environment Configuration for Standalone

Create `env/.env.standalone` for standalone-specific settings:

```bash
# Standalone Environment
TEAMSFX_ENV=standalone
NODE_ENV=development

# OpenAI Configuration
SECRET_OPENAI_API_KEY=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

# Bot Configuration
BOT_ID=local-sir-interface
BOT_PASSWORD=local-password-123
PORT=3978

# Optional: Enable detailed logging
DEBUG=true
LOG_LEVEL=debug
```

### 2. Enhanced Standalone Server

The standalone server gives you:

- Direct HTTP API access
- Real Bot Framework integration
- Proper adaptive card rendering
- Microsoft Graph API readiness (when you add it)

### 3. Testing Options

#### A) Direct API Testing

```bash
curl -X POST http://localhost:3978/api/messages \
  -H "Content-Type: application/json" \
  -d '{
    "type": "message",
    "text": "What is the status of the SIR system?",
    "from": {"id": "user1", "name": "Test User"},
    "conversation": {"id": "test-conv-1"}
  }'
```

#### B) Bot Framework Emulator

- Download: <https://github.com/Microsoft/BotFramework-Emulator>
- Connect to: <http://localhost:3978/api/messages>
- Full conversation testing with adaptive cards

#### C) Teams Integration (when ready)

- Use your M365 account for full Teams deployment
- Same codebase, just provision Azure resources

### 4. Advantages Over Playground

| Feature | Playground | Standalone | Teams |
|---------|------------|------------|-------|
| **API Access** | Limited | Full ✅ | Full ✅ |
| **Adaptive Cards** | Preview | Real ✅ | Real ✅ |
| **Custom Integration** | No | Yes ✅ | Yes ✅ |
| **M365 Features** | No | Ready ✅ | Full ✅ |
| **Production Ready** | No | Yes ✅ | Yes ✅ |

## Next Steps

1. **Current**: Test in standalone mode
2. **When ready**: Add Microsoft Graph API integration
3. **Deploy**: Provision to Azure with your M365 account
4. **Integrate**: Connect to Teams, Outlook, SharePoint

Standalone gives you real bot capabilities while keeping development simple!
