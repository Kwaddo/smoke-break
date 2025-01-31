package main

import (
	"net/http"
	"log"
)

func main() {
	http.Handle("/assets/", http.StripPrefix("/assets/", http.FileServer(http.Dir("assets"))))
	http.HandleFunc("/", serveIndex)
	http.HandleFunc("/single.html", serveSingle)
	http.HandleFunc("/double.html", serveDouble)
	port := ":8080"
	log.Printf("Starting server on %s...", port)
	err := http.ListenAndServe(port, nil)
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
