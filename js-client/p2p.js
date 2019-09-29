const Libp2p = require('libp2p')
const TCP = require('libp2p-tcp')

const defaultsDeep = require('@nodeutils/defaults-deep')

// A simple upgrader that just returns the MultiaddrConnection
const upgrader = {
  upgradeInbound: maConn => maConn,
  upgradeOutbound: maConn => maConn
}

const DEFAULT_OPTS = {
  modules: {
    transport: [
      new TCP({ upgrader })
    ]
  }
}

class P2PNode extends Libp2p {
  constructor (opts) {
    super(defaultsDeep(opts, DEFAULT_OPTS))
  }
}

module.exports = {P2PNode}
