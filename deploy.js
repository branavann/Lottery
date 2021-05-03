const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const {interface,bytecode} = require('./compile');

const provider = new HDWalletProvider(
    'private key goes here',
    'https://rinkeby.infura.io/v3/16a624b7c1124b048ab4429260e8e423'
);

// Creates an instance of web3 that connects to Rinkeby test network
const web3 = new Web3(provider);

const deploy = async () => {
    // Gather a list of unlocked accounts
    const accounts = await web3.eth.getAccounts();

    console.log('Attempting to deploy from account', accounts[0]);

    // Contract deployment
    const result = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({data: bytecode})
        .send({gas: '1000000', from: accounts[0] });

    // Recording the address of our deployed contract
    console.log('Contract deployed to', result.options.address);
    console.log(interface);
};

deploy();
