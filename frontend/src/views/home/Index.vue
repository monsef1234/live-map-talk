<template>
  <div class="min-h-screen content-center">
    <div
      class="bg-[var(--secondary-color)] min-w-[200px] max-w-[500px] h-[300px] content-center p-5 rounded-lg shadow-lg mx-5 sm:mx-auto"
    >
      <h1 class="text-[var(--primary-color)] text-4xl font-bold text-center">
        Live Map Talk
      </h1>

      <form class="flex flex-col gap-5 mt-10" @submit.prevent="handleSubmit">
        <div>
          <input
            type="text"
            placeholder="Enter your name"
            class="p-2 rounded-md w-full outline-none"
            v-model="name"
          />
          <small
            class="text-red-400 text-xs"
            v-if="(!name && error) || (name && error)"
            >{{ error }}</small
          >
        </div>

        <button
          type="submit"
          class="bg-[var(--primary-color)] p-2 rounded-md active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
          :disabled="!name"
        >
          Join
        </button>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { socketEvents } from "../../services/socket";

import { useStore } from "../../store/store";
import { User } from "../../types/user";

export default defineComponent({
  name: "Home",

  setup() {
    const store = useStore();
    return { store };
  },

  data() {
    return {
      name: "",
      error: "",
    };
  },

  methods: {
    handleSubmit(e: Event) {
      e.preventDefault();
      if (!this.name) {
        this.error = "Name is required";
        return;
      }

      const existingUser = this.store.onlineUsers.find(
        (user: User) => user.name === this.name
      );

      if (existingUser) {
        this.error = "Name already taken";
      } else {
        this.store.setName(this.name);
        this.$router.replace("/map");
      }
    },
  },

  mounted() {
    socketEvents.connect();
    socketEvents.sendOnlineUsers();
    socketEvents.userJoined();
    socketEvents.receiveRooms();
    socketEvents.receiveRoom();
    socketEvents.removeReceiveRoom();
  },
});
</script>
