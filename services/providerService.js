/**
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Egor Zuev <zyev.egor@gmail.com>
 */

const EventEmitter = require('events'),
  httpExec = require('../utils/api/httpExec'),
  ipcExec = require('../utils/api/ipcExec'),
  AbstractProvider = require('middleware-common-components/abstract/universal/AbstractProvider');

/**
 * @service
 * @description the service for handling connection to node
 * @returns Object<ProviderService>
 */

class ProviderService extends AbstractProvider {

  constructor (providers) {
    super();
    this.providers = providers;
  }

  /** @function
   * @description reset the current connection
   */
  async resetConnector () {
    await this.connector.reset();
    this.switchConnector();
    this.events.emit('disconnected');
  }

  /**@function
   * @description build the connector from the URI
   * @param providerURI - the URI endpoint
   * @return Object<HttpExec|IpcExec>
   */

  getConnectorFromURI(providerURI) {
    const isHttpProvider = new RegExp(/(http|https):\/\//).test(providerURI);
    return isHttpProvider ? new httpExec(providerURI) : new ipcExec(providerURI);
  }


  /**
   * @function
   * @description start listen for provider updates from block processor
   * @private
   */
  _startListenProviderUpdates () {

    this.rabbitmqChannel.consume(`${this.rabbitServiceName}_provider.${this.id}`, async (message) => {
      message = JSON.parse(message.content.toString());

      const providerURI = this.providers[message.index];


      const currentProviderURI = this.connector ? this.connector.currentProvider.uri : '';

      if (currentProviderURI === providerURI.uri)
        return this.events.emit('provider_set');

      this.connector = {
        instance: this.getConnectorFromURI(providerURI.uri),
        currentProvider: providerURI
      };

      if (this.connector.instance instanceof EventEmitter) {
        this.connector.instance.on('disconnect', () => this.resetConnector());
      } else
        this.pingIntervalId = setInterval(async () => {

          const blockCount = await this.connector.instance.execute('getblockcount', []).catch(() => false);

          if (blockCount === false) {
            clearInterval(this.pingIntervalId);
            this.resetConnector();
          }
        }, 5000);


      this.events.emit('provider_set');
    }, {noAck: true});

  }

}

module.exports = ProviderService;
