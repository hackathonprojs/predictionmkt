/**
 * a sample client
 */
let { post, get } = require('axios');
let secp = require('secp256k1');
let { sha256, addressHash } = require('../common.js');
let getSigHash = require('../sigHash.js');
let test = require('tape');

//let priv = sha256('463852363a38c0105fc1169995696fb484ec11710ba174b3994c50baa5159423'); // sample private key
let priv = Buffer.from("463852363a38c0105fc1169995696fb484ec11710ba174b3994c50baa5159423", "hex"); // bob's private key
let pub = secp.publicKeyCreate(priv); // create public key
let addr = addressHash(pub);
console.log("addr: ", addr); // create address

async function main () {

  let state = (await get('http://localhost:3000/state')).data;
  console.log("state: ", state);
  let sequence = state.seq[addr];
  if (typeof sequence === "undefined") {
    sequence = 0;
  }
  console.log("sequence: ", sequence);

  let tx = {
    type: "verifySig",
    from: {
      pubkey: pub,
      sequence: sequence,
    },
    test: "test", // this is not needed.  just showing that adding new property will still allow signature to be verified
    to: {
    }
  }

  // sign tx
  let sigHash = getSigHash(tx)
  console.log("sighash: ", sigHash);
  let sigHashHex = sigHash.toString('hex');
  console.log("sighash hex: ", sigHashHex);

  let signature = secp.sign(sigHash, priv).signature;
  tx.from.signature = signature;
  console.log("signature: ", signature);
  let sigHex = signature.toString('hex');
  console.log("signature hex: ", sigHex);


  let res = await post('http://localhost:3000/txs', tx);
  console.log("tx resp: ", res.data);
  console.log("tx resp log: ", res.data.result.check_tx.log);
  
  test("verify sig", function(t){
    t.notEqual(res.data.result.height, 0, "check tx validity");
    t.end();
  });

  // verify signature
  if (!secp.verify(sigHash, signature, pub)) {
    throw Error('Invalid signature');
  } else {
    console.log("signature verified! ***");
  }
}
main()
