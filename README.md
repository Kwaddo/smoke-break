# Smoke Break Game

## Overview

A web-based maze game where players need to find Ahmed during his smoke break. The game features both single-player and multiplayer modes with different maps and time-based challenges.

## Game Modes

### Single Player Mode

- Navigate through the maze using arrow keys
- Collect hints to find Ahmed
- Avoid other characters
- Limited time and lives
- Score based on remaining time and hints collected

### Multiplayer Mode

- Two-player game: Seeker vs Hider
- Seeker uses arrow keys to find the hider
- Hider (Ahmed) uses WASD to avoid being caught
- Time limit based gameplay

## Technical Structure

### Frontend Files

- `index.html`: Main game mode selection page
- `single.html`: Single player game interface
- `double.html`: Multiplayer game interface

### JavaScript Core

- `tilemap.js`: Handles map rendering and collision detection
- `game.js`: Single player game logic and mechanics
- `multiplayer.js`: Multiplayer game logic
- `character.js`: Character creation and movement
- `hints.js`: Hint system for single player
- `scores.js`: Leaderboard and score management

### Backend (Go)

- `main.go`: Server setup and API endpoints
- Firebase integration for leaderboard storage

### Styling

- `style.css`: All game styling and animations

## Game Features

### Maps

- Morning map: Green theme
- Afternoon map: Orange theme
- Evening map: Blue theme

### Characters

- Player character (black)
- NPC characters (colored dots)
- Ahmed (special colored character in multiplayer)

### Game Mechanics

1. Movement System
   - Grid-based movement
   - Collision detection
   - Smooth animations

2. Scoring System
   - Time-based scoring
   - Hint collection bonus
   - Leaderboard persistence

3. Hint System
   - Random hint spawning
   - Different hint types (location, color, etc.)
   - Score multipliers

## Setup Instructions

### Prerequisites

1. Go 1.23.5
2. Firebase account
3. Node.js (for development)

### Installation

```bash
# Clone repository
git clone [repository-url]

# Install Go dependencies
go mod download

# Set up Firebase
- Create credentials.json from Firebase console
- Place in project root

# Run server
go run main.go
```
