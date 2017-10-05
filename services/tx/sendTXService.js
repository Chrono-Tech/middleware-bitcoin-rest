const accountModel = require('../../models/accountModel'),
  _ = require('lodash'),
  Promise = require('bluebird'),
  messages = require('../../factories/messages/genericMessageFactory'),
  decodeTxService = require('../../utils/decodeTxService'),
  calcBalanceService = require('../../utils/calcBalanceService'),
  pushTxService = require('../../utils/pushTxService'),
  fetchUTXOService = require('../../utils/fetchUTXOService');

module.exports = async (req, res) => {

  if (!req.body.tx) {
    return res.send(messages.fail);
  }

  let tx = decodeTxService(req.body.tx);

  let addresses = _.chain([])
    .union(tx.outputs, tx.inputs)
    .map(item => item.address)
    .uniq()
    .value();

  let utxos = await Promise.mapSeries(addresses, address => fetchUTXOService(address));
  utxos = _.flattenDeep(utxos);

  for (let i = 0; i < tx.inputs.length; i++) {
    let input = _.find(utxos, {txid: tx.inputs[i].prevout.hash});
    tx.inputs[i] = {
      address: input.address,
      txid: input.txid,
      script: input.scriptPubKey,
      value: input.satoshis
    };
  }

  tx.valueIn = _.chain(tx.inputs)
    .map(i => i.value)
    .sum()
    .value();

  tx.valueOut = _.chain(tx.outputs)
    .map(i => i.value)
    .sum()
    .value();

  tx.fee = tx.valueIn - tx.valueOut;

  for (let address of addresses) {
    let utxos = await fetchUTXOService(address);
    let balances = calcBalanceService(utxos);

    let delta = _.chain(tx.outputs).filter({address: address}).map(i => i.value).sum().defaultTo(0).value() -
      _.chain(tx.inputs).filter({address: address}).map(i => i.value).sum().defaultTo(0).value();

    _.set(balances, 'balances.confirmations0', delta + _.get(balances, 'balances.confirmations6', 0));

    await accountModel.update({address: address}, {
      $set: {
        'balances.confirmations0': _.get(balances, 'balances.confirmations0'),
        lastBlockCheck: balances.lastBlockCheck
      }
    });

  }

  await pushTxService(req.body.tx);

  res.send(tx);
};
