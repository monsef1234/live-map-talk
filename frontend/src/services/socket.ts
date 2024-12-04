import { User } from "@/types/user";
import { io } from "socket.io-client";
import { useStore } from "@/store/store";
import { emitter } from "@/main";
import { Position } from "@/types/position";

const store = useStore();
export const socket = io("http://localhost:3003");

export const socketEvents = {
    connect: () => {
        socket.on("connect", () => {
            console.log("connected to socket", socket.id);
            store.setId(socket.id ?? "");
        });
    },

    disconnect: () => {
        socket.disconnect();
    },

    login: (data: { name: string; position: Position }) => {
        socket.emit("login", { ...data });
        console.log("login", data);

    },

    userJoined: () => {
        socket.on("userJoined", (data: User) => {
            const filteredUsers = store.onlineUsers.filter(user => user.id !== data.id);
            store.setOnlineUsers([...filteredUsers, data]);
            emitter.emit("userJoined", data);
        });
    },

    userLeft: () => {
        socket.on("userLeft", (data: string) => {
            console.log("userLeft", data);

            store.setOnlineUsers(
                store.onlineUsers.filter((user) => user.name !== data)
            );
            console.log(store.onlineUsers);

            emitter.emit("userLeft", data);
        });
    },

    sendOnlineUsers: () => {
        socket.on("onlineUsers", (data: User[]) => {
            store.setOnlineUsers(data);
            emitter.emit("onlineUsers", data);
        });
    }
};
