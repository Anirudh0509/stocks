'use strict';
import express  from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import responseTime from 'response-time';
import cluster from 'cluster';

// Count the machine's CPUs
const numCPUs = require('os').cpus().length;
const port = process.env.PORT || 3000;

let router = require('./routes/portfolio');
let app = express();

//connecting to mongodb 

mongoose.connect('mongodb://localhost/smallcase');
mongoose.Promise = global.Promise;

app.use(bodyParser.urlencoded({ extended : true }));
app.use(bodyParser.json());
app.use(responseTime());
app.use('/', router);

//CLUSTER MODULE

// FOR MASTER PROCESS
if (cluster.isMaster) {

  // Create a worker for each CPU
  for (var i = 0; i < numCPUs; i++) cluster.fork();

  // Listen for dying workers, Replace the dead worker
  cluster.on('exit', worker => {
      console.log('Worker %d died', worker.id);
      cluster.fork();
  });

// FOR WORKER PROCESS
} else {

  app.listen(port, () => {
    console.log(`Server starting @ port ${port}`);
  });
  console.log('Worker %d running!', cluster.worker.id);

}

