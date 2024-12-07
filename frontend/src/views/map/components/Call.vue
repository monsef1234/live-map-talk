<template>
  <div v-show="localStream">
    <div class="flex flex-col gap-2">
      <!-- <video class="video-stream w-64 h-48 bg-black" ref="remoteVideo"></video> -->
      <video
        class="video-stream w-64 h-48 bg-black"
        ref="localVideo"
        autoplay
        muted
      ></video>
    </div>
    <div class="flex gap-4 justify-center items-center mt-2">
      <button
        @click="toggleMicrophone"
        class="bg-[var(--secondary-color)] text-[var(--primary-color)] rounded-full p-4"
      >
        <component :is="!microphone ? MicrophoneOffIcon : MicrophoneIcon" />
      </button>
      <button
        @click="toggleCamera"
        class="bg-[var(--secondary-color)] text-[var(--primary-color)] rounded-full p-4"
      >
        <component :is="!camera ? CameraOffIcon : CameraIcon" />
      </button>
      <button
        class="bg-[var(--secondary-color)] text-[var(--primary-color)] rounded-full p-4"
        @click="endCall"
      >
        <PhoneOffIcon />
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

import MicrophoneIcon from "./icons/MicrophoneIcon.vue";
import CameraIcon from "./icons/CameraIcon.vue";
import MicrophoneOffIcon from "./icons/MicrophoneOffIcon.vue";
import CameraOffIcon from "./icons/CameraOffIcon.vue";
import PhoneOffIcon from "./icons/PhoneOffIcon.vue";
import { emitter } from "../../../main";
export default defineComponent({
  name: "Call",

  components: {
    PhoneOffIcon,
  },

  setup() {
    const localVideo = ref<HTMLVideoElement | null>(null);
    const remoteVideo = ref<HTMLVideoElement | null>(null);
    const localStream = ref<MediaStream | null>(null);

    return {
      localVideo,
      remoteVideo,
      localStream,
      MicrophoneIcon,
      CameraIcon,
      MicrophoneOffIcon,
      CameraOffIcon,
    };
  },

  data() {
    return {
      camera: false,
      microphone: false,
    };
  },

  methods: {
    toggleCamera() {
      const videoTrack = this.localStream?.getVideoTracks()[0];

      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        this.camera = !this.camera;
      }
    },

    toggleMicrophone() {
      const audioTrack = this.localStream?.getAudioTracks()[0];

      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        this.microphone = !this.microphone;
      }
    },

    endCall() {
      this.localStream?.getTracks().forEach((track) => {
        track.stop();
      });

      this.localStream = null;
      this.localVideo.srcObject = null;

      emitter.emit("endCall");
    },
  },

  mounted() {
    emitter.on("call", (stream: MediaStream) => {
      this.localStream = stream;
      this.localVideo.srcObject = stream;
    });
    emitter.on("remoteStream", (stream: MediaStream) => {
      console.log("remoteStream", stream);

      this.remoteVideo.srcObject = stream;
    });
  },

  beforeUnmount() {
    emitter.off("call");
    emitter.off("remoteStream");
  },
});
</script>

<style>
</style>