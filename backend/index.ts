import express, { Response } from "express";
import { Server, type Socket } from "socket.io";
import { createServer } from "http";
import { User } from "./types/user";
import { Position } from "./types/position";
import { Room } from "./types/room";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

let onlineUsers: User[] = [];
let rooms: Room[] = [];

app.get("/", (res: Response) => {
    res.send("Hello World");
});

io.on("connection", (socket: Socket) => {
    console.log("A user connected", socket.id);

    socket.onAny((eventName, ...args) => {
        console.log("Received event:", eventName, args);
    });

    socket.on("login", (data) => {
        loginHandler(socket, data);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        disconnectOnlineUsersHandler(socket);
        rooms = rooms.filter(room => room.owner !== socket.id);
    });

    socket.on("sendMessage", (data) => {
        messageHandler(socket, data);
    });

    socket.on("sendRoom", (data) => {
        sendRoomHandler(socket, data);
    });

    socket.emit("onlineUsers", onlineUsers);
    socket.emit("rooms", rooms);


});

httpServer.listen(3003, () => {
    console.log("Server is running on port 3003");
});

// Handlers
const disconnectOnlineUsersHandler = (socket: Socket) => {
    const user = onlineUsers.find(user => user.id === socket.id);
    onlineUsers = onlineUsers.filter(user => user.id !== socket.id);

    socket.broadcast.emit("userLeft", user?.name);
};

const loginHandler = (socket: Socket, data: { name: string; position: Position }) => {

    const newUser = {
        name: data.name,
        position: data.position,
        id: socket.id
    };

    onlineUsers.push(newUser);

    socket.broadcast.emit("userJoined", newUser);

    socket.emit("onlineUsers", onlineUsers);
};

const messageHandler = (socket: Socket, data: { content: string; to: string; from: string }) => {
    socket.to(data.to).emit("message", data);
};

const sendRoomHandler = (socket: Socket, data: Room) => {
    rooms.push(data);
    socket.broadcast.emit("sendRoom", data);
};
