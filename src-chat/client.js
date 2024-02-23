const dgram = require("node:dgram");
const { Buffer } = require("node:buffer");
const { ArgumentParser } = require("argparse");
const { version } = require("../package.json");
const parser = new ArgumentParser({
  description: "Send a message using multichat.",
});

parser.add_argument("-v", "--version", { action: "version", version });
parser.add_argument("-m", "--message", { help: "the message string to send" });
parser.add_argument("-a", "--address", {
  help: "the multicast address to send to",
});
parser.add_argument("-p", "--port", { help: "the multicast port to send to" });

const args = parser.parse_args();
const client = dgram.createSocket("udp4");

client.send(
  Buffer.from(args.message),
  parseInt(args.port),
  args.address,
  (err) => {
    if (err) {
      console.error(`Error sending message: ${err}`);
    }

    client.close();
  }
);
