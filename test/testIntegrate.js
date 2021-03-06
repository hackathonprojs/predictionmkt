/**
 * a simple straight forward path
 */
let secp = require('secp256k1');
let test = require('tape');
let { sha256, addressHash } = require('../common.js');
let { complexSendTx, sendTx, signTx, getState } = require('./testCommon.js');

// do a simple path of 
// start
// bet
// bet
// oracle
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
    "startInfo": {
      "question": "Who will win FIFA 2018?",
      "outcomes": [
        "england",
        "italy",
        "brazil",
        "germany"
      ],
      "oracle": ["9x2yu6AzwWphm3j6h9pTaJh63h5ioG8RL","5wvwWgKP3Qfw1akQoXWg4NtKmzx5v4dTj"], // addresses of approved oracles
      // meta data about oracle.  eg. description
      "oracleMeta": "http://data.com/oracleinfo",
      "phaseTime":{
        "marketStart":9,"marketEnd":3609,
        "oracleStart":3610,"oracleEnd":7210,
        "challengeStart":7211,"challengeEnd":10811,
        "voteStart":10812,"voteEnd":14412,
        "distributeStart":14413,"distributeEnd":18013
      },
    },
  };
  
  return complexSendTx(tx, privAlice);  
}

function bet1() {
  let tx = {
    "type": "bet",
    "marketId": marketId,
    "outcome": 1,
    "amount": 10,
    "user": addrAlice,
  };

  return complexSendTx(tx, privAlice);
}

function bet2() {
  let tx = {
    "type": "bet",
    "marketId": marketId,
    "outcome": 2,
    "amount": 10,
    "user": addrBob,
  };

  return complexSendTx(tx, privBob);
}

function oracle() {
  let tx = {"type": "oracle", "marketId": marketId, "outcome": 2};

  return complexSendTx(tx, privBob);
}

/**
 * this should fail because carol is not in the approved oracle list
 */
function oracle2() {
  let tx = {"type": "oracle", "marketId": marketId, "outcome": 3};

  return complexSendTx(tx, privCarol);
}

function distribute() {
  let tx = { "type": "distribute", "marketId": marketId }

  return complexSendTx(tx, privBob);
}

async function main() {
  let state = await getState();
  console.log("state: ", state);
  let balanceAliceBefore = state.balances[addrAlice];
  let balanceBobBefore = state.balances[addrBob];

  await start();  
  await bet1();
  await bet2();
  await oracle();
  await oracle2();
  await distribute();
  await distribute(); // calling it twice should not cause problem.  second distribute should be ignored.

  state = await getState();
  console.log("state: ", state);
  // note: cannot use await inside tape test function.
  // also, when there is async function, we cannot declare test twice with tape.
  // we will get "Error: test exited without ending" if we declare tape test twice 
  // with the async function.
  // https://github.com/substack/tape/issues/160
  test("integration test path 1: ", function(t) {
    t.notEqual(typeof(state.market[marketId]), 'undefined');

    let market = state.market[marketId];

    t.equal(state.balances[addrAlice], (balanceAliceBefore - 10), "alice final balance");
    t.equal(state.balances[addrBob], (balanceBobBefore + 10), "bob final balance");

    t.equal(market.oracleOutcome, 2, "oracle outcome");

    t.end();
  });
}
main();

