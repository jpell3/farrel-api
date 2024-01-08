import createServer from './http-server.js';
import { OPCUAClient } from "node-opcua";
import {readTags, connectToServer, startSession, readData, closeConnection} from './opc-ua-client.js'
import fs from 'fs'

// define and initialize variables
const serverURI = 'opc.tcp://10.0.0.10:4840'
let tagArray, connection, session;

// create client
let client = OPCUAClient.create({
  endpointMustExist: false
});

// handle backoff
client.on("backoff", (retry, delay) => {
	if(retry + 1 >= 3) {
		// if connection fails three times, exit with error
		console.log(`Failed to connect to ${serverURI}. Check the connection and try again.`);
		process.exit();
	}

	// attempt connection multiple times, contine with error
	console.log(`Unable to connect to ${serverURI}...next attempt (#${retry + 1}) in ${delay/1000} seconds...`);
});

main();

// main function - execute all async functions in series 
async function main() {
  await createServer()
  tagArray = await readTags(fs, `./public/db.json`)
  connection = await connectToServer(client, serverURI)
  session = await startSession(client)
  readData(session, tagArray, 1000)
}

