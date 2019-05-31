"use srtict";

const grpc = require('grpc')
const protoLoader = require('@grpc/proto-loader')
const utils = require('./utils.js')
const PROTO_PATH =  './NodeCore/veriblock.proto'

const packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {keepCase: true,
     longs: String,
     enums: String,
     defaults: true,
     oneofs: true
    });

const vbk_proto = grpc.loadPackageDefinition(packageDefinition).core;
const client = new vbk_proto.Admin('localhost:10502', grpc.credentials.createInsecure());


function getInfo() {
  // get info
  client.GetInfo({}, (err, res) => {
    if(err) return console.error(err)

    console.log("NC_CLI command: getinfo")
    console.log(`LastBlock.Hash= ${res.last_block.hash.toString("hex")}`)
    console.log(`EstimatedHasrate= ${res.estimated_hashrate} h/s`)
  })

  client.GetStateInfo({}, (err, res) => {
    if(err) return console.error(err)

    console.log("NC_CLI command: getstateinfo")
    console.log(`NetworkHeight= ${res.network_height}`)
    console.log(`NetworkVersion= ${res.network_version}`)
    console.log(`LocalBlockchainHeight= ${res.local_blockchain_height}`)

    console.log("---------------------")
    console.log("")
  })
}

function sendTranasction() {
  // sending implies also signing
  const sourseAddress = "VFXWGNLcGR4vTCSU6VAMXvgru9EKk3"
  const targetAddress = "V5gb4UCrzn7rxzqaJE9EYNvZoF3KUC"
  const amount = 10.5

  const request = {
    source_address: utils.convertAddressToByteString(sourseAddress),
    amounts: [{
      address: utils.convertAddressToByteString(targetAddress),
      amount: 10
    }]
  }

  client.SendCoins(request, (err, res) => {
    if(err) return console.error(err)

    console.log("SendTransaction");
    console.log("NC_CLI command: send <amount> <destinationAddress> [sourceAddress]");

    //Note - could create multiple Tx, pick just the first one for demo:
    const txHash = res.tx_ids[0].toString("hex");
    console.log(`Created transaction: ${txHash}`)

    console.log("---------------------")
    console.log("")
  })
}



function getBlockByIndex() {
  const blockIndex = 100

  const request = {
    search_length: 2000,
    filters: [{
      index: 100
    }]
  }

  client.getBlocks(request, (err, res) => {
    if(err) return console.error(err)

    console.log("GetBlockByIndex")
    console.log("NC_CLI command: getblockfromindex <blockIndex>")
    console.log("")

    if(res.blocks.length > 0) {

      // display info
      const blockHash = res.blocks[0].hash.toString("hex")
      console.log(`BlocksHash= ${blockHash}`)

      console.log("---------------------")
      console.log("")
    }
  })
}


function getBlockByHash() {
  const blockHash = "00000000b4316a043aa23f327a2b19f9e23fafd0356e48a8"

  const request = {
    search_length: 2000,
    filters: [{
      hash: Buffer.from(blockHash, "hex")
    }]
  }

  client.getBlocks(request, (err, res) => {
    console.log("GetBlockByHash")
    console.log("NC_CLI command: getblockfromhash <blockHash>")
    console.log("")

    if(err) return console.error(err)

    if(res.blocks.length > 0) {

      // display info
      const blockIndex = res.blocks[0].number
      console.log(`BlockIndex= ${blockIndex}`)

      console.log("---------------------")
      console.log("")
    }
  })
}


// -------------------------------
function getTransactionById() {
  const txId = "12498E1EF73BCA555C5EB1F0AC1D7C6D8F3256DEED9AE7A78C74DD7A762D1B8B"
      
  // get transaction
  const request = {
    search_length: 2000,
    ids: [Buffer.from(txId, "hex")]
  }

  client.GetTransactions(request, (err,res) => {
    console.log("GetTransactionById");
    console.log("NC_CLI command: gettransaction <txId> [searchLength]");
    console.log("")

    if(err) return console.error(err)

    if(res.transactions.length > 0) {
      // display info
      const blockIndex = res.transactions[0].block_number
      const amount = utils.convertAtomicToVbkUnits(res.transactions[0].transaction.source_amount)
      console.log(`BlockIndex= ${blockIndex}, sourseAmount= ${amount}`)

      console.log("---------------------")
      console.log("")
    }
  })
}



function getBalance() {
  const address = "VFXWGNLcGR4vTCSU6VAMXvgru9EKk3"

  // get balance
  const request = {
    addresses: [utils.convertAddressToByteString(address)]
  }

  client.getBalance(request, (err, res) => {
    console.log("GetBalance")
    console.log("NC_CLI command: getbalance [address]")
    console.log("")
    if(err) return console.error(err)

    console.log(`Confirmed= ${utils.convertAtomicToVbkUnits(res.confirmed[0].unlocked_amount)} VBK`)
    console.log(`Pending= ${utils.convertAtomicToVbkUnits(res.unconfirmed[0].amount)} VBK`)

    console.log("---------------------")
    console.log("")
  })
}

function getNewAddress() {
  // generate address
  client.GetNewAddress(1, (err,res) => {
    console.log("GetNewAddress")
    console.log("NC_CLI command: getnewaddress")
    console.log("")

    if(res.success) {
      if(err) return console.error(err)

      const bytes = Buffer.from(res.address, 'hex')
      const address = utils.convertByteToAddressString(bytes)
      console.log(`New address: ${address}`)
      console.log("------------------")
      console.log("")
    }
  })
}

function main() {
  getInfo()
  getBlockByIndex()
  getBlockByHash()
  getTransactionById()
  getBalance()
  getNewAddress()
  sendTranasction()
}

main()

