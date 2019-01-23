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
  // Callback is optional
  // Now commands will be executed

  //app.use(express.static('public'));
  
  app.use(bodyParser.urlencoded());

  app.use(bodyParser.json());

  app.get('/', (request, response) => {
    /*
      const data = fs.readFileSync(path.join(pwd, "index.html"), 'utf8');
      response.send(data);
    */
    // response.send('Hello from Express!<input type="text"></input>')
    
    response.redirect('/index');
  }); 

  // TODO: remove for security
  app.get('/docs', (request, response) => {
    db.find({}, function (err, docs) {
      response.send(JSON.stringify(docs));
    });
  });

  app.post('/testinput', (request, response) => {
    const doc = request.body;

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
