export default defineNuxtPlugin({
  name: "me",
  setup() {
    const me = ref();

    return {
      provide: {
        me,
      },
    };
  },
});
