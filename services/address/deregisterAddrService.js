const accountModel = require('../../models/accountModel'),
  messages = require('../../factories/messages/genericMessageFactory');


module.exports = async (req, res) => {

  if (!req.body.address) {
    return res.send(messages.fail);
  }

  await accountModel.remove({address: req.body.address});
  res.send(messages.success);

};
