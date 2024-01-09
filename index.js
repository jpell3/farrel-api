import createServer from './http-server.js';
import { OPCUAClient } from "node-opcua";
import {timestamp, readTags, connectToServer, startSession, readData, closeConnection} from './opc-ua-client.js';
import { progStatus } from './status.js';
import fs from 'fs';

// define and initialize variables
export const serverURI = 'opc.tcp://10.0.0.10:4840'
let tagArray, connection, session;
let readEnable = true;

// create client
export let client = OPCUAClient.create({
  endpointMustExist: false,
});

client.on("connection_failed", () => {
	console.log(`${timestamp}  |  EVENT:  on (connection_failed)`);
});

client.on("reconnection_attempt_has_failed", () => {
	console.log(`${timestamp}  |  EVENT:  on (reconnection_attempt_has_failed)`);
});

client.on("timed_out_request", () => {
	console.log(`${timestamp}  |  EVENT:  on (timed_out_request)`);
});

client.on("close", () => {
	console.log(`${timestamp}  |  EVENT:  on (close)`);
});

client.on("abort", () => {
	console.log(`${timestamp}  |  EVENT:  on (abort)`);
});

main();

// main function - execute all async functions in series 
async function main() {
  await createServer()
  tagArray = await readTags(fs, `./public/db.json`)
  connection = await connectToServer(client, serverURI)
  session = await startSession(client)
  readData(session, tagArray, 1000, readEnable)
//   await closeConnection(client, session, '');
}