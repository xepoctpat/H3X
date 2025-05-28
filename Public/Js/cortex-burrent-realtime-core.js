/**
 * index2.html - H3X Symbolic Currency - SIR Dashboard Connector
 * 
 * This file enables the H3X Symbolic Currency interface to connect with the
 * modular SIR dashboard components:
 * 
 * 1. public/js/sir-dashboard-core.js - Core functionality, API calls
 * 2. public/js/sir-dashboard-data.js - Data management, patterns
 * 3. public/js/sir-dashboard-ui.js - UI visualization
 * 
 * To view the main SIR Control Interface, see:
 * - <a href="../index.html">SIR Control Interface</a>
 * 
 * This interface demonstrates how modular components can be reused
 * across different parts of the Hexperiment Labs ecosystem.
 */

// Connector script for H3X Symbolic Currency to SIR Dashboard
document.addEventListener('DOMContentLoaded', () => {
    console.log("🔮 H3X Symbolic Currency connector initialized");
    
    // Create a connection to the SIR dashboard if available
    if (window.SIRDashboardCore) {
        const sirCore = new SIRDashboardCore();
        sirCore.initialize().then(() => {
            console.log("✅ Connected to SIR dashboard backend");
            
            // Enhance the currency symbol generator with SIR insights
            enhanceCurrencyGenerator(sirCore);
        });
    }
});

// Enhance the currency symbol generator with SIR insights
function enhanceCurrencyGenerator(sirCore) {
    const originalGenerator = window.getSymbolicCurrency;
    
    // Replace the original function with an enhanced version
    window.getSymbolicCurrency = function(intent) {
        // Use the original function as a fallback
        const originalSymbol = originalGenerator(intent);
        
        // If SIR core is connected, enhance the symbol selection
        if (sirCore && sirCore.getConnectionStatus()) {
            try {
                // Use SIR analysis to improve symbol selection
                fetch(`${sirCore.serverUrl}/sir-analysis`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        intent: intent,
                        context: 'symbolic_currency',
                        analysisType: 'semantic_mapping'
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success && data.result && data.result.symbol) {
                        // Update the symbol with SIR's recommendation
                        document.getElementById('currencySymbol').textContent = data.result.symbol;
                    }
                });
            } catch (error) {
                console.log("Using local symbol generation only");
            }
        }
        
        return originalSymbol;
    };
    
    console.log("🔮 Currency generator enhanced with SIR insights");
}
