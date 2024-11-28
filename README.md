# Planner

Planner is designed to help users manage daily tasks, messages, and events effectively. It features:
- Real-time synchronization between users.
- User authentication and session management.
- Offline-first capability with data persistence.

The app is split into two main components:
- **Client**: A front-end built with React and Vite for fast builds.
- **Server**: A Node.js server managing WebSocket connections for real-time data sync.

## Technologies Used
- **Front-End**: React, Zustand, MUI, Vite, PWA
- **Back-End**: Node.js, WebSocket, SQLite, Automerge
- **Other Tools**: Docker, Docker Compose, bcrypt for password hashing, JSON Web Tokens for authentication

## Installation
To get started with the project locally:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/planner.git
   cd planner
   ```

2. **Install dependencies for both client and server**:
   ```bash
   cd client
   npm install
   cd ../server
   npm install
   ```

3. **Configure Environment Variables**: Create a `.env` file in both the `client` and `server` directories (see [Environment Variables](#environment-variables)).

4. **Run the server**:
   ```bash
   npm start
   ```

5. **Run the client**:
   ```bash
   npm run dev
   ```

## Usage
Once the server and client are running, navigate to `http://localhost:3000` to start using the application. Users can log in, manage tasks, view the calendar, and see real-time updates across connected clients.

## Environment Variables
To run this project, you need to add the following environment variables:

### Server `.env` file:
- `WEBSOCKET_PORT`: The port number for WebSocket connections.
- `JWT_SECRET`: A secret key for signing JWT tokens.
- `KILL_PORT_IF_USED`: Whether to kill a process using the WebSocket port (`true` or `false`).

### Client `.env` file:
- `VITE_SERVER_URL`: URL of the backend server.

## Docker Setup
This project is Dockerized for easy deployment. You can build and run both the server and client using Docker Compose.

1. **Build and run the containers**:
   ```bash
   docker compose up --build
   ```

2. **Access the application**:
    - Client: [http://localhost:3007](http://localhost:3007)
    - Server: WebSocket is running on `ws://localhost:1234`

## Server Commands
- Create User
  - `node ./commands/addUser.js user1 password123`

## License
Distributed under the MIT License. See `LICENSE` for more information.

