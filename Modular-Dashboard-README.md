# Hexperiment Labs SIR Control Interface

## Modular Dashboard Architecture

The SIR (Super Intelligent Regulator) Control Interface has been refactored into a modular architecture for improved maintainability, scalability, and code organization. The system now consists of three core modules:

### 1. Core Module (`sir-dashboard-core.js`)
- Handles main dashboard initialization
- Manages connection to backend server
- Controls system state
- Processes API requests and responses
- Manages core metrics

### 2. Data Module (`sir-dashboard-data.js`)
- Manages real-time data collection
- Processes pattern analysis
- Tracks temporal patterns
- Handles environmental and neural data
- Provides advanced data insights in PASSIVE mode

### 3. UI Module (`sir-dashboard-ui.js`)
- Creates and updates dashboard metrics
- Manages visualization controls
- Handles UI event listeners
- Renders data visualizations
- Updates system status displays

## Integration

The modules are integrated in the main dashboard file (`sir-dashboard.js`), which creates instances of each module and handles communication between them. This approach provides several benefits:

- **Separation of Concerns**: Each module has a clear responsibility
- **Improved Maintainability**: Changes to one module don't affect others
- **Better Testability**: Modules can be tested independently
- **Enhanced Collaboration**: Team members can work on different modules simultaneously

## Connected Applications

The modular architecture also allows for integration with other applications in the Hexperiment Labs ecosystem:

- **H3X Symbolic Currency**: Uses the Core module for backend connectivity
- **Virtual Taskmaster**: Can leverage the Data module for pattern analysis
- **Spectator Interface**: Utilizes the UI module for visualization

## Development

To modify or extend the dashboard:

1. Locate the appropriate module for your changes
2. Make your modifications
3. Test the changes in isolation
4. Update the integration in `sir-dashboard.js` if needed

## File Structure

```
public/
├── js/
│   ├── sir-dashboard.js          # Main integration file
│   ├── sir-dashboard-core.js     # Core functionality
│   ├── sir-dashboard-data.js     # Data management
│   ├── sir-dashboard-ui.js       # UI components
│   └── currency-connector.js     # H3X Currency connector
├── index2.html                   # H3X Symbolic Currency interface
└── ...
```

## Backend Connection

The dashboard connects to the LMStudio backend server running on port 3979. Start the backend with:

```bash
node Start-Lmstudio.js
```

In PASSIVE mode, the system is in the learning phase, primarily gathering data and detecting patterns without interference. This is critical for establishing baselines and understanding the environment.

---

*Hexperiment Labs - Advanced Neural Frameworks for Collective Intelligence*
