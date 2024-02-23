<template>
  <div class="grid w-full h-full items-center justify-center">
    <h1 v-if="$rooms.length">No chat selected.</h1>
    <div v-else class="grid justify-items-center gap-y-4">
      <h1>No chats available.</h1>
      <u-button to="/chat/new" class="w-fit">New Chat</u-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  layout: "chat",
});

const { $rooms } = useNuxtApp();
</script>
