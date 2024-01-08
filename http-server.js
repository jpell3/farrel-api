import HTTP from 'http';

const PORT = process.env.PORT || 3000;

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
        console.log(`\nNode server ${message} on port ${PORT}`);
        reject(err);
      } else {
        message = 'successfully started'
        console.log(`\nNode server ${message} on port ${PORT}`);
        console.log(`http://localhost:${PORT}\n`)
        resolve();
      }
    });
  });
}