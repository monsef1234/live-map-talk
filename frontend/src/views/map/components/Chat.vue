<template>
  <div
    class="flex flex-col gap-2 overflow-hidden bg-white rounded-md w-full max-w-[400px] h-[400px]"
  >
    <div
      class="flex items-center justify-between bg-[var(--secondary-color)] text-[var(--primary-color)] p-2"
    >
      <div>{{ target.name }}</div>
      <button class="w-5 h-5" @click="$emit('close', target)">
        <CloseIcon />
      </button>
    </div>
    <div
      class="flex-1 flex flex-col gap-2 p-2 overflow-y-auto chat-container"
      ref="chatContainer"
    >
      <div
        v-for="message in localMessages"
        :key="message.id"
        class="rounded-md p-2 font-medium break-words max-w-64"
        :class="
          message.senderId === target.id
            ? 'self-start bg-[var(--primary-color)] text-[var(--secondary-color)]'
            : 'self-end bg-[var(--secondary-color)] text-[var(--primary-color)]'
        "
      >
        {{ message.content }}
      </div>
    </div>
    <div
      class="flex items-center gap-2 border-t border-[var(--secondary-color)] shadow-lg"
    >
      <input
        type="text"
        placeholder="Type a message"
        class="flex-1 p-2 outline-none"
        v-model="newMessage"
        @keyup.enter="sendMessage"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { socketEvents } from "../../../services/socket";
import { User } from "../../../types/user";
import { useStore } from "../../../store/store";
import { Message } from "../../../types/message";
import CloseIcon from "./icons/CloseIcon.vue";

export default defineComponent({
  name: "Chat",

  props: {
    target: {
      type: Object as PropType<User>,
      required: true,
    },
    messages: {
      type: Array as PropType<Message[]>,
      required: true,
    },
  },

  emits: ["close", "messageSent"],

  components: {
    CloseIcon,
  },

  setup() {
    const store = useStore();

    return { store };
  },

  data() {
    return {
      localMessages: [...this.messages] as Message[],
      newMessage: "",
    };
  },

  methods: {
    addEmoji(emoji: string) {
      this.newMessage += emoji;
    },

    sendMessage() {
      if (!this.newMessage.trim()) return;

      socketEvents.sendMessage(this.newMessage, this.target.id);

      this.localMessages.push({
        id: this.localMessages.length + 1,
        content: this.newMessage,
        from: this.target.name,
        senderId: this.store.id,
        receiverId: this.target.id,
        createdAt: new Date(),
      });

      this.$emit(
        "messageSent",
        this.localMessages[this.localMessages.length - 1]
      );

      this.newMessage = "";
    },

    scrollToBottom() {
      const observer = new MutationObserver(() => {
        (this.$refs.chatContainer as HTMLElement).scrollTop = (
          this.$refs.chatContainer as HTMLElement
        ).scrollHeight;
      });

      observer.observe(this.$refs.chatContainer as HTMLElement, {
        childList: true,
        subtree: true,
      });
    },
  },

  watch: {
    messages: {
      handler(newMessages) {
        if (newMessages.length > this.localMessages.length) {
          const lastMessages = newMessages.slice(this.localMessages.length);
          this.localMessages.push(...lastMessages);
        }
      },
      deep: true,
    },
  },

  mounted() {
    this.scrollToBottom();
  },
});
</script>

<style scoped>
.chat-container::-webkit-scrollbar {
  width: 8px;
  background-color: var(--primary-color);
}

.chat-container::-webkit-scrollbar-thumb {
  background-color: var(--secondary-color);
  border-radius: 8px;
}
</style>
