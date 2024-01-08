import createServer from './http-server.js';
import {readTags, connectToServer, startSession, readData, closeConnection, formatTags} from './opc-ua-client.js'
import fs from 'fs'
// const client = require("./opc-ua-client.js");

// 
let results;

// create HTTP server
await createServer()
.then(() => {
  readTags(fs, `./public/db.json`)
  .then((values) => {
      results = values;
    }
  )
  .then(() => {
    setTimeout(() => {
      console.log(results);
    }, 5000);
  })
})
.catch((err) => {
  console.log(err);
})