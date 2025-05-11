# QuickShare

A lightweight web application for creating temporary file sharing sessions between devices.

## Overview

QuickShare allows you to quickly transfer files between devices without requiring accounts or permanent storage. Create a session on one device, connect from another device, and transfer files seamlessly.

## Features

- **Temporary Sessions**: Create ephemeral file sharing sessions with unique IDs
- **No Registration**: No accounts or logins required
- **Real-time Status**: See connection status in real-time
- **Multiple File Support**: Transfer multiple files in a single session
- **Simple Interface**: Clean, intuitive user experience

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

## Usage

### Running the Server

```
python app.py
```

The application will be available at http://localhost:5001

### Creating a Session

1. Visit the homepage
2. Click "Create Session"
3. Share the generated URL with the device you want to connect

### Connecting to a Session

1. Open the shared URL on your other device
2. The devices will automatically connect
3. Select and upload files from your device

### Downloading Files

1. Once files are uploaded, they'll appear in the session
2. Click on any file to download it

## Technical Details

- Built with Flask
- Uses UUID for secure session generation
- Files are stored in memory (not persisted to disk)
- Base64 encoding for file transfer

## License

MIT
