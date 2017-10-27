const accountModel = require('../../models/accountModel'),
  _ = require('lodash'),
  Promise = require('bluebird'),
  genericMessages = require('../../factories/messages/genericMessageFactory'),
  txMessages = require('../../factories/messages/txMessageFactory'),
  decodeTxService = require('../../utils/decodeTxService'),
  calcBalanceService = require('../../utils/calcBalanceService'),
  pushTxService = require('../../utils/pushTxService'),
  fetchUTXOService = require('../../utils/fetchUTXOService'),
  fetchTXService = require('../../utils/fetchTXService'),
  fetchMemPoolService = require('../../utils/fetchMemPoolService');

module.exports = async (req, res) => {

  if (!req.body.tx) {
    return res.send(genericMessages.notEnoughArgs);
  }

  let tx = await decodeTxService(req.body.tx)
    .catch(() => Promise.reject(txMessages.wrongTx));

  let voutAddresses = _.chain(tx.vout)
    .map(vout => _.get(vout, 'scriptPubKey.addresses', []))
    .flattenDeep()
    .uniq()
    .value();

  let inputs = await Promise.mapSeries(tx.vin, async vin => {
    let tx = await fetchTXService(vin.txid);
    return tx.vout[vin.vout];
  }).catch(() => Promise.reject(txMessages.wrongTx));

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
      prev_hash: tx.vin[i].txid, //eslint-disable-line
      script: tx.inputs[i].scriptPubKey,
      value: Math.floor(tx.inputs[i].value * Math.pow(10, 8)),
      output_index: tx.vin[i].vout //eslint-disable-line
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

  let hash = await pushTxService(req.body.tx);
  let memTxs = await fetchMemPoolService();

  if (!memTxs[hash])
  {return res.send(txMessages.wrongTx);}

  tx.time = _.get(memTxs, `${hash}.time`, 0);
  res.send(tx);
};
