export default defineNuxtPlugin({
  name: "users",
  setup() {
    const users = ref([]);

    return {
      provide: {
        users,
      },
    };
  },
});
