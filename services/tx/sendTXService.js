const accountModel = require('../../models/accountModel'),
  _ = require('lodash'),
  Promise = require('bluebird'),
  messages = require('../../factories/messages/genericMessageFactory'),
  decodeTxService = require('../../utils/decodeTxService'),
  calcBalanceService = require('../../utils/calcBalanceService'),
  pushTxService = require('../../utils/pushTxService'),
  fetchUTXOService = require('../../utils/fetchUTXOService'),
  fetchTXService = require('../../utils/fetchTXService');

module.exports = async (req, res) => {

  if (!req.body.tx) {
    return res.send(messages.fail);
  }

  let tx = await decodeTxService(req.body.tx);

  let voutAddresses = _.chain(tx.vout)
    .map(vout => _.get(vout, 'scriptPubKey.addresses', []))
    .flattenDeep()
    .uniq()
    .value();

  let inputs = await Promise.mapSeries(tx.vin, async vin => {
    let tx = await fetchTXService(vin.txid);
    return tx.vout[vin.vout];
  });

  let vinAddresses = _.chain(inputs)
    .map(vout => _.get(vout, 'scriptPubKey.addresses', []))
    .flattenDeep()
    .uniq()
    .value();

  let addresses = _.chain(voutAddresses)
    .union(vinAddresses)
    .flattenDeep()
    .uniq()
    .value();

  tx.inputs = inputs;
  tx.outputs = tx.vout.map(v => ({
    value: Math.floor(v.value * Math.pow(10, 8)),
    scriptPubKey: v.scriptPubKey,
    addresses: v.scriptPubKey.addresses
  }));

  for (let i = 0; i < tx.inputs.length; i++) {
    tx.inputs[i] = {
      addresses: tx.inputs[i].scriptPubKey.addresses,
      prev_hash: tx.vin[i].txid,
      script: tx.inputs[i].scriptPubKey,
      value: Math.floor(tx.inputs[i].value * Math.pow(10, 8)),
      output_index: tx.vin[i].vout
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

  tx = _.omit(tx, ['vin', 'vout', 'blockhash']);

  for (let address of addresses) {
    let utxos = await fetchUTXOService(address);
    let balances = calcBalanceService(utxos);

    let delta = _.chain(tx.outputs).filter(out => out.addresses.includes(address)).map(i => i.value).sum().defaultTo(0).value() -
      _.chain(tx.inputs).filter(input => input.addresses.includes(address)).map(i => i.value).sum().defaultTo(0).value();

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
