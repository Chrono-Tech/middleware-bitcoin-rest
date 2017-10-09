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
    let balance = calcBalanceService(utxos);
    account.balances.confirmations0 = balance.balance;
    account.balances.confirmations3 = balance.balance;
    account.balances.confirmations6 = balance.balance;
    account.lastBlockCheck = balance.lastBlockCheck;
    await account.save();

    res.send(messages.success);
  } catch (e) {
    res.send(messages.fail);
  }
};
