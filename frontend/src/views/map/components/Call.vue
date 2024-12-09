<template>
  <div v-show="localStream">
    <div class="flex flex-col gap-2 video-container">
      <video
        class="video-stream w-64 h-48 bg-black"
        v-show="remoteVideo"
        :srcObject="remoteVideo"
        autoplay
      ></video>
      <video
        class="video-stream w-64 h-48 bg-black"
        v-show="localVideo"
        :srcObject="localVideo"
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
import { defineComponent } from "vue";

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
    return {
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
      localStream: null as MediaStream | null,
      localVideo: null as HTMLVideoElement | null,
      remoteVideo: null as HTMLVideoElement | null,
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
      this.localStream?.getTracks().forEach((track: MediaStreamTrack) => {
        track.stop();
      });

      this.localStream = null;
      this.remoteVideo = null;

      emitter.emit("endCall");
    },
  },

  mounted() {
    emitter.on("call", (stream: MediaStream) => {
      this.localStream = stream;
      this.localVideo = stream;
    });
    emitter.on("remoteStream", (stream: MediaStream) => {
      this.remoteVideo = stream;
    });
    emitter.on("removeRemoteStream", () => {
      this.remoteVideo = null;
    });
    emitter.on("removeCall", () => {
      this.localStream?.getTracks().forEach((track: MediaStreamTrack) => {
        track.stop();
      });

      this.localStream = null;
      this.localVideo = null;
      this.remoteVideo = null;
    });
  },

  beforeUnmount() {
    this.localStream?.getTracks().forEach((track: MediaStreamTrack) => {
      track.stop();
    });

    emitter.off("call");
    emitter.off("remoteStream");
    emitter.off("removeRemoteStream");
  },
});
</script>

<style>
</style>