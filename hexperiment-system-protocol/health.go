package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"runtime"
	"time"
)

type HealthStatus struct {
	Status      string            `json:"status"`
	Service     string            `json:"service"`
	Version     string            `json:"version"`
	Timestamp   string            `json:"timestamp"`
	Uptime      string            `json:"uptime"`
	GoVersion   string            `json:"goVersion"`
	Environment map[string]string `json:"environment"`
}

var startTime = time.Now()

// healthCheckHandler responds to health check requests with system status information.
// It returns a JSON response containing:
//   - Service health status (always "healthy" for live instances)
//   - Service name and version
//   - Current timestamp in RFC3339 format
//   - Service uptime since startup
//   - Go runtime version
//   - Environment variables (currently only PORT)
//
// The response has Content-Type set to "application/json".
// This endpoint is typically used for monitoring and load balancer health checks.
func healthCheckHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	env := map[string]string{
		"PORT": os.Getenv("PORT"),
	}
	status := HealthStatus{
		Status:      "healthy",
		Service:     "Hexperiment System Protocol",
		Version:     "1.0.0",
		Timestamp:   time.Now().UTC().Format(time.RFC3339),
		Uptime:      time.Since(startTime).String(),
		GoVersion:   runtime.Version(),
		Environment: env,
	json.NewEncoder(w).Encode(status)
}

func main() {
	http.HandleFunc("/health", healthCheckHandler)
	
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	
	log.Printf("Server starting on port %s", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatal(err)
	}
}
}
