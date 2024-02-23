export default defineNuxtPlugin({
  name: "chats",
  setup() {
    const chats = ref([]);

    return {
      provide: {
        chats,
      },
    };
  },
});
