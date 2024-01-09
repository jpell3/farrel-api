import HTTP from 'http';

const PORT = process.env.PORT || 3000;

// create timestamp object for logging
let timestamp = new Date().toLocaleTimeString();

export default async function createServer() {
  return new Promise((resolve, reject) => {
    const server = HTTP.createServer((req, res) => {
      res.writeHead(200, { "Content-Type" : 'text/html'})
      res.end("Welcome to the NodeJS server.");
    })
    
    server.listen(PORT, (err) => {
      let message;

      if(err) {
        message = 'failed to start'
        console.log(`${timestamp}  |  LOG:  Node server ${message} on port ${PORT}`);
        reject(err);
      } else {
        message = 'successfully started'
        console.log(`${timestamp}  |  LOG:  Node server ${message} on port ${PORT} -> http://localhost:${PORT}`);
        resolve();
      }
    });
  });
}