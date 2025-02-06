package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"strconv"
    "strings"
	"net/http"
    "path/filepath"
	"firebase.google.com/go"
	"google.golang.org/api/option"
	"cloud.google.com/go/firestore"
	"google.golang.org/api/iterator"
)

var client *firestore.Client

type Score struct {
	Name      string `json:"name"`
	Score     int64  `json:"score"`
	Timestamp string `json:"timestamp"`
}

func main() {
    opt := option.WithCredentialsFile("credentials.json")
    app, err := firebase.NewApp(context.Background(), nil, opt)
    if err != nil {
        log.Fatalf("error initializing app: %v", err)
    }
    client, err = app.Firestore(context.Background())
    if err != nil {
        log.Fatalf("error getting Firestore client: %v", err)
    }
    defer client.Close()
    http.HandleFunc("/assets/", func(w http.ResponseWriter, r *http.Request) {
        if isAllowedAsset(r.URL.Path) {
            fs := http.StripPrefix("/assets/", http.FileServer(http.Dir("assets")))
            fs.ServeHTTP(w, r)
            return
        }
        http.Error(w, "Forbidden", http.StatusForbidden)
    })
    http.HandleFunc("/", middleware(serveIndex))
    http.HandleFunc("/single", middleware(serveSingle))
    http.HandleFunc("/double", middleware(serveDouble))
    http.HandleFunc("/scores", middleware(serveScores))
    http.HandleFunc("/hidden", middleware(serveHidden))
    http.HandleFunc("/submit-score", middleware(submitScore))
    port := ":6776"
    log.Printf("Starting server on %s...", port)
    err = http.ListenAndServe(port, nil)
    if err != nil {
        log.Fatal("Server failed:", err)
    }
}

func middleware(next http.HandlerFunc) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        if r.URL.Path == "/scores" || r.URL.Path == "/submit-score" {
            if r.Header.Get("X-Requested-With") != "XMLHttpRequest" {
                http.Redirect(w, r, "/", http.StatusSeeOther)
                return
            }
        }
        next(w, r)
    }
}

func isAllowedAsset(path string) bool {
    allowedExts := map[string]bool{
        ".css":  true,
        ".js":   true,
        ".png":  true,
        ".jpg":  true,
        ".jpeg": true,
        ".svg":  true,
        ".ico":  true,
    }
    ext := strings.ToLower(filepath.Ext(path))
    return allowedExts[ext]
}

func serveIndex(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "index.html")
}

func serveSingle(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "single.html")
}

func serveDouble(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "double.html")
}

func serveHidden(w http.ResponseWriter, r *http.Request) {
    http.ServeFile(w, r, "hidden.html")
}

func serveScores(w http.ResponseWriter, r *http.Request) {
    pageParam := r.URL.Query().Get("page")
    if pageParam == "" {
        pageParam = "1"
    }
    page, err := strconv.Atoi(pageParam)
    if err != nil || page < 1 {
        http.Error(w, "Invalid page number", http.StatusBadRequest)
        return
    }
    
    scoresPerPage := 5
    startIndex := (page - 1) * scoresPerPage

    countQuery := client.Collection("scores").Documents(context.Background())
    var totalCount int
    for {
        _, err := countQuery.Next()
        if err == iterator.Done {
            break
        }
        if err != nil {
            http.Error(w, fmt.Sprintf("Error counting documents: %v", err), http.StatusInternalServerError)
            return
        }
        totalCount++
    }

    query := client.Collection("scores").
        OrderBy("score", firestore.Desc).
        Limit(scoresPerPage).
        Offset(startIndex)
    
    iter := query.Documents(context.Background())
    var leaderboard []struct {
        Name  string `json:"name"`
        Score int    `json:"score"`
        Timestamp string `json:"timestamp"`
    }

    for {
        doc, err := iter.Next()
        if err == iterator.Done {
            break
        }
        if err != nil {
            http.Error(w, fmt.Sprintf("Error retrieving leaderboard: %v", err), http.StatusInternalServerError)
            return
        }

        var scoreData struct {
            Name  string `json:"name"`
            Score int    `json:"score"`
            Timestamp string `json:"timestamp"`
        }
        if err := doc.DataTo(&scoreData); err != nil {
            http.Error(w, fmt.Sprintf("Error decoding document data: %v", err), http.StatusInternalServerError)
            return
        }
        leaderboard = append(leaderboard, scoreData)
    }

    response := struct {
        Scores []struct {
            Name  string `json:"name"`
            Score int    `json:"score"`
            Timestamp string `json:"timestamp"`
        } `json:"scores"`
        TotalScores int `json:"totalScores"`
    }{
        Scores:      leaderboard,
        TotalScores: totalCount,
    }

    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(response)
}

func submitScore(w http.ResponseWriter, r *http.Request) {
	var score Score
	if err := json.NewDecoder(r.Body).Decode(&score); err != nil {
		http.Error(w, fmt.Sprintf("Error decoding JSON: %v", err), http.StatusBadRequest)
		return
	}
    if len(score.Name) > 10 {
        http.Error(w, "Name cannot exceed 10 characters", http.StatusBadRequest)
        return
    }
	_, err := client.Collection("scores").Doc(score.Name).Set(context.Background(), map[string]interface{}{
		"name":  score.Name,  
		"score": score.Score, 
		"timestamp": score.Timestamp,
	})
	if err != nil {
		http.Error(w, fmt.Sprintf("Error saving score: %v", err), http.StatusInternalServerError)
		return
	}	
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Score submitted successfully"})
}
