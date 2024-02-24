const dgram = require("dgram");
const client = dgram.createSocket("udp4");
let messageQueue = [];
let currentSequenceNumber = 0;

function sendMessage(message, address, port) {
  const messageWithSeq = JSON.stringify({
    seq: currentSequenceNumber,
    ...message,
  });
  client.send(
    messageWithSeq,
    0,
    messageWithSeq.length,
    port,
    address,
    (err) => {
      if (err) {
        console.error(err);
      } else {
        console.log(`Message sent: ${messageWithSeq}`);
        messageQueue.push({
          seq: currentSequenceNumber,
          message: messageWithSeq,
        });
        currentSequenceNumber++;
      }
    }
  );
}

// Logic to handle ACKs and resend missing messages
client.on("message", (msg) => {
  const ack = JSON.parse(msg.toString());
  console.log(`ACK received for: ${ack.seq}`);
  messageQueue = messageQueue.filter((m) => m.seq !== ack.seq);
});

// Example usage
sendMessage({ data: "Hello, World" }, "234.1.1.1", 4321);
