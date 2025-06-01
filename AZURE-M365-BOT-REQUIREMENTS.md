# 🧠 Azure M365 Bot Connection Requirements Guide
## H3X Neural Framework Integration

### 📋 **ESSENTIAL AZURE REQUIREMENTS**

#### 1. **Azure Subscription Setup**
- **Active Azure Subscription** (Required)
- **Sufficient Credits/Budget** for bot services
- **Resource Group** (Recommended: `H3X-Neural-Resources`)
- **Location/Region** (Choose closest to your users)

#### 2. **Azure Bot Service Registration**
```bash
# Required Azure Resources:
- Azure Bot Service (Bot Channels Registration)
- Azure App Service (for hosting bot code)
- Azure App Registration (Azure AD)
- Application Insights (recommended for monitoring)
```

#### 3. **Authentication & Security**
- **Microsoft App ID** (Generated during bot registration)
- **Microsoft App Password/Secret** (Secure storage required)
- **Managed Identity** (Recommended for production)
- **Azure Key Vault** (For secrets management)

### 🔧 **STEP-BY-STEP SETUP PROCESS**

#### **Phase 1: Azure Portal Setup**
1. **Create Resource Group**
   ```bash
   Resource Group Name: H3X-Neural-Resources
   Location: East US (or your preferred region)
   ```

2. **Register Bot Service**
   ```bash
   Bot Name: H3X-Neural-Bot
   Subscription: [Your Subscription]
   Resource Group: H3X-Neural-Resources
   Pricing Tier: F0 (Free) or S1 (Standard)
   Bot Handle: h3x-neural-bot (must be unique)
   ```

3. **Create App Registration**
   ```bash
   Display Name: H3X Neural Bot App
   Supported Account Types: Single tenant
   Redirect URI: https://token.botframework.com/.auth/web/redirect
   ```

#### **Phase 2: App Service Deployment**
1. **Create App Service**
   ```bash
   App Name: h3x-neural-bot-app
   Runtime: Node.js 18 LTS (or your preferred runtime)
   Pricing Tier: B1 Basic (minimum for production)
   ```

2. **Configure App Settings**
   ```bash
   MicrosoftAppId: [From App Registration]
   MicrosoftAppPassword: [Generated Secret]
   LMStudioUrl: http://localhost:1234
   H3XNeuralEndpoint: http://localhost:3978
   ```

#### **Phase 3: Teams Integration**
1. **Teams App Manifest**
   ```json
   {
     "manifestVersion": "1.16",
     "id": "[Generated App ID]",
     "packageName": "com.h3x.neural.bot",
     "name": {
       "short": "H3X Neural Bot",
       "full": "H3X Neural AI Integration Bot"
     },
     "bots": [{
       "botId": "[Microsoft App ID]",
       "scopes": ["personal", "team", "groupchat"]
     }]
   }
   ```

### 🛠️ **INFRASTRUCTURE AS CODE**

#### **Azure Bicep Template**
```bicep
// main.bicep
@description('Bot name')
param botName string = 'H3X-Neural-Bot'

@description('Location for all resources')
param location string = resourceGroup().location

@description('Microsoft App ID')
param microsoftAppId string

@description('Microsoft App Password')
@secure()
param microsoftAppPassword string

// App Service Plan
resource appServicePlan 'Microsoft.Web/serverfarms@2021-02-01' = {
  name: '${botName}-plan'
  location: location
  sku: {
    name: 'B1'
    tier: 'Basic'
  }
  properties: {
    reserved: true
  }
}

// App Service
resource appService 'Microsoft.Web/sites@2021-02-01' = {
  name: '${botName}-app'
  location: location
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      linuxFxVersion: 'NODE|18-lts'
      appSettings: [
        {
          name: 'MicrosoftAppId'
          value: microsoftAppId
        }
        {
          name: 'MicrosoftAppPassword'
          value: microsoftAppPassword
        }
        {
          name: 'LMStudioUrl'
          value: 'http://localhost:1234'
        }
      ]
    }
  }
  identity: {
    type: 'SystemAssigned'
  }
}

// Bot Service
resource botService 'Microsoft.BotService/botServices@2021-03-01' = {
  name: botName
  location: 'global'
  sku: {
    name: 'F0'
  }
  kind: 'azurebot'
  properties: {
    displayName: 'H3X Neural AI Bot'
    description: 'Advanced AI integration bot for Microsoft 365'
    endpoint: 'https://${appService.properties.defaultHostName}/api/messages'
    msaAppId: microsoftAppId
    developerAppInsightKey: appInsights.properties.InstrumentationKey
    developerAppInsightsApiKey: appInsights.properties.ApiKey
    developerAppInsightsApplicationId: appInsights.properties.ApplicationId
  }
}

// Application Insights
resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: '${botName}-insights'
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
  }
}

// Key Vault for secrets
resource keyVault 'Microsoft.KeyVault/vaults@2021-11-01-preview' = {
  name: '${botName}-vault'
  location: location
  properties: {
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: tenant().tenantId
    accessPolicies: [
      {
        tenantId: tenant().tenantId
        objectId: appService.identity.principalId
        permissions: {
          secrets: ['get']
        }
      }
    ]
  }
}

output botServiceName string = botService.name
output appServiceName string = appService.name
output appServiceUrl string = 'https://${appService.properties.defaultHostName}'
```

### 🔌 **INTEGRATION ARCHITECTURE**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Microsoft     │    │  Azure Bot      │    │  H3X Neural     │
│   Teams/365     │◄──►│  Service        │◄──►│  Framework      │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       ▼                       ▼
         │              ┌─────────────────┐    ┌─────────────────┐
         │              │  Azure App      │    │   LMStudio      │
         │              │  Service        │◄──►│   Server        │
         │              │                 │    │   (AI Models)   │
         │              └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Teams App      │    │   Azure Key     │    │   Docker        │
│  Manifest       │    │   Vault         │    │   Containers    │
│                 │    │   (Secrets)     │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 🚀 **DEPLOYMENT COMMANDS**

#### **Using Azure CLI**
```bash
# Login to Azure
az login

# Create Resource Group
az group create --name H3X-Neural-Resources --location eastus

# Deploy infrastructure
az deployment group create \
  --resource-group H3X-Neural-Resources \
  --template-file main.bicep \
  --parameters microsoftAppId=<your-app-id> \
              microsoftAppPassword=<your-app-secret>

# Deploy application code
az webapp deployment source config-zip \
  --resource-group H3X-Neural-Resources \
  --name H3X-Neural-Bot-app \
  --src deployment.zip
```

#### **Using Azure Developer CLI (azd)**
```bash
# Initialize project
azd init --template h3x-neural-bot

# Provision and deploy
azd up
```

### 🔐 **SECURITY BEST PRACTICES**

#### **1. Managed Identity Configuration**
```javascript
// Use Managed Identity instead of client secrets
const { DefaultAzureCredential } = require('@azure/identity');
const { SecretClient } = require('@azure/keyvault-secrets');

const credential = new DefaultAzureCredential();
const client = new SecretClient('https://h3x-neural-bot-vault.vault.azure.net/', credential);

// Retrieve secrets securely
const botPassword = await client.getSecret('MicrosoftAppPassword');
```

#### **2. Environment Variables**
```bash
# Required environment variables
MicrosoftAppId=<your-app-id>
MicrosoftAppPassword=<stored-in-keyvault>
MicrosoftAppTenantId=<your-tenant-id>
LMStudioApiUrl=http://localhost:1234
H3XNeuralEndpoint=http://localhost:3978
ApplicationInsightsKey=<insights-key>
```

### 📱 **TEAMS INTEGRATION**

#### **Bot Registration in Teams**
1. **Developer Portal**: https://dev.teams.microsoft.com/
2. **Upload App Package** (ZIP with manifest.json)
3. **Test in Teams** before publishing
4. **Submit for Admin Approval** (if required)

#### **Channel Configuration**
```json
{
  "bots": [{
    "botId": "[Microsoft App ID]",
    "scopes": ["personal", "team", "groupchat"],
    "commandLists": [{
      "scopes": ["personal", "team"],
      "commands": [
        {
          "title": "Neural Query",
          "description": "Send a query to H3X Neural AI"
        },
        {
          "title": "System Status", 
          "description": "Check AI system health"
        }
      ]
    }]
  }]
}
```

### 🐳 **DOCKER INTEGRATION**

#### **Docker Compose for Full Stack**
```yaml
version: '3.8'
services:
  h3x-neural-bot:
    build: .
    ports:
      - "3978:3978"
    environment:
      - MicrosoftAppId=${MICROSOFT_APP_ID}
      - MicrosoftAppPassword=${MICROSOFT_APP_PASSWORD}
      - LMStudioUrl=http://lmstudio:1234
    depends_on:
      - lmstudio
      - redis

  lmstudio:
    image: lmstudio/server:latest
    ports:
      - "1234:1234"
    volumes:
      - ./models:/models

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
```

### ⚡ **TESTING & VALIDATION**

#### **Bot Framework Emulator**
```bash
# Download: https://github.com/Microsoft/BotFramework-Emulator
# Test endpoint: http://localhost:3978/api/messages
# App ID: [Your Microsoft App ID]
# App Password: [Your Microsoft App Password]
```

#### **Health Check Endpoints**
```javascript
// Add to your bot code
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      lmstudio: checkLMStudioHealth(),
      azure: checkAzureHealth(),
      neural: checkNeuralHealth()
    }
  });
});
```

### 📊 **MONITORING & LOGGING**

#### **Application Insights Integration**
```javascript
const appInsights = require('applicationinsights');
appInsights.setup(process.env.ApplicationInsightsKey)
  .setAutoDependencyCorrelation(true)
  .setAutoCollectRequests(true)
  .setAutoCollectPerformance(true)
  .setAutoCollectExceptions(true)
  .setAutoCollectDependencies(true)
  .start();
```

### 💰 **COST ESTIMATION**

#### **Azure Resources (Monthly)**
```
Bot Service (F0):           $0.00 (Free tier)
App Service (B1):          $13.14
Application Insights:       $2.88
Key Vault:                  $0.03
Storage Account:            $1.00
─────────────────────────────────
Total Estimated:           ~$17/month
```

### 📚 **ADDITIONAL RESOURCES**

- **Bot Framework Documentation**: https://docs.microsoft.com/en-us/azure/bot-service/
- **Teams App Development**: https://docs.microsoft.com/en-us/microsoftteams/platform/
- **Azure CLI Reference**: https://docs.microsoft.com/en-us/cli/azure/
- **LMStudio API**: https://lmstudio.ai/docs

### ⚠️ **TROUBLESHOOTING**

#### **Common Issues**
1. **Bot not responding**: Check endpoint URL and authentication
2. **Teams integration failing**: Validate app manifest
3. **LMStudio connection issues**: Verify network connectivity
4. **Authentication errors**: Check App ID and password configuration

This guide provides everything needed to successfully connect your H3X Neural Framework with Microsoft 365 through Azure Bot Services!
