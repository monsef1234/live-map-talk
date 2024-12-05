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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          class="w-8 h-8 fill-[var(--primary-color)]"
        >
          <title>chat-processing</title>
          <path
            d="M12,3C17.5,3 22,6.58 22,11C22,15.42 17.5,19 12,19C10.76,19 9.57,18.82 8.47,18.5C5.55,21 2,21 2,21C4.33,18.67 4.7,17.1 4.75,16.5C3.05,15.07 2,13.13 2,11C2,6.58 6.5,3 12,3M17,12V10H15V12H17M13,12V10H11V12H13M9,12V10H7V12H9Z"
          />
        </svg>
      </button>
    </div>

    <button
      class="fixed bottom-2 right-16 bg-[var(--secondary-color)] text-[var(--primary-color)] rounded-full p-4"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        class="w-8 h-8 fill-[var(--primary-color)]"
      >
        <title>phone</title>
        <path
          d="M6.62,10.79C8.06,13.62 10.38,15.94 13.21,17.38L15.41,15.18C15.69,14.9 16.08,14.82 16.43,14.93C17.55,15.3 18.75,15.5 20,15.5A1,1 0 0,1 21,16.5V20A1,1 0 0,1 20,21A17,17 0 0,1 3,4A1,1 0 0,1 4,3H7.5A1,1 0 0,1 8.5,4C8.5,5.25 8.7,6.45 9.07,7.57C9.18,7.92 9.1,8.31 8.82,8.59L6.62,10.79Z"
        />
      </svg>
    </button>
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
  },

  setup() {
    const store = useStore();

    return { store };
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
    };
  },

  methods: {
    startChat() {
      if (this.label) {
        const user = this.store.onlineUsers.find(
          (user: User) => user.name === this.label
        );
        if (!this.activeChats.some((chat: User) => chat.id === user.id)) {
          if (this.activeChats.length >= this.maxChats) {
            this.activeChats.shift();
          } else {
            this.activeChats.push(user);
          }
        }
      }
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
          (error) => reject(error),
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

      console.log("userToClose", userToClose);
      userToClose && this.closeChat(userToClose);
    });

    emitter.on("message", (data: MessageData) => {
      this.receivedMessage(data);
    });
  },

  beforeUnmount() {
    socketEvents.disconnect();
    emitter.off("onlineUsers");
    emitter.off("userJoined");
    emitter.off("userLeft");
    emitter.off("message");
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