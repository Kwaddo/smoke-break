package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"strconv"
	"net/http"
	"firebase.google.com/go"
	"google.golang.org/api/option"
	"cloud.google.com/go/firestore"
	"google.golang.org/api/iterator"
)

var client *firestore.Client

type Score struct {
	Name  string `json:"name"`
	Score int64  `json:"score"`
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
	http.Handle("/assets/", http.StripPrefix("/assets/", http.FileServer(http.Dir("assets"))))
	http.HandleFunc("/", serveIndex)
	http.HandleFunc("/single.html", serveSingle)
	http.HandleFunc("/double.html", serveDouble)
	http.HandleFunc("/scores", serveScores)
	http.HandleFunc("/submit-score", submitScore)

	port := ":8080"
	log.Printf("Starting server on %s...", port)
	err = http.ListenAndServe(port, nil)
	if err != nil {
		log.Fatal("Server failed:", err)
	}
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
	_, err := client.Collection("scores").Doc(score.Name).Set(context.Background(), map[string]interface{}{
		"name":  score.Name,  
		"score": score.Score, 
	})
	if err != nil {
		http.Error(w, fmt.Sprintf("Error saving score: %v", err), http.StatusInternalServerError)
		return
	}	
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Score submitted successfully"})
}
