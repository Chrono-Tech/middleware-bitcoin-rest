const config = require('./config'),
  express = require('express'),
  //routes = require('./routes'),
  http = require('http'),
  cors = require('cors'),
  bunyan = require('bunyan'),
  log = bunyan.createLogger({name: 'core.rest'}),
  mongoose = require('mongoose'),
  RED = require('node-red'),
  path = require('path'),
  NodeRedStorageModel = require('./models/nodeRedStorageModel'),
  NodeRedUserModel = require('./models/nodeRedUserModel'),
  bodyParser = require('body-parser');

/**
 * @module entry point
 * @description expose an express web server for txs
 * and addresses manipulation
 */

mongoose.Promise = Promise;
mongoose.connect(config.mongo.uri, {useMongoClient: true});
mongoose.red = mongoose.createConnection(config.nodered.mongo.uri);

mongoose.red.model(NodeRedStorageModel.collection.collectionName, NodeRedStorageModel.schema);
mongoose.red.model(NodeRedUserModel.collection.collectionName, NodeRedUserModel.schema);

mongoose.connection.on('disconnected', function () {
  log.error('mongo disconnected!');
  process.exit(0);
});

require('require-all')({
  dirname: path.join(__dirname, '/models'),
  filter: /(.+Model)\.js$/
});

let app = express();
let httpServer = http.createServer(app);
app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

RED.init(httpServer, config.nodered);
app.use(config.nodered.httpAdminRoot, RED.httpAdmin);
app.use(config.nodered.httpNodeRoot, RED.httpNode);

httpServer.listen(config.rest.port);
RED.start();



