const accountModel = require('../../models/accountModel'),
  messages = require('../../factories/messages/genericMessageFactory'),
  _ = require('lodash'),
  calcBalanceService = require('../../utils/calcBalanceService'),
  fetchUTXOService = require('../../utils/fetchUTXOService');

module.exports = async (req, res) => {

  if (!req.body.address) {
    return res.send(messages.fail);
  }

  let account = new accountModel(req.body);

  if (account.validateSync()) {
    return res.send(messages.fail);
  }

  try {
    let utxos = await fetchUTXOService(req.body.address);
    let balances = calcBalanceService(utxos);
    account.balances.confirmations0 = _.get(balances, 'balances.confirmations0', 0);
    account.balances.confirmations3 = _.get(balances, 'balances.confirmations3', 0);
    account.balances.confirmations6 = _.get(balances, 'balances.confirmations6', 0);
    account.lastBlockCheck = balances.lastBlockCheck;
    await account.save();

    res.send(messages.success);
  } catch (e) {
    res.send(messages.fail);
  }
};
