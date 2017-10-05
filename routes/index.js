const messages = require('../factories/messages/genericMessageFactory'),
  express = require('express'),
  services = require('../services');

module.exports = (app) => {

  let routerAddr = express.Router();
  let routerTx = express.Router();

  app.get('/', (req, res) => {
    res.send(messages.success);
  });

  routerAddr.post('/', services.address.registerAddrService);

  routerAddr.delete('/', services.address.deregisterAddrService);

  routerAddr.get('/:addr/balance', services.address.getAddrBalanceService);

  routerAddr.get('/:addr/utxo', services.address.getUTXOAddrService);

  routerTx.post('/send', services.tx.sendTXService);

  app.use('/addr', routerAddr);
  app.use('/tx', routerTx);

};
