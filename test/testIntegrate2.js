/**
 * a simple straight forward path.  with challenge and vote.
 */
let secp = require('secp256k1');
let { sha256, addressHash } = require('../common.js');
let { sendTx, signTx } = require('./testCommon.js');

// do a simple path of 
// start
// bet
// bet
// oracle
// challenge
// vote
// distribute

let privAlice = Buffer.from("ebca1fcfba3e09e865613a87a3814813ab932936885c1b0495f1c05c7e21b1fc", "hex"); // alice's private key
let pubAlice = secp.publicKeyCreate(privAlice); // create public key
let addrAlice = addressHash(pubAlice);

let privBob = Buffer.from("463852363a38c0105fc1169995696fb484ec11710ba174b3994c50baa5159423", "hex"); // bob's private key
let pubBob = secp.publicKeyCreate(privBob); // create public key
let addrBob = addressHash(pubBob);

let privCarol = Buffer.from("b5ca89fcbae09859e2af4bc7fc66e9b1eacf8e893dd40e47e2a99cb0aeb9204b", "hex"); 
let pubCarol = secp.publicKeyCreate(privCarol); // create public key
let addrCarol = addressHash(pubCarol);

let marketId = "m" + new Date().getTime();

function start() {
  let tx = {
    "type": "start",
    "marketId": marketId,
  };
  
  return sendTx(tx, privAlice);  
}

function bet1() {
  let tx = {
    "type": "bet",
    "marketId": marketId,
    "outcome": 1,
    "amount": 10,
    "user": addrAlice,
  };

  return sendTx(tx, privAlice);
}

function bet2() {
  let tx = {
    "type": "bet",
    "marketId": marketId,
    "outcome": 2,
    "amount": 10,
    "user": addrBob,
  };

  return sendTx(tx, privBob);
}

function oracle() {
  let tx = {"type": "oracle", "marketId": marketId, "outcome": 2};

  return sendTx(tx, privBob);
}

function challenge() {
  let tx = {"type": "challenge", "marketId": marketId, "user": addrAlice, "amount": 100};
  return sendTx(tx, privAlice);
}

function vote1() {
  let tx = {"type": "vote", "marketId": marketId, "user": addrAlice, "amount": 1000, "outcome": 1};
  return sendTx(tx, privAlice);
}

function vote2() {
  let tx = {"type": "vote", "marketId": marketId, "user": addrBob, "amount": 10, "outcome": 2};
  return sendTx(tx, privBob);
}

function vote3() {
  let tx = {"type": "vote", "marketId": marketId, "user": addrCarol, "amount": 1000, "outcome": 1};
  return sendTx(tx, privCarol);
}

function distribute() {
  let tx = { "type": "distribute", "marketId": marketId }

  return sendTx(tx, privBob);
}

function main() {
  // start().then(function(result){
  //   console.log("start(): ", result);
  //   return bet1();
  // }).then(function(result){
  //   console.log("bet1(): ", result);
  //   //return bet1();
  // })
  
  start();
  setTimeout(step20, 10000);
  
  function step20() {
    bet1();
    setTimeout(step30, 10000);
  }

  function step30() {
    bet2();
    setTimeout(step40, 10000);
  }

  function step40() {
    oracle();
    setTimeout(step50, 10000);
  }

  function step50() {
    challenge();
    setTimeout(step60, 10000);
  }

  function step60() {
    vote1();
    vote2();
    vote3();
    setTimeout(step100, 10000);
  }

  function step100() {
    distribute();
  }

}
main();






