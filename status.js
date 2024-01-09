import { client, serverURI } from './index.js' 

// create timestamp object for logging
let timestamp = new Date().toLocaleTimeString();

// define variables
let programActive, clientActive;

// create status object
export const progStatus = {
    program: {
      startTime: 0,
      endTime: Date.now(),
      uptime: {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        toString: '00:00:00:00 (DD:HH:MM:SS)'
      }

    },
    client: {
        startTime: 1704344715746,
        endTime: 1704822334996,
        uptime: {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          toString: '00:00:00:00 (DD:HH:MM:SS)'
        }
    }
}

// start program timers
programStarted();

function calculateUptime(subObject) {
  const uptime = subObject.uptime;
  let duration = subObject.endTime - subObject.startTime;

  // calculate number of days
  uptime.days = Math.floor(duration / 86400000);
  duration %= 86400000;
  uptime.hours = Math.floor(duration / 3600000);
  duration %= 3600000;
  uptime.minutes = Math.floor(duration / 60000);
  duration %= 60000;
  uptime.seconds = Math.floor(duration / 1000);
  duration %= 1000;

  // reconstruct toString
  uptime.toString = '';
  uptime.toString += `${String(uptime.days).padStart(2, '0')}:`;
  uptime.toString += `${String(uptime.hours).padStart(2, '0')}:`;
  uptime.toString += `${String(uptime.minutes).padStart(2, '0')}:`;
  uptime.toString += `${String(uptime.seconds).padStart(2, '0')}`;
  uptime.toString += ` (DD:HH:MM:SS)`;
}

// wait 250ms for client to be initialized in controller class before accessing
setTimeout(() => {

    client.on("connected", () => {
      clientStarted();
      progStatus.client.startTime = Date.now();
      console.log(`${timestamp}  |  EVENT:  Connected to client.`);
    });

    client.on("backoff", (count, delay) => {
      console.log(`${timestamp}  |  LOG:  Unable to connect to ${serverURI}...next attempt (#${count + 1}) in ${Math.floor(delay/1000)} seconds...`);
      if(count + 1 >= 3) {
        console.log(`${timestamp}  |  LOG:  Failed to connect to ${serverURI}. Check the connection and try again.`);
        console.log(`${timestamp}  |  EVENT:  Program terminated. Total Uptime: ${progStatus.program.uptime.toString}`);
        process.exit();
      }
    });

    client.on("connection_lost", () => {
      clearInterval(clientActive);
      progStatus.client.endTime = Date.now();
      console.log(`${timestamp}  |  EVENT:  Connection lost to client. Total Uptime: ${progStatus.client.uptime.toString}`);
    });

    client.on("start_reconnection", () => {
      console.log(`${timestamp}  |  EVENT:  Attempting to reconnect...`);
    });

    client.on("connection_reestablished", () => {
      clientStarted();
      progStatus.client.startTime = Date.now();
      console.log(`${timestamp}  |  EVENT:  Connection Reestablished to client`);
    });
    
}, 250);

// update timestamp
setInterval(() => {
  timestamp = new Date().toLocaleTimeString();
}, 1000);

function programStarted() {
  progStatus.program.startTime = Date.now();
  programActive = setInterval(() => {
    progStatus.program.endTime = Date.now();
    calculateUptime(progStatus.program);
  }, 1000);
}

function clientStarted() {
  progStatus.client.startTime = Date.now();
  clientActive = setInterval(() => {
    progStatus.client.endTime = Date.now();
    calculateUptime(progStatus.client);
  }, 1000);
}