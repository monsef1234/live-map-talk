# Map Talk Chat

A real-time location-based chat application that allows users to communicate with others on an interactive map interface. Users can see each other's locations, start chats, engage in conversations, and make video calls based on their geographical proximity.

## Features

- 🗺️ Interactive map interface showing user locations
- 💬 Real-time chat functionality
- 🎥 Peer-to-peer video calling
- 📍 Location-based user discovery
**Note:** This application is not responsive. 

## Tech Stack

### Frontend
- Vue.js 3 with TypeScript
- Tailwind CSS for styling
- [GoMaps API](https://app.gomaps.pro) for map integration
- WebSocket client for real-time communication
- PeerJS for peer-to-peer video calls

### Backend
- Node.js with TypeScript
- WebSocket server for real-time messaging

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to the URL shown in the terminal (typically http://localhost:5173)

## Environment Variables

### Frontend (.env)
```
VITE_API_KEY=your_gomaps_api_key
```

## Usage

1. Allow location access when prompted by your browser
2. View other users on the ma p
3. Click on a user's marker to start a chat
4. Exchange messages in real-time
5. Open room for video calls 

## Contributing

1. Fork the repository
2. Create a new branch for your feature
3. Commit your changes
4. Push to your branch
5. Create a Pull Request