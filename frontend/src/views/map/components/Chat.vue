<template>
  <div
    class="flex flex-col gap-2 overflow-hidden bg-white rounded-md w-full max-w-[400px] h-[400px]"
  >
    <div
      class="flex items-center justify-between bg-[var(--secondary-color)] text-[var(--primary-color)] p-2"
    >
      <div>John Doe</div>
      <button class="w-5 h-5">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          class="fill-[var(--primary-color)]"
        >
          <title>Close</title>
          <path
            d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
          />
        </svg>
      </button>
    </div>
    <div class="flex-1 flex flex-col gap-2 p-2 overflow-y-auto">
      <div
        class="self-end rounded-md bg-[var(--primary-color)] text-[var(--secondary-color)] p-2 font-medium"
      >
        Hello
      </div>
      <div
        class="self-start rounded-md bg-[var(--primary-color)] text-[var(--secondary-color)] p-2 font-medium"
      >
        Hello
      </div>
    </div>
    <div
      class="flex items-center gap-2 border-t border-[var(--secondary-color)] shadow-lg"
    >
      <input
        type="text"
        placeholder="Type a message"
        class="flex-1 p-2 outline-none"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "Chat",
});
</script>