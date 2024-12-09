import { User } from "@/types/user";
import { io } from "socket.io-client";
import { useStore } from "@/store/store";
import { emitter } from "@/main";
import { Position } from "@/types/position";
import { Room } from "@/types/room";

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

        store.setOnlineUsers([]);
        store.setRooms([]);
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
            console.log("onlineUsers", store.onlineUsers);
            emitter.emit("onlineUsers", data);
        });
    },

    sendMessage: (message: string, to: string) => {
        socket.emit("sendMessage", {
            content: message,
            to,
            from: store.id,
        });
    },

    receiveMessage: () => {
        console.log("receiveMessage");
        socket.on("message", (data) => {
            emitter.emit("message", data);
        });
    },

    removeReceiveMessage: () => {
        socket.off("message");
    },

    removeUserJoined: () => {
        socket.off("userJoined");
    },

    sendRoom: (room: Room) => {
        socket.emit("sendRoom", room);
    },

    receiveRoom: () => {
        socket.on("sendRoom", (data: Room) => {
            const existingRoom = store.rooms.find((r: Room) => r.id === data.id);

            if (existingRoom) {
                store.setRooms(
                    store.rooms.map((r: Room) =>
                        r.id === data.id ? data : r
                    )
                );
            } else {
                store.setRooms([...store.rooms, data]);
            }
        });
    },

    receiveRooms: () => {
        socket.on("rooms", (data: Room[]) => {
            console.log(data);

            store.setRooms(data);
        });
    },

    removeRoom: (data: { id: string }) => {
        socket.emit("removeRoom", data);
    },

    removeReceiveRoom: () => {
        socket.on("removeRoom", (data: { id: string }) => {
            store.setRooms(store.rooms.filter((room: Room) => room.id !== data.id));
        });
    },
};

