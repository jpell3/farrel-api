const { OPCUAClient, AttributeIds, resolveNodeId, TimestampsToReturn } = require("node-opcua");
const async = require("async");
const fs = require('fs');

// define and initialize variables
const serverURL = 'opc.tcp://10.0.0.10:4840';
let the_session, the_subscription, tagData, error;

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


// run async functions in sequence
async.series(
	[
		// step 1 : collect data from file
		function (callback) {
			fs.readFile(`./public/db.json`, "utf-8", (error, data) => {
				if(!error) {
					tagData = JSON.parse(data);
					tagData = formatTags(tagData);
				} else {
					console.log(error);
				}
			});
			callback();
		},

		// step 2 : connect to server
		function (callback) {
			console.log(`\nAttempting to connect to OPCUA server...`);
			client.connect(serverURL, (error) => {
				let message;
				error ? message = `failed to connect` : message = `successfully connected`
				console.log(`Client ${message} to ${serverURL}`);
				callback(error);
			});
		},

		// step 3 : open a server session
		function (callback) {
			console.log(`\nAttempting to create session...`);
			client.createSession((error, session) => {
				if (error) { return callback(error) }
				the_session = session;
				console.log(`Session successfully created...`);
				callback();
			});
		},

		// step 4 : read data continuously
		function (callback) {
			let readData = setInterval(() => {
				tagData.forEach((tag) => {
					the_session.read({ nodeId: `NodeId ns=3;s=${tag.name}`, attributeId: AttributeIds.Value }, (err, dataValue) => {
						if (!err) {
							// console.log(`${tag.description} = ${dataValue.value.value}`);
							tag.value = dataValue.value.value;
						} else {
							// console.log(err);
							clearInterval(readData);
						}
						error = err;
					});
				});
				// console.log(tagData);

			}, 1000);
			callback(error);
		},

		// step 5: install a subscription and install a monitored item for 10 seconds
		function (callback) {
			const subscriptionOptions = {
				// maxNotificationsPerPublish: 1000,
				// publishingEnabled: true,
				// requestedLifetimeCount: 100,
				// requestedMaxKeepAliveCount: 20,
				// requestedPublishingInterval: 1000
			};
			the_session.createSubscription2(subscriptionOptions, (err, subscription) => {
				if (err) { return callback(err); }

				the_subscription = subscription;

				the_subscription
					.on("started", () => {
						console.log("subscription started for 2 seconds - subscriptionId=", the_subscription.subscriptionId);
					})
					.on("keepalive", () => {
						console.log("Subscription -> keepalive");
					})
					.on("terminated", () => {
						console.log("Subscription Terminated");
					});
				callback();
			});
		},

		// install monitored item
		function (callback) {
			const itemToMonitor = {
				nodeId: resolveNodeId('ns=3;s="SLOW_PULSE"'),
				attributeId: AttributeIds.Value
			};
			const monitoringParamaters = {
				samplingInterval: 100,
				discardOldest: true,
				queueSize: 10
			};

			the_subscription.monitor(itemToMonitor, monitoringParamaters, TimestampsToReturn.Both, (err, monitoredItem) => {
				monitoredItem.on("changed", (dataValue) => {
					console.log("monitored item changed:  % free mem = ", dataValue.value.value);
				});
				callback();
			});
			console.log("-------------------------------------");
		},

		// wait a little bit : 5 minutes
		function (callback) {
			setTimeout(() => callback(), 300 * 1000);
		},

		// terminate session
		function (callback) {
			the_subscription.terminate(callback);
		},

		// close session
		function (callback) {
			the_session.close(function (err) {
				if (err) {
					console.log("Failed to close session...");
				}
				callback();
			});
		}
	],

	function (err) {
		if (err) {
			console.log(" failure ", err);
		} else {
			console.log("done!");
		}
		client.disconnect(function () {});
	}
);

// convert PLC tag format to OPCUA tag format
// i.e   MIX_MTR.DRIVE.STA.RUN => "MIX_MTR"."DRIVE"."STA"."RUN"
function formatTags(tagArr) {
	const regex1 = /\'/g;
	const regex2 = /\./g;
	let tempString;
	tagArr.forEach(item => {
			tempString = item.name.replace(regex1, '').replace(regex2, "\".\"");
			item.name = `\"${tempString}\"`;
	});
	return tagArr;
}

// attempting to make this data readable in http-server.js as proof of concept
let me = [{
	"name" : "justin",
	"age" : 27,
}]

// attempting the same as above, thought maybe I was writing before the variables were defined
// setTimeout(() => {
// 		console.log(tagData);
// 		module.exports = {me};
// }, 2000);

