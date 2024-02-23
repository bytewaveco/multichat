export default defineNuxtPlugin({
  name: "rooms",
  dependsOn: ["users"],
  setup() {
    const rooms = ref([]);

    return {
      provide: {
        rooms,
      },
    };
  },
});
