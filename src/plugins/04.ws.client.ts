export default defineNuxtPlugin({
  name: "ws",
  dependsOn: ["me", "users", "chats", "rooms"],
  setup() {
    const { $me, $rooms, $chats } = useNuxtApp();
    const ws = ref(new WebSocket("ws://localhost:3001"));

    function onOpen() {
      console.log("[ws]: Connected");

      ws.value.send(
        JSON.stringify({
          type: "me",
        })
      );

      ws.value.send(
        JSON.stringify({
          type: "room:all",
        })
      );

      ws.value.send(
        JSON.stringify({
          type: "chat:all",
        })
      );
    }

    function onError(error) {
      console.error(`[ws]: ${error}`);

      setTimeout(() => {
        if (!ws.value.OPEN) {
          ws.value = new WebSocket("ws://localhost:3001");
          ws.value.onopen = onOpen;
          ws.value.onerror = onError;
          ws.value.onclose = onClose;
          ws.value.onmessage = onMessage;
        }
      }, 1000);
    }

    function onClose(event) {
      console.error(`[ws]: Closed with code ${event.code}`);

      setTimeout(() => {
        ws.value = new WebSocket("ws://localhost:3001");
        ws.value.onopen = onOpen;
        ws.value.onerror = onError;
        ws.value.onclose = onClose;
        ws.value.onmessage = onMessage;
      }, 1000);
    }

    function onMessage(event) {
      try {
        const message = JSON.parse(event.data);

        console.log("[ws]", message);

        if (message.type === "me") {
          $me.value = message.data;
        } else if (message.type === "room:all") {
          $rooms.value = message.data;
        } else if (message.type === "chat:all") {
          $chats.value = message.data;
        }
      } catch (error) {
        console.error(`[ws]: ${error}`);
      }
    }

    ws.value.onopen = onOpen;
    ws.value.onerror = onError;
    ws.value.onclose = onClose;
    ws.value.onmessage = onMessage;

    return {
      provide: {
        ws,
      },
    };
  },
});
