import { clearInterval } from "timers";
import { AttributeIds } from "node-opcua";

// create timestamp object for logging
export let timestamp = new Date().toLocaleTimeString();

// update timestamp
setInterval(() => {
  timestamp = new Date().toLocaleTimeString();
}, 1000);

// read tag array from db.json
export async function readTags(_fs, path) {
  console.log(`${timestamp}  |  LOG:  Fetching data from tag file...`);
  return new Promise((resolve, reject) => {
    _fs.readFile(path, 'utf-8', (err, data) => {
      if(err) { reject(err) }
      resolve(formatTags(JSON.parse(data)));
    });
  });
};

// create connection to OPCUA server
export async function connectToServer(_client, _sURI) {
  console.log(`${timestamp}  |  LOG:  Attempting to establish server connection to ${_sURI}...`);
  return new Promise((resolve, reject) => {
    let message;
    _client.connect(_sURI, (err) => {
      !err ? message = `successfully connected` : message = `failed to connect`;
      console.log(`${timestamp}  |  LOG:  Client ${message} to ${_sURI}`);
      !err ? resolve(_client) : reject(err);
    });
  });
}

// open OPCUA server session
export async function startSession(_client) {
  console.log(`${timestamp}  |  LOG:  Attempting to start server session...`);
  return new Promise((resolve, reject) => {
    _client.createSession((err, _session) => {
      if(err) { reject(err) }
      console.log(`${timestamp}  |  LOG:  Server session successfully created`);
      resolve(_session);
    });
  });
}

// read data
export async function readData(_session, dataArr, timeInterval, readEnable) {
  console.log(`${timestamp}  |  LOG:  Reading data at ${timeInterval/1000}s intervals...`);
  return new Promise((resolve, reject) => {
    let readData = setInterval(() => {
      dataArr.forEach((tag) => {
        _session.read({ nodeId: `NodeId ns=3;s=${tag.name}`, attributeId: AttributeIds.Value }, (err, dataValue) => {
          if(err || !readEnable) {
            clearInterval(readData);
            reject(err);
          } else {
            tag.value = dataValue.value.value;
            console.log(`${timestamp}  |  LOG:  Advised item [${tag.name}] of value [${tag.value}]`);
          }
        })
      });
    }, timeInterval);
    resolve(readData);
  });
}

// close connection
export async function closeConnection(_client , _session, err) {
  if (err) {
    console.log(`${timestamp}  |  LOG:  Closing connection due to error:  `, err);
  } else {
    console.log(`${timestamp}  |  LOG:  Closing connection normally...`);
  }
  _session.close((err) => { err ? console.log(err) : '' });
  _client.disconnect((err) => { err ? console.log(err) : '' });
}

// convert PLC tag format to OPCUA tag format, ignores system tags
// i.e   'MIX_MTR'.DRIVE.STA.RUN => "MIX_MTR"."DRIVE"."STA"."RUN"
// i.e   OperatingMode => OperatingMode
function formatTags(tagArr) {
	const regex1 = /\'/g;
	const regex2 = /\./g;
	let tempString;
	tagArr.forEach(item => {
			tempString = item.name.replace(regex1, '').replace(regex2, "\".\"");
			item.systemTag ? item.name = tempString : item.name = `\"${tempString}\"`;
	});
	return tagArr;
}