const accountModel = require('../../models/accountModel'),
  genericMessages = require('../../factories/messages/genericMessageFactory'),
  addressMessages = require('../../factories/messages/addressMessageFactory'),
  _ = require('lodash'),
  calcBalanceService = require('../../utils/calcBalanceService'),
  fetchUTXOService = require('../../utils/fetchUTXOService');

module.exports = async (req, res) => {

  if (!req.body.address) {
    return res.send(genericMessages.notEnoughArgs);
  }

  let account = new accountModel(req.body);

  let errors = account.validateSync();

  if (errors) {
    return _.has(errors, 'errors.address.properties') ?
      res.send(_.pick(errors.errors.address.properties, ['message', 'code'])) :
      res.send(genericMessages.fail);
  }

  try {
    let utxos = await fetchUTXOService(req.body.address);
    let balances = calcBalanceService(utxos);
    account.balances.confirmations0 = _.get(balances, 'balances.confirmations0', 0);
    account.balances.confirmations3 = _.get(balances, 'balances.confirmations3', 0);
    account.balances.confirmations6 = _.get(balances, 'balances.confirmations6', 0);
    account.lastBlockCheck = balances.lastBlockCheck;
    await account.save();

    res.send(genericMessages.success);
  } catch (e) {
    e.code === 11000 ?
      res.send(addressMessages.existAddress) :
      res.send(genericMessages.fail);
  }
};
