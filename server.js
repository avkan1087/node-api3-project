//bring in dependencies
const express = require('express');
const helmet = require('helmet');


//Bring in endpoints
const userRouter = require('./users/userRouter');
const postRouter = require('./posts/postRouter');

//start server
const server = express();

// server.get('/', (req, res) => {
//   res.send(`<h2>Let's write some middleware!</h2>`);
// });

server.use('/api/user', userRouter);
server.use('/api/posts', postRouter);

//middleware

server.use(helmet());
server.use(express.json());
server.use(logger);

//custom middleware

function logger(req, res, next) {
  console.log(`${req.method} to ${req.originalUrl} at ${new Date().toISOString()}`);
  next();
}


module.exports = server;