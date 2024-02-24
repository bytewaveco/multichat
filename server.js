// const dgram = require("dgram");
// const server = dgram.createSocket("udp4");

// server.on("message", (msg, rinfo) => {
//   const message = JSON.parse(msg.toString());
//   console.log(`Received: ${msg.toString()}`);
//   // Send ACK back
//   const ack = JSON.stringify({ seq: message.seq });
//   server.send(ack, 0, ack.length, rinfo.port, rinfo.address, (err) => {
//     if (err) console.error(err);
//     else console.log(`ACK sent for: ${message.seq}`);
//   });
// });

// server.bind({
//   address: "0.0.0.0",
//   port: 4321,
//   exclusive: false,
// });

// server.on("listening", () => {
//   server.setBroadcast(true);
//   server.setMulticastTTL(128);
//   server.addMembership("234.1.1.1", "0.0.0.0");
// });

const dgram = require('dgram');
const server = dgram.createSocket({ type: 'udp4', reuseAddr: true });

const multicastAddress = '234.1.1.1';
const port = 4321;

server.bind(port, function() {
  server.addMembership(multicastAddress);
  console.log(`Server listening for multicast messages on ${multicastAddress}:${port}`);
});

server.on('message', function(message, remote) {
  console.log(`Received multicast message from ${remote.address}:${remote.port}: ${message}`);
});
