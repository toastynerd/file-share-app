# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Application Overview

QuickShare is a lightweight Flask web application for creating temporary file sharing sessions between devices. It allows users to transfer files directly from one device to another without requiring accounts or permanent storage by creating ephemeral file sharing sessions with unique IDs.

### Key Features

- Temporary session-based file sharing
- No accounts or registration required
- Real-time connection status
- Multiple file transfer support
- In-memory file storage (no persistence to disk)
- QR code for easy mobile connection

## Architecture

### Backend (Flask)

The main application is a Flask server (`app.py`) that handles:
- Session management
- API endpoints for file transfer
- Base64 encoding/decoding for file contents

Key components:
- `active_sessions`: In-memory dictionary that stores all session data
- Session routes: Create, view, and connect to sessions
- API routes: Status checks, file listing, file upload/download

### Frontend

Three main pages:
1. **Index Page** (`templates/index.html`, `static/js/index.js`): Creates sessions and displays QR code
2. **Session Page** (`templates/session.html`, `static/js/session.js`): Displays received files for downloading
3. **Connect Page** (`templates/connect.html`, `static/js/connect.js`): Used on the sending device to connect and upload files

## Development Commands

### Running Locally

```bash
# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the application
python app.py
```

Or use the convenience script:

```bash
./run.sh
```

### Docker Development

```bash
# Build and run with Docker Compose
docker compose up

# Build with specific options
docker compose up --build

# Run in detached mode
docker compose up -d

# Stop the containers
docker compose down
```

### Accessing the Application

- Local development: http://localhost:5001
- Docker: http://localhost:5001 or http://<local-ip>:5001

### Testing with browser-tools-mcp

For testing the application with Claude Code, you can use browser-tools-mcp to explore the web interface:

```bash
# Add browser-tools-mcp to Claude
claude mcp add browser-tools-mcp --transport stdio -- npx -y browser-tools-mcp

# Use browser-tools to navigate and interact with the app
# Example commands:
browser-goto "http://<local-ip>:5001"
browser-screenshot "homepage.png"
browser-click ".btn.primary"  # Click the Create Session button
```

When testing the file sharing functionality, you'll need to:
1. Access the app from two different devices (or browser windows)
2. Create a session on one device
3. Connect from the second device using the provided URL
4. Upload files from the second device
5. Download files on the first device

## Deployment

### Docker Deployment

The application is containerized for easy deployment:

```bash
# Build the Docker image
docker build -t quickshare .

# Run the container
docker run -p 5001:5001 quickshare
```

### AWS ECS with Fargate Deployment

1. Push Docker image to ECR
2. Create ECS cluster with Fargate
3. Configure task definition for the container
4. Set up Application Load Balancer
5. Create ECS service with the task definition

## Important Files

- `app.py` - Main Flask application with all routes and logic
- `templates/` - HTML templates for all pages
- `static/js/` - Frontend JavaScript for each page
- `static/css/style.css` - Styling for the application
- `Dockerfile` - Container definition
- `docker-compose.yml` - Multi-container definition for development
- `requirements.txt` - Python dependencies
- `run.sh` - Convenience script for local development

## Data Flow

1. **Session Creation**: Browser creates a session and gets a unique ID
2. **Connection**: Secondary device connects to session using URL or QR code
3. **File Selection**: Secondary device selects files to transfer
4. **File Upload**: Files are encoded as base64 and sent to the server
5. **File Download**: Primary device can download files from the session

## Application Limitations

- Files are stored in memory, not persisted to disk
- No authentication or security beyond random session IDs
- No automatic session cleanup (sessions exist until server restart)
- Base64 encoding increases file size during transfer