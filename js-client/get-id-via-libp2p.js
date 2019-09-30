/*

$ curl http://localhost:8080/p2p/QmTj5ySrHZridAvMNiCGS7iXyPoHnAKmpf4W8ErQruKk8f/http/api/id
{"Addresses":["/ip4/127.0.0.1/tcp/6100/ipfs/Qmawx59KBbArpXZATeC4XRLCE6ageykAWRSFojzRJhTxFc","/ip4/10.0.1.52/tcp/6100/ipfs/Qmawx59KBbArpXZATeC4XRLCE6ageykAWRSFojzRJhTxFc","/ip4/64.46.28.178/tcp/6100/ipfs/Qmawx59KBbArpXZATeC4XRLCE6ageykAWRSFojzRJhTxFc"],"ID":"Qmawx59KBbArpXZATeC4XRLCE6ageykAWRSFojzRJhTxFc"}

*/

const http = require('http')
const net = require('net')
const multiaddr = require('multiaddr')
const PeerInfo = require('peer-info')
const PeerId = require('peer-id')
const { P2PNode } = require('./p2p')
const delay = require('delay')
const pull = require('pull-stream')
const toPull = require('stream-to-pull-stream')

function createPeer(callback) {
  // create a new PeerInfo object with a newly-generated PeerId
  PeerInfo.create((err, peerInfo) => {
    if (err) {
      return callback(err)
    }

    // add a listen address to accept TCP connections on a random port
    const listenAddress = multiaddr(`/ip4/127.0.0.1/tcp/0`)
    peerInfo.multiaddrs.add(listenAddress)

    const peer = new P2PNode({peerInfo})
    // register an event handler for errors.
    // here we're just going to print and re-throw the error
    // to kill the program
    peer.on('error', err => {
      console.error('libp2p error: ', err)
      throw err
    })

    callback(null, peer)
  })
}

function pingRemotePeer(localPeer, remoteAddr, remotePeerInfo) {
  return new Promise((resolve, reject) => {
    localPeer.ping(remotePeerInfo, (err, time) => {
      if (err) {
        console.error('error pinging: ', err)
        return reject(err)
      }
      console.log(`pinged ${remoteAddr.toString()} in ${time}ms`)
      resolve()
    })
  })
}

class Libp2pHttpAgent extends http.Agent {
  constructor (localPeer, remotePeerInfo) {
    super()
    this.localPeer = localPeer
    this.remotePeerInfo = remotePeerInfo
  }

  createConnection (options, cb) {
    console.log('Jim createConnection 1')
    const socket = new net.Socket({
      readable: true,
      writable: true
    })
    // socket._handle = () => {}
    const oldWrite = socket._write
    socket._write = function (chunk, encoding, callback) {
      console.log('Jim write', chunk)
      oldWrite.call(socket, chunk, encoding, callback)
    }
    // return super.createConnection(options, cb)
    /*
    this.localPeer.dialProtocol(this.remotePeerInfo, '/libp2p-http', (err, conn) => {
      if (err) {
        console.error('error dialing: ', err)
        return cb(err)
      }
      socket.emit('connect')
      console.log('Jim createConnection 2')
      const stream = toPull.duplex(socket)
      pull(
        stream,
        pull.map(function (b) {
          console.log('Jim stream -> conn', b.toString())
          return b
        }),
        conn,
        pull.map(function (b) {
          console.log('Jim conn -> stream', b.toString())
          return b
        }),
        stream
      )
      console.log('Jim createConnection 3')
      // cb(null, socket)
    })
    */
    return socket
  }
}

function getFilecoinId (localPeer, remoteAddr, remotePeerInfo) {
  return new Promise((resolve, reject) => {

    //const agent = new http.Agent()
    const agent = new Libp2pHttpAgent(localPeer, remotePeerInfo)
    const url = 'http://localhost:8080/ipfs/QmTuRwX8qE482j3R8SUQc2ZEYDX7XDFLo2DFopVyRjUTgt'
    const opts = {
      agent
    }
    http.get(url, opts, res => {
      const { statusCode } = res
      const contentType = res.headers['content-type']

      let error
      if (statusCode !== 200) {
        error = new Error('Request Failed.\n' +
                          `Status Code: ${statusCode}`)
      }
      if (error) {
        console.error(error.message)
        // Consume response data to free up memory
        res.resume()
        return reject(error)
      }

      res.setEncoding('utf8')
      let rawData = ''
      res.on('data', chunk => { rawData += chunk })
      res.on('end', () => {
        console.log(rawData)
        resolve()
      })
    }).on('error', (e) => {
      console.error(`Got error: ${e.message}`)
      reject(e)
    })
    /*
    localPeer.dialProtocol(remotePeerInfo, '/libp2p-http', (err, conn) => {
      if (err) {
        console.error('error dialing: ', err)
        return reject(err)
      }
      console.log(`connection to /http ${remoteAddr.toString()}`, conn)
      pull(
        pull.values(['GET / HTTP/1.0']),
        conn,
        pull.collect((err, data) => {
          if (err) {
            return reject(err)
          }
          console.log('received http:', data.toString())
          resolve()
        })
      )
    })
    */
  })
}

// main entry point
createPeer((err, peer) => {
  if (err) {
    throw err
  }

  peer.start(async err => {
    if (err) {
      throw err
    }

    // get the list of addresses for our peer now that it's started.
    // there should be one address of the form
    // `/ip4/127.0.0.1/tcp/${assignedPort}/ipfs/${generatedPeerId}`,
    // where `assignedPort` is randomly chosen by the operating system
    // and `generatedPeerId` is generated in the `createPeer` function above.
    const addresses = peer.peerInfo.multiaddrs.toArray()
    console.log('peer started. listening on addresses:')
    addresses.forEach(addr => console.log(addr.toString()))

    // Convert the multiaddress into a PeerInfo object
    // const remoteAddr = multiaddr('/ip4/10.0.1.52/tcp/10141/p2p/QmTj5ySrHZridAvMNiCGS7iXyPoHnAKmpf4W8ErQruKk8f')
    // const remoteAddr = multiaddr('/ip4/64.46.28.178/tcp/10141/p2p/QmTj5ySrHZridAvMNiCGS7iXyPoHnAKmpf4W8ErQruKk8f')
    const remoteAddr = multiaddr('/ip4/127.0.0.1/tcp/10000/ipfs/QmUJnydKzmZU6Hr4ZQpdkmXqG4B2cSmDxT7qUtw3JdVRE5')
    const peerId = PeerId.createFromB58String(remoteAddr.getPeerId())
    const remotePeerInfo = new PeerInfo(peerId)
    remotePeerInfo.multiaddrs.add(remoteAddr)

    console.log('pinging remote peer at ', remoteAddr.toString())
    await pingRemotePeer(peer, remoteAddr, remotePeerInfo)
    /*
    while (true) {
      await pingRemotePeer(peer, remoteAddr, remotePeerInfo)
      await delay(1000)
    }
    */

    console.log('getting filecoin id at ', remoteAddr.toString())
    await getFilecoinId(peer, remoteAddr, remotePeerInfo)
  })
})


