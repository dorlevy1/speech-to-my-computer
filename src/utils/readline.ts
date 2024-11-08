import readline from "readline";

const inter =readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
readline.emitKeypressEvents(process.stdin);

export default inter