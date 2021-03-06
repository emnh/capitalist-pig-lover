const express = require('express');
const session = require('express-session');
const app = express();
const fs = require('fs');
const port = 8080;
const path = require('path');

const proxy = require('express-http-proxy');

const bodyParser = require('body-parser');

// Type 2: Persistent datastore with manual loading
const Datastore = require('nedb');
// TODO: get homedir from node
const db = new Datastore({ filename: '/home/emh/capitalist-pig-lover.db' });

const pwd = __dirname;

// TODO: get homedir from node
const sessionSecret = fs.readFileSync('/home/emh/capitalist-pig-lover.pwd', 'utf8');

const NedbStore = require('nedb-session-store')(session);

db.loadDatabase(function (err) {
  // Removing all documents with the 'match-all' query
  /*
  db.remove({}, { multi: true }, function (err, numRemoved) {

  });
  */

  app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
    store: new NedbStore({
      filename: '/home/emh/capitalist-pig-lover.session'
    })
  }));

  app.use(function (req, res, next) {
    if (!req.session.user) {
      db.update(
        { doc: 'users' },
        { $inc: { userCount: 1 } },
        {
          upsert: true,
          returnUpdatedDocs: true
        },
        function(err, numReplaced, upsert) {
          console.log("upsert", upsert);
          const user = 'anon' + upsert.userCount;
          const doc = {
            user: user,
            created: new Date().getTime(),
          };
          db.insert(doc, function(err, newDoc) {
            console.log(newDoc);
            req.session.user = user;
            next();
          });
        });
    } else {
      next();
    }
  });

  app.use(bodyParser.urlencoded());

  app.use(bodyParser.json());

  app.get('/', (request, response) => {
    response.redirect('/index');
  }); 

  app.get('/msgs', (request, response) => {
    db.find({ doc: 'msg' }).sort({ timestamp: 1 }).exec(function (err, docs) {
      response.send(JSON.stringify(docs));
    });
  });
  
  app.get('/username', (request, response) => {
    response.send(request.session.user);
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
      doc: 'msg',
      user: request.session.user,
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
