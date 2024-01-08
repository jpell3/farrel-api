import { clearInterval } from "timers";
import { OPCUAClient, AttributeIds } from "node-opcua";

// define and initialize variables
const serverURL = 'opc.tcp://10.0.0.10:4840';

// create client
const client = OPCUAClient.create({
		endpointMustExist: false
});

// handle backoff
client.on("backoff", (retry, delay) => {
	if(retry + 1 >= 3) {
		// if connection fails three times, exit with error
		console.log(`Failed to connect to ${serverURL}. Check the connection and try again.`);
		process.exit();
	}

	// attempt connection multiple times, contine with error
	console.log(`Unable to connect to ${serverURL}...next attempt (#${retry + 1}) in ${delay/1000} seconds...`);
});

export async function readTags(_fs, path) {
  console.log(`LOG:  Fetching data from tag file...`);
  return new Promise((resolve, reject) => {
    _fs.readFile(path, 'utf-8', (err, data) => {
      !err ? resolve(data) : reject(err);
    });
  });
};

export async function connectToServer(_client, _sURI) {
  console.log(`LOG:  Attempting to establish server connection to OPCUA server...`);
  return new Promise((resolve, reject) => {
    const connection = _client.connect(_sURI, (err) => {
      !err ? message = `successfully connected` : message = `failed to connect`;
      console.log(`LOG:  Client ${message} to ${_sURI}`);
      !err ? resolve(connection) : reject(err);
    });
  });
}

export async function startSession(_client) {
  console.log(`LOG:   Starting server session...`);
  return new Promise((resolve, reject) => {
    _client.createSession((err, _session) => {
      if(err) { reject(err) }
      console.log(`LOG:  Server session successfully created...`);
      resolve(_session);
    });
  });
}

export async function readData(_session, dataArr, timeInterval) {
  console.log(`LOG:  Reading data at ${timeInterval/1000}s intervals...`);
  return new Promise((resolve, reject) => {
    let readData = setInterval(() => {
      dataArr.forEach((tag) => {
        _session.read({ nodeId: `NodeId ns=3;s=${tag.name}`, attributeId: AttributeIds.Value }, (err, dataValue) => {
          if(err) {
            clearInterval(readData);
            reject(err);
          } else {
            tag.value = dataValue.value.value;
            console.log(`LOG:  Advised ${tag.name} of value ${tag.value}`);
          }
        })
      });
    }, timeInterval);
    resolve(readData);
  });
}

export async function closeConnection(_client , _session, _readData, err) {
  if (err) {
    console.log(`LOG:  Closing connection due to error...`, err);
  } else {
    console.log(`LOG:  Closing connection normally...`);
  }
  clearInterval(_readData);
  _session.close((err) => { err ? console.log(err) : '' });
  _client.disconnect((err) => { err ? console.log(err) : '' });
}

// convert PLC tag format to OPCUA tag format
// i.e   MIX_MTR.DRIVE.STA.RUN => "MIX_MTR"."DRIVE"."STA"."RUN"
export function formatTags(tagArr) {
	const regex1 = /\'/g;
	const regex2 = /\./g;
	let tempString;
	tagArr.forEach(item => {
			tempString = item.name.replace(regex1, '').replace(regex2, "\".\"");
			item.name = `\"${tempString}\"`;
	});
	return tagArr;
}