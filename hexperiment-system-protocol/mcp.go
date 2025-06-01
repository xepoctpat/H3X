package main

import (
	"encoding/json"
	"net/http"
	"time"
)

type MCPRequest struct {
	Id     string                 `json:"id"`
	Input  map[string]interface{} `json:"input"`
	Params map[string]interface{} `json:"params,omitempty"`
}

type MCPResponse struct {
	Id     string                 `json:"id"`
	Output map[string]interface{} `json:"output"`
	Status string                 `json:"status"`
	Error  string                 `json:"error,omitempty"`
}

func mcpHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var req MCPRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(MCPResponse{
			Id:     req.Id,
			Status: "error",
			Error:  "Invalid MCP request JSON",
		})
		return
	}

	protocol := Protocol{
		ID:        req.Id,
		Type:      "mcp",
		Data:      req.Input,
		Timestamp: time.Now(),
		Status:    "processed",
	}

	// Optionally broadcast to WebSocket clients
	broadcast <- protocol

	resp := MCPResponse{
		Id:     req.Id,
		Output: map[string]interface{}{"result": "MCP call processed", "data": protocol.Data},
		Status: "ok",
	}
	json.NewEncoder(w).Encode(resp)
}
