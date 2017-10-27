const requireAll = require('require-all'),
  bunyan = require('bunyan'),
  log = bunyan.createLogger({name: 'core.rest'}),
  messages = require('../factories/messages/genericMessageFactory');

function errorCatchWrapper (fn) {
  return (req, res, next) => {
    try {
      Promise.resolve(fn(req, res, next))
        .catch((e) => {
          log.error(e);
          res.send(e.code ? e : messages.fail);
        });
    } catch (e) {
      log.error(e);
      return res.send(messages.fail);
    }

  };
}

module.exports = requireAll({
  dirname: __dirname,
  recursive: true,
  filter: /^((?!Service).+)\.js$/,
  resolve: function (service) {
    return errorCatchWrapper(service);
  }
});
