# Automerge Starter Kit

A simple starter kit for building real-time collaborative applications using [Automerge](https://www.automerge.com/), a CRDT (Conflict-free Replicated Data Type) library, with a Node.js server and a Vite-powered React client. This application allows multiple clients to exchange and edit messages in real-time, with persistent storage using SQLite.

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
    - [Server Setup](#server-setup)
    - [Client Setup](#client-setup)
- [Running the Application](#running-the-application)
- [Usage](#usage)
- [Technologies Used](#technologies-used)
- [Additional Improvements](#additional-improvements)
- [License](#license)

## Features

- **Real-time Collaboration:** Multiple clients can add and edit messages simultaneously, with changes synchronized in real-time.
- **Persistent Storage:** Messages are stored in a SQLite database, ensuring data is retained even after server restarts.
- **Message Editing:** Users can edit their messages, and changes are propagated to all connected clients.
- **Conflict Resolution:** Utilizes Automerge's CRDT capabilities to handle concurrent modifications gracefully.

## Project Structure

- **server/**: Contains the Node.js WebSocket server that manages the Automerge document and handles client connections.
- **client/**: Contains the React application built with Vite, allowing users to interact with the collaborative chat interface.
- **data.db**: SQLite database file storing the serialized Automerge document.

## Prerequisites

- [Node.js](https://nodejs.org/en/download/) (v14 or later)
- [npm](https://www.npmjs.com/get-npm) (comes with Node.js)

## Installation

### Server Setup

1. **Navigate to the Server Directory:**

   ```bash
   cd automerge-starter-kit/server
   ```

2. **Initialize the Server and Install Dependencies:**

   ```bash
   npm install
   ```

   **Dependencies:**
    - `@automerge/automerge`: CRDT library for collaborative data structures.
    - `better-sqlite3`: SQLite client for Node.js.
    - `ws`: WebSocket library for Node.js.

### Client Setup

1. **Navigate to the Client Directory:**

   ```bash
   cd ../client
   ```

2. **Initialize the Client and Install Dependencies:**

   ```bash
   npm install
   ```

   **Dependencies:**
    - `@automerge/automerge`: CRDT library for collaborative data structures.
    - `react`: Frontend library for building user interfaces.
    - `react-dom`: React package for working with the DOM.
    - `uuid`: Library for generating unique identifiers.

   **Dev Dependencies:**
    - `vite`: Frontend build tool.
    - `@vitejs/plugin-react`: Vite plugin for React.
    - `vite-plugin-wasm`: Vite plugin for handling WebAssembly modules.

## Running the Application

### Start the Server

1. **Navigate to the Server Directory:**

   ```bash
   cd automerge-starter-kit/server
   ```

2. **Start the Server:**

   ```bash
   npm start
   ```

   The server will start and listen on `ws://localhost:8080`. It will create a `data.db` file in the server directory to store the Automerge document.

### Start the Client

1. **Open a New Terminal and Navigate to the Client Directory:**

   ```bash
   cd automerge-starter-kit/client
   ```

2. **Start the Client Development Server:**

   ```bash
   npm run dev
   ```

   The client application will be available at `http://localhost:5173` (default port; may vary).

## Usage

1. **Open the Client Application:**

   Open `http://localhost:5173` in your web browser. To test real-time collaboration, open the same URL in multiple browser tabs or windows.

2. **Adding Messages:**

    - Enter a message in the input field.
    - Click the "Send" button.
    - The message will appear in the message list across all connected clients.

3. **Editing Messages:**

    - Click the "Edit" button next to a message.
    - Modify the message text in the input field that appears.
    - Click "Save" to apply changes or "Cancel" to discard.
    - Edited messages will update in real-time across all clients.

4. **Persistent Storage:**

    - All messages are stored in the `data.db` SQLite database.
    - Restarting the server (`npm start`) will retain all messages, which will be reloaded upon client reconnection.

## Technologies Used

- **[Automerge](https://www.automerge.com/):** A JavaScript library for building collaborative applications using CRDTs.
- **[Node.js](https://nodejs.org/):** JavaScript runtime for building the server.
- **[WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API):** Protocol for real-time communication between server and clients.
- **[SQLite](https://www.sqlite.org/index.html):** Lightweight, file-based SQL database for persistent storage.
- **[React](https://reactjs.org/):** JavaScript library for building user interfaces.
- **[Vite](https://vitejs.dev/):** Next-generation frontend build tool for faster development.
- **[UUID](https://www.npmjs.com/package/uuid):** Library for generating unique identifiers.

## Additional Improvements

- **Authentication & Authorization:**
    - Implement user authentication to identify and manage users.
    - Restrict editing capabilities to message owners.

- **Enhanced UI/UX:**
    - Improve styling with CSS frameworks like Tailwind CSS or Material-UI.
    - Add features like timestamps, user avatars, and message notifications.

- **Message Deletion:**
    - Allow users to delete their messages, with appropriate synchronization across clients.

- **Optimized Data Handling:**
    - Implement pagination or lazy loading for large message lists.
    - Optimize Automerge document handling for better performance with extensive data.

- **Error Handling & Resilience:**
    - Enhance error handling on both client and server.
    - Implement WebSocket reconnection strategies for improved reliability.

- **Security Enhancements:**
    - Secure WebSocket connections using HTTPS and WSS.
    - Validate and sanitize user inputs to prevent potential attacks.

## License

This project is open-source and available under the [MIT License](LICENSE).

---

Feel free to customize and extend this starter kit to fit your specific application needs. Happy coding!
