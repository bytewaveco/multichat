<template>
  <div class="fixed top-0 bottom-0 left-0 flex flex-col w-[256px]">
    <u-button
      to="/chat/new"
      color="gray"
      class="w-full h-10 flex justify-center rounded-none rounded-br-md"
    >
      New Chat
    </u-button>
    <div class="h-full flex flex-col ml-1 pt-4 pb-8 gap-y-1 overflow-y-scroll">
      <u-button
        v-for="room in $rooms"
        :to="`/chat/${room.id}`"
        variant="outline"
        color="gray"
        :class="{
          'w-full': true,
          'p-2': true,
          grid: true,
          'gap-y-1': true,
          'border-1': true,
          'border-solid': true,
          'border-gray-100': true,
          rounded: true,
          'hover:bg-gray-100': true,
          'dark:hover:bg-gray-800': true,
          'bg-gray-200': route.params.roomId === room.id,
          'dark:bg-gray-800': route.params.roomId === room.id,
          'box-border': true,
          'transition-colors': true,
          'cursor-pointer': true,
          'user-select-none': true,
        }"
      >
        <span class="truncate whitespace-nowrap">{{ room.name }}</span>
        <span class="text-xs truncate w-[calc(256px_-_1.25rem)]">
          {{ latest[room.id] ?? "✨ No chat history." }}
        </span>
      </u-button>
    </div>
  </div>
  <div
    class="fixed top-0 right-0 h-10 px-4 rounded-bl-md flex gap-x-4 box-border items-center bg-gray-200/60 dark:bg-gray-800/60  z-10"
  >
    <u-button
      :padded="false"
      color="gray"
      variant="link"
      to="/me"
      icon="i-heroicons-user"
    />
    <u-button
      :padded="false"
      color="gray"
      variant="link"
      to="/"
      icon="i-heroicons-x-circle"
    />
    <u-button
      :padded="false"
      color="gray"
      variant="link"
      icon="i-heroicons-trash"
      @click="clearCache"
    />
  </div>
  <div
    v-if="room"
    class="fixed top-0 left-[272px] h-10 px-4 rounded-b-md flex gap-x-4 box-border items-center bg-gray-200/60 dark:bg-gray-800/60 z-10"
  >
    <u-icon
      name="i-heroicons-signal"
      :class="{
        'text-green-500 animate-pulse': $ws.readyState === 1,
        'text-red-500': $ws.readyState !== 1,
      }"
    />
    <h6 class="text-xs truncate whitespace-nowrap max-w-fit min-w-0">{{ room.name }}</h6>
    <h6 class="text-xs text-gray-500 tabular-nums">
      {{ room.address }}:{{ room.port }}
    </h6>
  </div>
  <div
    class="fixed top-0 bottom-0 left-[256px] right-0 pl-2 ml-2 flex flex-col box-border border-l-[1px] border-l-solid border-l-gray-900 z-0"
  >
    <slot />
  </div>
</template>

<script lang="ts" setup>
const { $ws, $rooms, $me, $chats } = useNuxtApp();

const route = useRoute();
const room = computed(() =>
  $rooms.value.find((r) => r.id === route.params.roomId)
);
const latest = computed(() =>
  $chats.value.reduce((acc, curr) => {
    if (!(curr.room_id in acc)) {
      acc[curr.room_id] = curr.message;
    }

    return acc;
  }, {})
);

function clearCache() {
  $me.value = undefined;
  $rooms.value = [];
  $chats.value = [];

  $ws.value.send(
    JSON.stringify({
      type: "cache:clear",
    })
  );
}
</script>
