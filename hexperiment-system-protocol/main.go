package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
	"github.com/joho/godotenv"
)

// Protocol represents the Hexperiment System Protocol structure
type Protocol struct {
    ID        string                 `json:"id"`
    Type      string                 `json:"type"`
    Data      map[string]interface{} `json:"data"`
    Timestamp time.Time              `json:"timestamp"`
    Status    string                 `json:"status"`
}

// WebSocket upgrader
var upgrader = websocket.Upgrader{
    CheckOrigin: func(r *http.Request) bool {
        return true // Allow all origins for development
    },
}

// Active WebSocket connections
var clients = make(map[*websocket.Conn]bool)
var broadcast = make(chan Protocol)

func main() {
    // Load environment variables
    if err := godotenv.Load(); err != nil {
        log.Println("No .env file found, using default values")
    }

    port := os.Getenv("PORT")
    if port == "" {
        port = "8080"
    }

    // Initialize router
    r := mux.NewRouter()

    // API routes
    r.HandleFunc("/api/health", healthHandler).Methods("GET")
    r.HandleFunc("/api/protocol", protocolHandler).Methods("GET", "POST")
    r.HandleFunc("/api/status", statusHandler).Methods("GET")
    
    // WebSocket endpoint
    r.HandleFunc("/ws", websocketHandler)

    // Static files (if needed)
    r.PathPrefix("/").Handler(http.FileServer(http.Dir("./static/")))

    // Start WebSocket message broadcaster
    go handleMessages()

    log.Printf("🚀 Hexperiment System Protocol Server starting on port %s", port)
    log.Printf("📍 Health check: http://localhost:%s/api/health", port)
    log.Printf("🔌 WebSocket: ws://localhost:%s/ws", port)
    
    if err := http.ListenAndServe(":"+port, r); err != nil {
        log.Fatal("❌ Server failed to start:", err)
    }
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    response := map[string]interface{}{
        "status":    "healthy",
        "service":   "Hexperiment System Protocol",
        "version":   "1.0.0",
        "timestamp": time.Now().UTC().Format(time.RFC3339),
        "uptime":    "running",
    }
    json.NewEncoder(w).Encode(response)
}

func protocolHandler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    
    switch r.Method {
    case "GET":
        // Return protocol status
        response := Protocol{
            ID:        "hexperiment-1",
            Type:      "status",
            Data:      map[string]interface{}{"status": "active", "connections": len(clients)},
            Timestamp: time.Now(),
            Status:    "operational",
        }
        json.NewEncoder(w).Encode(response)
        
    case "POST":
        // Process incoming protocol message
        var protocol Protocol
        if err := json.NewDecoder(r.Body).Decode(&protocol); err != nil {
            http.Error(w, "Invalid JSON", http.StatusBadRequest)
            return
        }
        
        protocol.Timestamp = time.Now()
        protocol.Status = "processed"
        
        // Broadcast to WebSocket clients
        broadcast <- protocol
        
        json.NewEncoder(w).Encode(protocol)
    }
}

func statusHandler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    response := map[string]interface{}{
        "service":     "Hexperiment System Protocol",
        "version":     "1.0.0",
        "status":      "running",
        "connections": len(clients),
        "endpoints": map[string]string{
            "health":    "/api/health",
            "protocol":  "/api/protocol",
            "status":    "/api/status",
            "websocket": "/ws",
        },
        "timestamp": time.Now().UTC().Format(time.RFC3339),
    }
    json.NewEncoder(w).Encode(response)
}

func websocketHandler(w http.ResponseWriter, r *http.Request) {
    conn, err := upgrader.Upgrade(w, r, nil)
    if err != nil {
        log.Printf("❌ WebSocket upgrade failed: %v", err)
        return
    }
    defer conn.Close()

    // Register client
    clients[conn] = true
    log.Printf("✅ New WebSocket client connected. Total: %d", len(clients))

    // Listen for messages from client
    for {
        var protocol Protocol
        err := conn.ReadJSON(&protocol)
        if err != nil {
            log.Printf("❌ WebSocket read error: %v", err)
            delete(clients, conn)
            break
        }
        
        // Process and broadcast message
        protocol.Timestamp = time.Now()
        broadcast <- protocol
    }
}

func handleMessages() {
    for {
        protocol := <-broadcast
        
        // Send to all connected clients
        for client := range clients {
            err := client.WriteJSON(protocol)
            if err != nil {
                log.Printf("❌ WebSocket write error: %v", err)
                client.Close()
                delete(clients, client)
            }
        }
    }
}