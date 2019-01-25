const express = require('express');
const app = express();
const fs = require('fs');
const port = 8080;
const path = require('path');

const proxy = require('express-http-proxy');

const bodyParser = require('body-parser');

// Type 2: Persistent datastore with manual loading
const Datastore = require('nedb');
const db = new Datastore({ filename: '/home/emh/capitalist-pig-lover.db' });

const pwd = __dirname;

db.loadDatabase(function (err) {
  // Removing all documents with the 'match-all' query
  /*
  db.remove({}, { multi: true }, function (err, numRemoved) {

  });
  */

  app.use(bodyParser.urlencoded());

  app.use(bodyParser.json());

  app.get('/', (request, response) => {
    response.redirect('/index');
  }); 

  // TODO: remove for security
  app.get('/msgs', (request, response) => {
    db.find({}).sort({ timestamp: 1 }).exec(function (err, docs) {
      response.send(JSON.stringify(docs));
    });
  });
  
  app.post('/postclick', (request, response) => {
    const body = request.body;
    const tag = body.tag;
    const id = body.msgid;

    console.log(id, tag);

    const upd = {
      $inc: {}
    };
    upd["$inc"]["tags." + tag] = 1;
    db.update({ _id: id }, upd, function(err, numReplaced) {
      //console.log("numReplaced", numReplaced);
      response.send("OK");
    });
  });

  app.post('/postmsg', (request, response) => {
    const body = request.body;
    const value = body.value;
    
    if (value === undefined || value === '') {
      response.send("Error: empty message");
      return;
    }

    const doc = {
      user: 'anon',
      msg: value,
      timestamp: new Date().getTime(),
      choices: {}
    };

    db.insert(doc, function(err, newDoc) {
      console.log(newDoc);
      response.send(JSON.stringify(newDoc));
    });

    //response.send("OK");
  });
  
  app.use('/', proxy('localhost:8082'));

  app.listen(port, (err) => {
    if (err) {
      return console.log('something bad happened', err);
    }

    console.log(`server is listening on ${port}`);


  });

});
