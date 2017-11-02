const config = require('./config'),
  express = require('express'),
  routes = require('./routes'),
  cors = require('cors'),
  bunyan = require('bunyan'),
  log = bunyan.createLogger({name: 'core.rest'}),
  mongoose = require('mongoose'),
  bodyParser = require('body-parser');

/**
 * @module entry point
 * @description expose an express web server for txs
 * and addresses manipulation
 */

mongoose.Promise = Promise;
mongoose.connect(config.mongo.uri, {useMongoClient: true});

mongoose.connection.on('disconnected', function () {
  log.error('mongo disconnected!');
  process.exit(0);
});

let app = express();

app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

routes(app);

app.listen(config.rest.port || 8081);
