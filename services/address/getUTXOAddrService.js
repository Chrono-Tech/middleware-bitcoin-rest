const fetchUTXOService = require('../../utils/fetchUTXOService');

module.exports = async (req, res) => {
  let utxos = await fetchUTXOService(req.params.addr);
  res.send(utxos);
};
