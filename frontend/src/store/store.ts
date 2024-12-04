import { User } from "@/types/user";
import { defineStore } from "pinia";
import { Position } from "@/types/position";


export const useStore = defineStore("map", {
    state: () => ({
        position: null as Position | null,
        name: "" as string,
        id: "" as string,
        onlineUsers: [] as User[],
    }),

    actions: {
        setPosition(position: Position) {
            this.position = position;
        },


        setId(id: string) {
            this.id = id;
        },

        setName(name: string) {
            this.name = name
        },

        setOnlineUsers(users: User[]) {
            this.onlineUsers = users;
        }
    },
});
