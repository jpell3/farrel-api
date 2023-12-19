const http = require('http');
const client = require("./client.js");
const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type" : 'text/html'})
    res.end("Welcome to the NodeJS server.");
});

server.listen(PORT, (error) => {
    !error ? message = 'successfully started' : message = 'failed to start'
    console.log(`Node server ${message} on port ${PORT}`);
    !error ? console.log(`http://localhost:${PORT}`) : '';
});