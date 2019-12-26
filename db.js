const mongoose = require('mongoose');

let dbconf;
// is the environment variable, NODE_ENV, set to PRODUCTION?
// Command line interface: NODE_ENV=PRODUCTION node app.js
if (process.env.NODE_ENV === 'PRODUCTION') {
  // console.log('if for dbconf');
  // if we're in PRODUCTION mode, then read the configration from a file
  // and use blocking file io to do this...
  const fs = require('fs');
  const path = require('path');
  const fn = path.join(__dirname, 'config.json');
  const data = fs.readFileSync(fn);
  // our configuration file will be in json
  // so parse it and set the conenction string appropriately!
  const conf = JSON.parse(data);
  dbconf = conf.dbconf;
} else {
  // if we're not in PRODUCTION mode, then use
  // dbconf = 'mongodb://js8547:x22rYmTx@class-mongodb.cims.nyu.edu/js8547';
  dbconf = 'mongodb://localhost/final_project';
  // console.log('else for dbconf');
}
console.log('connecting to mongoose', dbconf);

// dbconf = 'mongodb://localhost/final_project';
// console.log('connecting to mongoose', dbconf);

mongoose.connect(dbconf, {useNewUrlParser: true, useUnifiedTopology: true})
    .then((resolved) => console.log('db connected!'))
    .catch((err) => console.log('error connecting to the database', err));
