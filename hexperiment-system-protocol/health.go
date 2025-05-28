package main

import (
	"encoding/json"
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

func healthHandler(w http.ResponseWriter, r *http.Request) {
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
	}
	json.NewEncoder(w).Encode(status)
}
