const accountModel = require('../../models/accountModel'),
  _ = require('lodash');

module.exports = async (req, res) => {

  let account = await accountModel.findOne({address: req.params.addr});

  let balances = {
    confirmations0: {
      satoshis: _.get(account, 'balances.confirmations0', 0),
      amount: _.get(account, 'balances.confirmations0', 0) / 100000000
    },
    confirmations3: {
      satoshis: _.get(account, 'balances.confirmations3', 0),
      amount: _.get(account, 'balances.confirmations3', 0) / 100000000
    },
    confirmations6: {
      satoshis: _.get(account, 'balances.confirmations6', 0),
      amount: _.get(account, 'balances.confirmations6', 0) / 100000000
    },
  };

  res.send(balances);

};
