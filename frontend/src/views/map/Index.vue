<template>
  <div>
    <div id="map" class="w-screen h-screen"></div>
    <div
      v-if="loading"
      class="absolute inset-0 flex items-center justify-center"
    >
      <div>Loading map...</div>
    </div>
    <div v-if="error" class="absolute inset-0 flex items-center justify-center">
      <div>Error loading map: {{ error }}</div>
    </div>

    <div class="fixed bottom-0 left-2 w-fit flex gap-4">
      <Chat
        v-for="user in activeChats"
        :key="user.id"
        :messages="messages"
        :target="user"
        @close="closeChat"
        @messageSent="messageHandler"
      />
    </div>

    <div
      class="fixed top-2 left-2 w-64 flex gap-4 justify-between items-center bg-[var(--secondary-color)] text-[var(--primary-color)] rounded-lg p-4"
      v-if="cardVisible"
    >
      <div>
        <div class="font-bold">{{ label }}</div>
        <div class="text-sm text-gray-200">{{ distance }} KM away</div>
      </div>
      <button @click="startChat">
        <ChatIcon />
      </button>
    </div>

    <button
      @click="startCall"
      :disabled="disabledCall"
      class="fixed bottom-2 right-16 bg-[var(--secondary-color)] text-[var(--primary-color)] rounded-full p-4 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <PhoneIcon />
    </button>

    <div class="fixed bottom-2 right-48 flex gap-4">
      <button
        v-for="room in store.rooms"
        :key="room.id"
        @click="joinRoom(room)"
        :disabled="room.disabled"
        class="bg-[var(--secondary-color)] w-14 h-14 text-[var(--primary-color)] rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ room.name }}
      </button>
    </div>

    <div class="fixed bottom-48 right-8">
      <Call />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import Chat from "./components/Chat.vue";
import { useStore } from "../../store/store";
import lodash from "lodash";
import { Position } from "../../types/position";
import { Message } from "../../types/message";
import { socketEvents } from "../../services/socket";
import { User } from "../../types/user";
import { emitter } from "../../main";
import Call from "./components/Call.vue";
import PhoneIcon from "./components/icons/PhoneIcon.vue";
import ChatIcon from "./components/icons/ChatIcon.vue";
import { Room } from "../../types/room";
import Peer from "peerjs";

declare const google: any;

interface MessageData {
  content: string;
  from: string;
  to: string;
}

export default defineComponent({
  name: "Map",

  components: {
    Chat,
    Call,
    PhoneIcon,
    ChatIcon,
  },

  setup() {
    const store = useStore();
    const peer = new Peer(store?.id);

    return { store, peer };
  },

  data() {
    return {
      error: null as string | null,
      loading: false as boolean,

      label: null as string | null,
      distance: null as number | null,
      cardVisible: false as boolean,
      map: null as any,

      activeChats: [] as User[],
      messages: [] as Message[],
      maxChats: 3 as number,

      room: null as Room | null,
      disabledCall: false as boolean,
      maxRoomUsers: 2 as number,
    };
  },

  methods: {
    async joinRoom(room: Room) {
      if (room.users.length >= this.maxRoomUsers) {
        console.warn("Cannot join: Room is full");
        return;
      }

      const newUser = {
        id: this.store.id,
        name: this.store.name,
        position: this.store.position,
      };

      const existingRoom = this.store.rooms.find(
        (r: Room) => r.owner === newUser.id
      );
      if (existingRoom) {
        this.store.setRooms(
          this.store.rooms.filter((r: Room) => r.owner !== newUser.id)
        );
      }

      const targetRoom = this.store.rooms.find((r: Room) => r.id === room.id);
      if (!targetRoom) {
        console.error("Room not found");
        return;
      }

      targetRoom.users.push(newUser);
      targetRoom.disabled = targetRoom.users.length === 2;
      this.room = targetRoom;

      try {
        const stream = await this.getUserMedia();
        const call = this.peer.call(room.owner, stream);

        call.on("stream", (remoteStream: MediaStream) => {
          emitter.emit("remoteStream", remoteStream);
        });

        emitter.emit("call", stream);
        this.disabledCall = true;
      } catch (error) {
        console.error("Failed to start media stream:", error);
        targetRoom.users = targetRoom.users.filter(
          (u: User) => u.id !== newUser.id
        );
        this.room = null;
      }
    },

    async startCall() {
      try {
        const stream = await this.getUserMedia();

        const newRoom = {
          id: Date.now().toString(),
          name: this.store.name.slice(0, 1).toUpperCase(),
          owner: this.store.id,
          disabled: true,
          users: [
            {
              id: this.store.id,
              name: this.store.name,
              position: this.store.position,
            },
          ],
        };

        this.store.setRooms([...this.store.rooms, newRoom]);
        this.room = newRoom;
        this.disabledCall = true;

        socketEvents.sendRoom({
          ...newRoom,
          disabled: false,
        });

        emitter.emit("call", stream);

        this.peer.on("call", (call: any) => {
          call.answer(stream);
          call.on("stream", (remoteStream: MediaStream) => {
            emitter.emit("remoteStream", remoteStream);
          });
        });
      } catch (err) {
        console.error("Failed to start call:", err);
        this.room = null;
      }
    },

    endCall() {
      const existingRoom = this.store.rooms.find(
        (r: Room) => r.owner === this.room?.owner
      );
      if (existingRoom) {
        this.store.setRooms(
          this.store.rooms.filter((r: Room) => r.owner !== this.room?.owner)
        );
        this.room = null;
      }

      this.disabledCall = false;
    },

    getUserMedia() {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("getUserMedia not supported");
      }

      return navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
    },

    startChat() {
      if (!this.label) {
        return;
      }

      const targetUser = this.store.onlineUsers.find(
        (user: User) => user.name === this.label
      );
      const isUserAlreadyInChat = this.activeChats.some(
        (chat: User) => chat.id === targetUser.id
      );
      if (!targetUser || isUserAlreadyInChat) {
        return;
      }

      if (this.activeChats.length >= this.maxChats) {
        this.activeChats.shift();
      }

      this.activeChats.push(targetUser);
    },

    closeChat(user: User) {
      this.activeChats = this.activeChats.filter(
        (chat: User) => chat.id !== user.id
      );
    },

    messageHandler(message: Message) {
      this.messages.push(message);
    },

    receivedMessage(data: MessageData) {
      const isExistingChat = this.activeChats.some(
        (chat: User) => chat.id === data.from
      );
      const sender = this.store.onlineUsers.find(
        (user: User) => user.id === data.from
      );

      if (!sender) {
        console.warn("Message received from unknown sender:", data.from);
        return;
      }

      const newMessage = {
        id: this.messages.length + 1,
        content: data.content,
        from: data.from,
        senderId: data.from,
        receiverId: data.to,
        createdAt: new Date(),
      };

      if (!isExistingChat) {
        this.activeChats.push(sender);
      }

      this.messages.push(newMessage);

      new Audio("/new-message.mp3").play();
    },

    getCoords() {
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error("Geolocation is not supported by your browser"));
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            this.store.setPosition({
              lat: position.coords.latitude + Math.random() * 3,
              lng: position.coords.longitude + Math.random() * 3,
            });

            socketEvents.login({
              name: this.store.name,
              position: this.store.position,
            });

            resolve(this.store.position);
          },
          (error: GeolocationPositionError) => reject(error),
          {
            timeout: 5000,
            enableHighAccuracy: true,
          }
        );
      });
    },

    createMap(coords: Position) {
      try {
        return new google.maps.Map(document.getElementById("map"), {
          center: coords,
          zoom: 6,
          mapTypeControl: false,
          zoomControl: true,
          fullscreenControl: false,
        });
      } catch (error) {
        this.error = "Failed to initialize map";
      }
    },

    createMarker(position: Position, name: string) {
      const iconFormat = (name: string) =>
        `https://ui-avatars.com/api/?name=${name
          ?.split(" ")
          .join("+")}&background=random&size=40&rounded=true`;

      let marker = new google.maps.Marker({
        position,
        map: this.map,
        animation: google.maps.Animation.DROP,
        label: {
          text: name,
          fontSize: "18px",
          fontWeight: "bold",
          className: "marker-label",
        },
        icon: iconFormat(name),
      });

      marker.addListener("click", () => {
        if (
          !lodash.isEqual(marker.getPosition().toJSON(), this.store.position)
        ) {
          const distance =
            google.maps.geometry.spherical.computeDistanceBetween(
              marker.getPosition(),
              this.store.position
            ) / 1000;

          this.cardVisible = true;
          this.distance = distance.toFixed(2);
          this.label = name;
        }
      });

      emitter.on("userLeft", (user: string) => {
        if (marker.getLabel().text === user) {
          marker.setMap(null);
          if (this.label == user) {
            this.cardVisible = false;
            this.label = null;
            this.distance = null;
          }
        }
      });
    },

    async initializeMap() {
      this.loading = true;
      try {
        await this.getCoords();
        this.map = this.createMap(this.store.position);
        this.createMarker(this.store.position, this.store.name);
      } catch (error) {
        this.error = error.message ?? "Unknown error";
      } finally {
        this.loading = false;
      }
    },

    onlineUsersHandler(users: User[]) {
      let usersEdited = users.filter((user) => user.id !== this.store.id);

      usersEdited.length > 0 &&
        usersEdited.forEach((user) => {
          this.createMarker(user.position, user.name);
        });
    },
  },

  mounted() {
    this.initializeMap();

    socketEvents.userLeft();
    socketEvents.receiveMessage();

    emitter.on("onlineUsers", (users: User[]) => {
      this.onlineUsersHandler(users);
    });
    emitter.on("userJoined", (user: User) => {
      this.createMarker(user.position, user.name);
    });
    emitter.on("userLeft", (user: string) => {
      const userToClose = this.activeChats.find(
        (chat: User) => chat.name === user
      );

      userToClose && this.closeChat(userToClose);
    });
    emitter.on("message", (data: MessageData) => {
      this.receivedMessage(data);
    });
    emitter.on("endCall", () => {
      this.endCall();
    });
  },

  beforeUnmount() {
    socketEvents.disconnect();

    emitter.off("onlineUsers");
    emitter.off("userJoined");
    emitter.off("userLeft");
    emitter.off("message");
    emitter.off("endCall");
  },
});
</script>

<style>
.marker-label {
  position: relative;
  top: 30px;
  padding: 2px 5px;
  border-radius: 4px;
  background-color: var(--secondary-color);
  color: var(--primary-color) !important;
  white-space: nowrap;
}
</style>
