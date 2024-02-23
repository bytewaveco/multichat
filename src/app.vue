<template>
  <nuxt-layout>
    <nuxt-page />
  </nuxt-layout>
</template>

<script lang="ts" setup>
const { $me } = useNuxtApp();

watch($me, async (updatedValue) => {
  if (updatedValue === null) {
    await navigateTo("/me");
  } else {
    await navigateTo("/");
  }
});
</script>
