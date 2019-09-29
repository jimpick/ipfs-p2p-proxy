https://github.com/ipfs/go-ipfs/blob/master/docs/experimental-features.md#p2p-http-proxy

# On Nuc

```
$ curl http://127.0.0.1:3453/api/id
{"Addresses":["/ip4/127.0.0.1/tcp/6100/ipfs/Qmawx59KBbArpXZATeC4XRLCE6ageykAWRSFojzRJhTxFc","/ip4/10.0.1.52/tcp/6100/ipfs/Qmawx59KBbArpXZATeC4XRLCE6ageykAWRSFojzRJhTxFc","/ip4/64.46.28.178/tcp/6100/ipfs/Qmawx59KBbArpXZATeC4XRLCE6ageykAWRSFojzRJhTxFc"],"ID":"Qmawx59KBbArpXZATeC4XRLCE6ageykAWRSFojzRJhTxFc"}
```

```
$ ipfs p2p listen --allow-custom-protocol /filecoin-api /ip4/127.0.0.1/tcp/3453
```

# On jpmbp2

```
$ curl http://localhost:8080/p2p/QmTj5ySrHZridAvMNiCGS7iXyPoHnAKmpf4W8ErQruKk8f/http/api/id
```
