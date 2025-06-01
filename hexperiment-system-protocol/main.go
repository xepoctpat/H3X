package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"math/rand"
	"net/http"
	"os"
	"strings"
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

// Persona represents a generated persona
type Persona struct {
	ID                 string                 `json:"id"`
	Name               string                 `json:"name"`
	SocialSetting      string                 `json:"socialSetting"`
	Traits             []string               `json:"traits"`
	Background         string                 `json:"background"`
	Motivations        []string               `json:"motivations"`
	CommunicationStyle string                 `json:"communicationStyle"`
	Metadata           map[string]interface{} `json:"metadata"`
	Generated          time.Time              `json:"generated"`
}

// LMStudioRequest represents a request to LM Studio
type LMStudioRequest struct {
	Model      string    `json:"model"`
	Messages   []Message `json:"messages"`
	MaxTokens  int       `json:"max_tokens"`
	Temperature float64   `json:"temperature"`
	Stream     bool      `json:"stream"`
}

type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

// LMStudioResponse represents a response from LM Studio
type LMStudioResponse struct {
	Choices []Choice `json:"choices"`
	Usage   Usage    `json:"usage"`
	Model   string   `json:"model"`
}

type Choice struct {
	Message      Message `json:"message"`
	FinishReason string  `json:"finish_reason"`
}

type Usage struct {
	PromptTokens     int `json:"prompt_tokens"`
	CompletionTokens int `json:"completion_tokens"`
	TotalTokens      int `json:"total_tokens"`
}

// WebSocket upgrader
var 

upgrader = websocket.Ada{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		// Get allowed origins from environment
		allowedOrigins := os.Getenv("WEBSOCKET_ALLOWED_ORIGINS")
		
		// Development mode: allow all origins
		if allowedOrigins == "" || allowedOrigins == "*" {
			log.Println("[WebSocket] WARNING: Allowing all origins. Set WEBSOCKET_ALLOWED_ORIGINS in production!")
			return true
		}
		
		// Production mode: check against allowed origins
		origin := r.Header.Get("Origin")
		if origin == "" {
			// No origin header, could be non-browser client
			return true
		}
		
		// Check if origin is in allowed list
		allowedList := strings.Split(allowedOrigins, ",")
		for _, allowed := range allowedList {
			if strings.TrimSpace(allowed) == origin {
				return true
			}
		}
		
		log.Printf("[WebSocket] Rejected connection from origin: %s", origin)
		return false
	},
	// Enable compression
	EnableCompression: true,
	// Handle protocol negotiation
	Subprotocols: []string{"hexperiment-v2", "hexperiment-v1"},
	// Error handler
	Error: func(w http.ResponseWriter, r *http.Request, status int, reason error) {
		log.Printf("[WebSocket] Upgrade error - Status: %d, Reason: %v", status, reason)
		w.WriteHeader(status)
		w.Write([]byte(fmt.Sprintf(`{"error": "WebSocket upgrade failed: %v"}`, reason)))
	},
}

// Active WebSocket connections with metadata
type Client struct {
	conn     *websocket.Conn
	id       string
	joinTime time.Time
	metadata map[string]interface{}
}

var clients = make(map[string]*Client)
var broadcast = make(chan Protocol)

// Persona generation datasets
var personalityTraits = []string{
	"analytical", "creative", "empathetic", "decisive", "adaptable", "meticulous",
	"innovative", "collaborative", "independent", "optimistic", "pragmatic", "visionary",
	"detail-oriented", "big-picture", "risk-taking", "cautious", "extroverted", "introverted",
	"diplomatic", "direct", "patient", "energetic", "methodical", "spontaneous",
}

var motivationSets = [][]string{
	{"achievement", "recognition", "excellence"},
	{"knowledge", "understanding", "discovery"},
	{"connection", "belonging", "community"},
	{"security", "stability", "predictability"},
	{"freedom", "autonomy", "independence"},
	{"influence", "impact", "leadership"},
	{"creativity", "innovation", "expression"},
	{"service", "helping others", "contribution"},
}

var communicationStyles = []string{
	"direct and concise", "detailed and thorough", "collaborative and inclusive",
	"inspirational and motivating", "analytical and data-driven", "empathetic and supportive",
	"assertive and confident", "diplomatic and tactful", "casual and approachable",
	"formal and professional", "creative and metaphorical", "logical and structured",
}

// Load environment variables
func main() {

	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using default values")
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Initialize router
	r := mux.NewRouter()

	// --- Security: CORS Middleware for cross-container and browser security ---
	r.Use(corsMiddleware)

	// --- Security: API Key Middleware for protected endpoints ---
	r.HandleFunc("/api/health", healthHandler).Methods("GET")
	r.Handle("/api/protocol", apiKeyAuthMiddleware(http.HandlerFunc(protocolHandler))).Methods("GET", "POST")
	r.Handle("/api/status", apiKeyAuthMiddleware(http.HandlerFunc(statusHandler))).Methods("GET")

	// Enhanced endpoints
	r.Handle("/api/persona/generate", apiKeyAuthMiddleware(http.HandlerFunc(personaGenerationHandler))).Methods("POST")
	r.Handle("/api/lmstudio/chat", apiKeyAuthMiddleware(http.HandlerFunc(lmStudioChatHandler))).Methods("POST")
	r.Handle("/api/realtime/status", apiKeyAuthMiddleware(http.HandlerFunc(realtimeStatusHandler))).Methods("GET")

	// WebSocket endpoint
	r.HandleFunc("/ws", websocketHandler)

	// Static files (if needed)
	r.PathPrefix("/").Handler(http.FileServer(http.Dir("./static/")))

	// Proxy handlers
	r.HandleFunc("/api/github", githubProxyHandler).Methods("GET")
	r.HandleFunc("/api/huggingface", huggingfaceProxyHandler).Methods("POST")

	// Start WebSocket message broadcaster
	go handleMessages()

	// Start periodic status updates
	go periodicStatusUpdates()

	log.Printf("🚀 Hexperiment System Protocol Server starting on port %s", port)
	log.Printf("📍 Health check: http://localhost:%s/api/health", port)
	log.Printf("🔌 WebSocket: ws://localhost:%s/ws", port)
	log.Printf("🧬 Persona generation: http://localhost:%s/api/persona/generate", port)
	log.Printf("🤖 LM Studio integration: http://localhost:%s/api/lmstudio/chat", port)

	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatal("❌ Server failed to start:", err)
	}
}

// --- Security: CORS middleware implementation ---
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// For private Docker/K8s networks, allow all origins for internal communication
		// In production/public, set CORS_ALLOW_ORIGIN to a trusted domain
		allowOrigin := os.Getenv("CORS_ALLOW_ORIGIN")
		if allowOrigin == "" {
			allowOrigin = "*" // Default: allow all for private/internal use
		}
		w.Header().Set("Access-Control-Allow-Origin", allowOrigin)
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-API-Key")
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

// --- Security: API Key authentication middleware ---
func apiKeyAuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		apiKey := os.Getenv("API_KEY")
		if apiKey == "" {
			log.Println("[SECURITY WARNING] API_KEY not set. All requests are allowed. Set API_KEY in production!")
			next.ServeHTTP(w, r)
			return
		}
		key := r.Header.Get("X-API-Key")
		if key == "" {
			key = r.URL.Query().Get("api_key")
		}
		if key != apiKey {
			w.WriteHeader(http.StatusUnauthorized)
			w.Write([]byte(`{"error":"Unauthorized: missing or invalid API key"}`))
			return
		}
		next.ServeHTTP(w, r)
	})
}

// --- Minimal GitHub API proxy (secure, no secrets in code) ---
func githubProxyHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	githubToken := os.Getenv("GITHUB_TOKEN")
	if githubToken == "" {
		http.Error(w, "GITHUB_TOKEN not set", http.StatusForbidden)
		return
	}
	// Only allow safe GET requests to public API endpoints
	if r.Method != "GET" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	path := r.URL.Query().Get("path")
	if path == "" || strings.Contains(path, "..") {
		http.Error(w, "Invalid path", http.StatusBadRequest)
		return
	}
	apiURL := "https://api.github.com" + path
	req, err := http.NewRequest("GET", apiURL, nil)
	if err != nil {
		http.Error(w, "Request error", http.StatusInternalServerError)
		return
	}
	req.Header.Set("Authorization", "Bearer "+githubToken)
	req.Header.Set("Accept", "application/vnd.github+json")
	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		http.Error(w, "GitHub API error", http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()
	w.WriteHeader(resp.StatusCode)
	io.Copy(w, resp.Body)
}

// --- Minimal HuggingFace API proxy (secure, no secrets in code) ---
func huggingfaceProxyHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	hfToken := os.Getenv("HUGGINGFACE_TOKEN")
	if hfToken == "" {
		http.Error(w, "HUGGINGFACE_TOKEN not set", http.StatusForbidden)
		return
	}
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	model := r.URL.Query().Get("model")
	if model == "" || strings.Contains(model, "..") {
		http.Error(w, "Invalid model", http.StatusBadRequest)
		return
	}
	apiURL := "https://api-inference.huggingface.co/models/" + model
	req, err := http.NewRequest("POST", apiURL, r.Body)
	if err != nil {
		http.Error(w, "Request error", http.StatusInternalServerError)
		return
	}
	req.Header.Set("Authorization", "Bearer "+hfToken)
	req.Header.Set("Content-Type", "application/json")
	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		http.Error(w, "HuggingFace API error", http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()
	w.WriteHeader(resp.StatusCode)
	io.Copy(w, resp.Body)
}

// --- Protocol handler ---
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

// --- Status handler ---
func statusHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	response := map[string]interface{}{
		"service":     "Hexperiment System Protocol",
		"version":     "2.0.0",
		"status":      "running",
		"connections": len(clients),
		"features": map[string]string{
			"websocket":         "enhanced",
			"persona_generation": "active",
			"lmstudio_integration": "active",
			"realtime_data": "active",
		},
		"endpoints": map[string]string{
			"health":    "/api/health",
			"protocol":  "/api/protocol",
			"status":    "/api/status",
			"websocket": "/ws",
			"persona":   "/api/persona/generate",
			"lmstudio":  "/api/lmstudio/chat",
			"realtime":  "/api/realtime/status",
		},
		"timestamp": time.Now().UTC().Format(time.RFC3339),
	}
	json.NewEncoder(w).Encode(response)
}

// Enhanced persona generation handler
func personaGenerationHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var request struct {
		SocialSetting string `json:"socialSetting"`
		Trait         string `json:"trait"`
		Variations    int    `json:"variations"`
		UseAI         bool   `json:"useAI"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	// Default values
	if request.Variations == 0 {
		request.Variations = 1
	}
	if request.Variations > 10 {
		request.Variations = 10
	}
	if request.SocialSetting == "" {
		request.SocialSetting = "work"
	}

	personas := make([]Persona, request.Variations)

	for i := 0; i < request.Variations; i++ {
		persona := generatePersona(request.SocialSetting, request.Trait, request.UseAI)
		personas[i] = persona
	}

	// Broadcast persona generation event
	protocolEvent := Protocol{
		ID:   fmt.Sprintf("persona-gen-%d", time.Now().Unix()),
		Type: "persona_generation",
		Data: map[string]interface{}{
			"count":         request.Variations,
			"socialSetting": request.SocialSetting,
			"trait":         request.Trait,
			"useAI":         request.UseAI,
		},
		Timestamp: time.Now(),
		Status:    "completed",
	}
	broadcast <- protocolEvent

	response := map[string]interface{}{
		"success":  true,
		"count":    len(personas),
		"personas": personas,
		"metadata": map[string]interface{}{
			"generated_at": time.Now(),
			"ai_enhanced":  request.UseAI,
			"variation_count": request.Variations,
		},
	}

	json.NewEncoder(w).Encode(response)
}

// Generate persona with enhanced algorithm
func generatePersona(socialSetting, preferredTrait string, useAI bool) Persona {
	id := fmt.Sprintf("persona-%d-%d", time.Now().Unix(), rand.Intn(1000))
	
	// Select traits
	traits := make([]string, 0)
	if preferredTrait != "" {
		traits = append(traits, preferredTrait)
	}
	
	// Add random traits
	for len(traits) < 3 {
		trait := personalityTraits[rand.Intn(len(personalityTraits))]
		if !contains(traits, trait) {
			traits = append(traits, trait)
		}
	}

	// Select motivations
	motivations := motivationSets[rand.Intn(len(motivationSets))]
	
	// Select communication style
	commStyle := communicationStyles[rand.Intn(len(communicationStyles))]

	// Generate background based on social setting
	backgrounds := map[string][]string{
		"work": {
			"Senior software engineer with 8+ years of experience",
			"Marketing manager focused on digital transformation",
			"Data scientist specializing in machine learning",
			"Project manager with expertise in agile methodologies",
			"UX designer passionate about user-centered design",
		},
		"family": {
			"Parent of two children, active in community events",
			"Recent college graduate living with extended family",
			"Working professional balancing career and family time",
			"Retired educator enjoying quality time with grandchildren",
			"Young professional maintaining close family relationships",
		},
		"friends": {
			"Social connector who organizes regular group activities",
			"Outdoor enthusiast who enjoys hiking and camping",
			"Tech-savvy individual who shares knowledge with peers",
			"Creative type involved in local arts and culture scene",
			"Sports fan who follows multiple teams and leagues",
		},
		"public": {
			"Community volunteer active in local organizations",
			"Public speaker who participates in professional events",
			"Social media influencer with focus on positive content",
			"Civic-minded citizen engaged in local government",
			"Professional networker who attends industry conferences",
		},
	}

	backgroundList := backgrounds[socialSetting]
	if backgroundList == nil {
		backgroundList = backgrounds["work"] // fallback
	}
	background := backgroundList[rand.Intn(len(backgroundList))]

	// Generate name
	names := []string{
		"Alex Rivera", "Jordan Chen", "Taylor Smith", "Casey Johnson",
		"Morgan Davis", "Riley Wilson", "Avery Brown", "Quinn Martinez",
		"Cameron Lee", "Dakota Thompson", "Sage Anderson", "River Garcia",
	}
	name := names[rand.Intn(len(names))]

	persona := Persona{
		ID:                 id,
		Name:               name,
		SocialSetting:      socialSetting,
		Traits:            traits,
		Background:        background,
		Motivations:       motivations,
		CommunicationStyle: commStyle,
		Metadata: map[string]interface{}{
			"generation_method": "algorithmic",
			"ai_enhanced":       useAI,
			"version":          "2.0",
		},
		Generated: time.Now(),
	}

	// If AI enhancement is requested, enhance with LM Studio
	if useAI {
		enhancePersonaWithAI(&persona)
	}

	return persona
}

// LM Studio chat handler for real-time AI communication
func lmStudioChatHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var request struct {
		Message     string                 `json:"message"`
		Context     map[string]interface{} `json:"context"`
		Temperature float64                `json:"temperature"`
		MaxTokens   int                    `json:"maxTokens"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	// Default values
	if request.Temperature == 0 {
		request.Temperature = 0.7
	}
	if request.MaxTokens == 0 {
		request.MaxTokens = 500
	}

	// Call LM Studio
	response, err := callLMStudio(request.Message, request.Temperature, request.MaxTokens)
	if err != nil {
		errorResponse := map[string]interface{}{
			"success": false,
			"error":   err.Error(),
			"fallback": "LM Studio connection failed. Using fallback response.",
		}
		w.WriteHeader(http.StatusServiceUnavailable)
		json.NewEncoder(w).Encode(errorResponse)
		return
	}

	// Broadcast LM Studio interaction
	protocolEvent := Protocol{
		ID:   fmt.Sprintf("lmstudio-%d", time.Now().Unix()),
		Type: "lmstudio_interaction",
		Data: map[string]interface{}{
			"input_length":  len(request.Message),
			"output_length": len(response),
			"temperature":   request.Temperature,
			"max_tokens":    request.MaxTokens,
		},
		Timestamp: time.Now(),
		Status:    "completed",
	}
	broadcast <- protocolEvent

	successResponse := map[string]interface{}{
		"success":  true,
		"response": response,
		"metadata": map[string]interface{}{
			"timestamp":   time.Now(),
			"temperature": request.Temperature,
			"max_tokens":  request.MaxTokens,
			"context":     request.Context,
		},
	}

	json.NewEncoder(w).Encode(successResponse)
}

// Real-time status handler
func realtimeStatusHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	
	// Collect real-time metrics
	status := map[string]interface{}{
		"server": map[string]interface{}{
			"uptime_seconds": time.Since(time.Now().Add(-time.Hour)).Seconds(), // placeholder
			"memory_usage":   "unknown", // would need runtime package
			"cpu_usage":      "unknown",
		},
		"websocket": map[string]interface{}{
			"active_connections": len(clients),
			"total_messages":     "unknown", // would need counter
		},
		"lmstudio": map[string]interface{}{
			"status":          checkLMStudioStatus(),
			"last_interaction": "unknown",
		},
		"persona_generation": map[string]interface{}{
			"total_generated": "unknown", // would need counter
			"last_generation": "unknown",
		},
		"timestamp": time.Now(),
	}

	json.NewEncoder(w).Encode(status)
}

// Enhanced WebSocket handler with client management
func websocketHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("❌ WebSocket upgrade failed: %v", err)
		return
	}
	defer conn.Close()

	// Create client with metadata
	clientID := fmt.Sprintf("client-%d", time.Now().UnixNano())
	client := &Client{
		conn:     conn,
		id:       clientID,
		joinTime: time.Now(),
		metadata: make(map[string]interface{}),
	}

	// Register client
	clients[clientID] = client
	log.Printf("✅ New WebSocket client connected: %s. Total: %d", clientID, len(clients))

	// Send welcome message
	welcomeMsg := Protocol{
		ID:   fmt.Sprintf("welcome-%s", clientID),
		Type: "welcome",
		Data: map[string]interface{}{
			"client_id":        clientID,
			"server_version":   "2.0.0",
			"features_enabled": []string{"persona_generation", "lmstudio_integration", "realtime_data"},
		},
		Timestamp: time.Now(),
		Status:    "connected",
	}
	conn.WriteJSON(welcomeMsg)

	// Listen for messages from client
	for {
		var protocol Protocol
		err := conn.ReadJSON(&protocol)
		if err != nil {
			log.Printf("❌ WebSocket read error: %v", err)
			delete(clients, clientID)
			break
		}

		// Process client message
		protocol.Timestamp = time.Now()
		protocol.Data["from_client"] = clientID
		
		// Handle special message types
		switch protocol.Type {
		case "persona_request":
			handlePersonaRequest(protocol, client)
		case "lmstudio_request":
			handleLMStudioRequest(protocol, client)
		case "heartbeat":
			handleHeartbeat(protocol, client)
		default:
			// Broadcast message
			broadcast <- protocol
		}
	}
}

// Enhanced message broadcaster
func handleMessages() {
	for {
		protocol := <-broadcast

		// Send to all connected clients
		for clientID, client := range clients {
			err := client.conn.WriteJSON(protocol)
			if err != nil {
				log.Printf("❌ WebSocket write error for client %s: %v", clientID, err)
				client.conn.Close()
				delete(clients, clientID)
			}
		}
	}
}

// Periodic status updates via WebSocket
func periodicStatusUpdates() {
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			statusUpdate := Protocol{
				ID:   fmt.Sprintf("status-update-%d", time.Now().Unix()),
				Type: "status_update",
				Data: map[string]interface{}{
					"connections":      len(clients),
					"server_uptime":    time.Since(time.Now().Add(-time.Hour)).String(),
					"lmstudio_status":  checkLMStudioStatus(),
					"memory_usage":     "monitoring",
				},
				Timestamp: time.Now(),
				Status:    "periodic",
			}
			broadcast <- statusUpdate
		}
	}
}

// Helper function to check if slice contains string
func contains(slice []string, item string) bool {
	for _, s := range slice {
		if s == item {
			return true
		}
	}
	return false
}

// Enhance persona with AI (LM Studio integration)
func enhancePersonaWithAI(persona *Persona) {
	prompt := fmt.Sprintf(`Enhance this persona with more detailed characteristics and background:
Name: %s
Social Setting: %s
Traits: %s
Background: %s
Communication Style: %s

Provide a more detailed background story, specific interests, and unique characteristics that make this persona distinctive and realistic. Keep the response concise but vivid.`, 
		persona.Name, persona.SocialSetting, strings.Join(persona.Traits, ", "), 
		persona.Background, persona.CommunicationStyle)

	enhancement, err := callLMStudio(prompt, 0.8, 300)
	if err != nil {
		log.Printf("⚠️ AI enhancement failed: %v", err)
		persona.Metadata["ai_enhancement"] = "failed"
		return
	}

	persona.Background = enhancement
	persona.Metadata["ai_enhanced"] = true
	persona.Metadata["enhancement_timestamp"] = time.Now()
}

// Call LM Studio API
func callLMStudio(prompt string, temperature float64, maxTokens int) (string, error) {
	lmStudioURL := os.Getenv("LMSTUDIO_URL")
	if lmStudioURL == "" {
		lmStudioURL = "http://localhost:1234"
	}

	request := LMStudioRequest{
		Model: "local-model",
		Messages: []Message{
			{Role: "system", Content: "You are a helpful AI assistant that provides clear, concise responses."},
			{Role: "user", Content: prompt},
		},
		MaxTokens:   maxTokens,
		Temperature: temperature,
		Stream:      false,
	}

	jsonData, err := json.Marshal(request)
	if err != nil {
		return "", fmt.Errorf("failed to marshal request: %v", err)
	}

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Post(lmStudioURL+"/v1/chat/completions", "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return "", fmt.Errorf("failed to call LM Studio: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("LM Studio returned status %d", resp.StatusCode)
	}

	var response LMStudioResponse
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return "", fmt.Errorf("failed to decode response: %v", err)
	}

	if len(response.Choices) == 0 {
		return "", fmt.Errorf("no response from LM Studio")
	}

	return response.Choices[0].Message.Content, nil
}

// Check LM Studio status
func checkLMStudioStatus() string {
	lmStudioURL := os.Getenv("LMSTUDIO_URL")
	if lmStudioURL == "" {
		lmStudioURL = "http://localhost:1234"
	}

	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Get(lmStudioURL + "/v1/models")
	if err != nil {
		return "offline"
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusOK {
		return "online"
	}
	return "error"
}

// Handle persona request via WebSocket
func handlePersonaRequest(protocol Protocol, client *Client) {
	// Extract parameters from protocol data
	socialSetting, _ := protocol.Data["socialSetting"].(string)
	trait, _ := protocol.Data["trait"].(string)
	variations, _ := protocol.Data["variations"].(float64) // JSON numbers are float64
	useAI, _ := protocol.Data["useAI"].(bool)

	if socialSetting == "" {
		socialSetting = "work"
	}
	if variations == 0 {
		variations = 1
	}

	personas := make([]Persona, int(variations))
	for i := 0; i < int(variations); i++ {
		personas[i] = generatePersona(socialSetting, trait, useAI)
	}

	response := Protocol{
		ID:   fmt.Sprintf("persona-response-%d", time.Now().Unix()),
		Type: "persona_response",
		Data: map[string]interface{}{
			"success":  true,
			"personas": personas,
			"count":    len(personas),
			"request_id": protocol.ID,
		},
		Timestamp: time.Now(),
		Status:    "completed",
	}

	// Send directly to requesting client
	client.conn.WriteJSON(response)
}

// Handle LM Studio request via WebSocket
func handleLMStudioRequest(protocol Protocol, client *Client) {
	message, _ := protocol.Data["message"].(string)
	temperature, _ := protocol.Data["temperature"].(float64)
	maxTokens, _ := protocol.Data["maxTokens"].(float64)

	if temperature == 0 {
		temperature = 0.7
	}
	if maxTokens == 0 {
		maxTokens = 500
	}

	response, err := callLMStudio(message, temperature, int(maxTokens))
	
	var protocolResponse Protocol
	if err != nil {
		protocolResponse = Protocol{
			ID:   fmt.Sprintf("lmstudio-response-%d", time.Now().Unix()),
			Type: "lmstudio_response",
			Data: map[string]interface{}{
				"success":    false,
				"error":      err.Error(),
				"request_id": protocol.ID,
			},
			Timestamp: time.Now(),
			Status:    "error",
		}
	} else {
		protocolResponse = Protocol{
			ID:   fmt.Sprintf("lmstudio-response-%d", time.Now().Unix()),
			Type: "lmstudio_response",
			Data: map[string]interface{}{
				"success":    true,
				"response":   response,
				"request_id": protocol.ID,
			},
			Timestamp: time.Now(),
			Status:    "completed",
		}
	}

	// Send directly to requesting client
	client.conn.WriteJSON(protocolResponse)
}

// Handle heartbeat from client
func handleHeartbeat(protocol Protocol, client *Client) {
	response := Protocol{
		ID:   fmt.Sprintf("heartbeat-response-%d", time.Now().Unix()),
		Type: "heartbeat_response",
		Data: map[string]interface{}{
			"client_id":  client.id,
			"server_time": time.Now(),
			"uptime":     time.Since(client.joinTime).String(),
		},
		Timestamp: time.Now(),
		Status:    "active",
	}

	client.conn.WriteJSON(response)
}
