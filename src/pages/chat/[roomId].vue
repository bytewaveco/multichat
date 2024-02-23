<template>
  <div class="grid grid-rows-[1fr_max-content] h-full">
    <div
      ref="chatsElement"
      class="flex flex-col-reverse flex-1 overflow-hidden overflow-y-scroll px-2 pb-10 gap-y-2 box-border"
    >
      <div
        v-for="chat in chats"
        :key="chat.id"
        :class="{
          grid: true,
          'w-fit': true,
          'h-fit': true,
          'px-2': true,
          'py-1': true,
          'rounded-md': true,
          'box-border': true,
          'self-end rounded-br-none bg-gray-200 dark:bg-gray-800': chat.user_id === $me?.id,
          'rounded-bl-none bg-gray-700': chat.user_id !== $me?.id,
        }"
      >
        <p
          :class="{
            'w-full': true,
            'whitespace-pre-line': true,
            'text-right': chat.user_id === $me?.id,
          }"
        >
          {{ chat.message }}
        </p>
        <span
          class="text-xs text-gray-500 tabular-nums justify-self-end whitespace-nowrap"
        >
          {{ chat.created_at }}
        </span>
      </div>
      <div class="grid w-full items-center justify-center h-fit pt-10">
        <span class="text-xs text-gray-500">End of chat history.</span>
      </div>
    </div>
    <u-textarea
      variant="outline"
      color="gray"
      :rows="8"
      :ui="{
        strategy: 'override',
        rounded: 'rounded-md rounded-b-none rounded-r-none',
      }"
      v-model="state.message"
      placeholder="Say something..."
      @keydown.meta.enter="onSubmit"
    />
  </div>
</template>

<script lang="ts" setup>
import { object, string } from "yup";

definePageMeta({
  layout: "chat",
});

const chatsElement = ref<HTMLElement | null>(null);
const route = useRoute();
const { $me, $ws, $rooms, $chats } = useNuxtApp();
const schema = object({
  message: string().required("Required"),
});
const state = reactive({
  message: "",
});
const room = computed(() =>
  $rooms.value.find((room) => room.id === route.params.roomId)
);
const chats = computed(() =>
  $chats.value.filter((chat) => chat.room_id === route.params.roomId)
);
const isValid = computed(() => schema.isValidSync(state));

async function onSubmit() {
  if (!isValid.value) return;

  const timestamp = new Date().toISOString();

  $ws.value.send(
    JSON.stringify({
      type: "chat",
      ...state,
      user_id: $me.value?.id,
      address: room.value?.address,
      port: room.value?.port,
      created_at: timestamp,
      updated_at: timestamp,
    })
  );

  state.message = "";
}

watch(
  chats,
  () => {
    setTimeout(() => {
      if (
        chatsElement.value &&
        typeof chatsElement.value.scrollHeight === "number" &&
        typeof chatsElement.value?.scrollTop === "number" &&
        chatsElement.value.scrollHeight - chatsElement.value.scrollTop < 650
      ) {
        chatsElement.value?.scrollTo({
          top: chatsElement.value.scrollHeight,
          behavior: "smooth",
        });
      }
    });
  },
  { immediate: true, deep: true }
);

onMounted(() => {
  chatsElement.value?.scrollTo({
    top: chatsElement.value.scrollHeight,
  });
});
</script>
