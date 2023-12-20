# Farrel API Prototype

Our customers are growingly more interested in their data. As it stands, methods of extracting data from Wonderware InTouch is limited and their data storage is proprietary. The goal of this prototype is to extract live data from the PLC into an API using JSON so that a customer can fetch the data and process as they please. This will enable more flexability in terms of the solutions Farrel can offer in the future.

## Development Milestones

- [x] Locate and implement the Node.js OPC UA package
- [x] Establish an OPC UA connection to a Siemens PLC
- [x] Read live data from the OPC UA server
- [ ] ...future milestones to be added as the project progresses

## Configured Scripts

To run both the HTTP server and OPC UA client, run the "npm run dev" command.
To run just the OPC UA client, run the "npm run client" command.
