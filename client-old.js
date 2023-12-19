const {OPCUAClient, AttributeIds} = require('node-opcua');

const serverURL = 'opc.tcp://10.0.0.10:4840';
let sessionID;
const options = {
    endpointMustExist: false,
}

// create client
const client = OPCUAClient.create(options);

// handle backoff
client.on('backoff', (retry, delay) => {
    console.log(`Attempting connection to ${serverURL}...next ${retry} attempt in ${delay/1000} seconds...`);
});

// call main function
main(client);

// async sequence calls
async function main(client) {
    await connect(client)
     .then (openSession(client))
     .then (readData(sessionID))
}

// async function to create connection to server
async function connect(client) {
    console.log(`Attempting to connect to OPCUA server...`);
    const connection = await client.connect(serverURL, (error) => {
        let message;
        error ? message = `failed to connect` : message = `successfully connected`
        console.log(`Client ${message} to ${serverURL}`);
    })
}

 // async function to open a session within the server
 async function openSession(client) {
     console.log(`Attempting to create session...`);
     const session = await client.createSession2((err, session) => {
         if(err) {
             console.log(err);
             return;
         };
         sessionID = session;
         console.log(`Session successfully created...`);
     });    
 }

// async function to read data from the session
 async function readData(sessionID) {
    console.log(`Attempting to read data...`);
    setInterval(() => {
        sessionID.read({
            nodeId: "NodeId ns=3;s=PLC",
            attributeTd: AttributeIds.Value
        }, (error, dataValue) => {
            if(!error) {
                console.log(`value: ${dataValue.value.value}`);
            }
        });
    }, 1000);
}