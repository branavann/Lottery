const assert = require('assert');
const ganache = require('ganache-cli'); // Local test network
const Web3 = require('web3'); // Constructor function requires capitalization

const provider = ganache.provider();
const web3 = new Web3(provider);

const {interface,bytecode} = require('../compile');

let accounts;
let lottery; // Declaring the contract's name; accessible globally 

beforeEach(async () => {
    // Gather a list of all accounts
    accounts = await web3.eth.getAccounts();

    // Selecting an account 
    lottery = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({data: bytecode})
        .send({from: accounts[0], gas: '1000000'});
    
    lottery.setProvider(provider);
});

describe('Lottery Contract', () => {
    it('Deploys our lottery contract', () => {
        assert.ok(lottery.options.address); // Checks if our lottery contract has a valid address
    });

    it('Enter function for a single participant', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.2','ether')
        });

        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });

        assert.equal(accounts[0], players[0]);
        assert.equal(1, players.length);
    });

    it('Enter function for multiple participants', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.2','ether')
        });

        await lottery.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei('0.4','ether')
        });

        await lottery.methods.enter().send({
            from: accounts[2],
            value: web3.utils.toWei('0.5','ether')
        });

        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });

        assert.equal(accounts[0], players[0]);
        assert.equal(accounts[1], players[1]);
        assert.equal(accounts[2], players[2]);
        assert.equal(3, players.length);
    });

    it('Minimum buy-in requirement', async () => {
        try {
            await lottery.methods.enter().send({
                from: accounts[0],
                value: web3.utils.toWei('0.01','ether') // This is below the minimum value this should cause an error
            });
        } catch (err) {
            assert(err); // This assert block checks if there is an error present
            return;
        }
        assert(false); // If the try block doesn't fail the assert value will be false and we'll fail our test
    });

    it('Only the manager can call the pickWinner function', async () => {
        try {
            await lottery.methods.enter().send({
                from: accounts[0],
                value: web3.utils.toWei('0.4','ether')
            });
            await lottery.methods.pickWinner().send({
                from: accounts[1],
            }); 
        } catch (err) {
            assert(err);
            return;
        }
        assert(false);
    });

    it('Completes transfer of jackpot to the winner and resets the player array', async () => {
        // Single participants is buying into the lottery
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('2','ether')
        });

        const initialBalance = await web3.eth.getBalance(accounts[0]); // Returns the Wei within the address

        // Picking a winner and paying out the jackpot
        await lottery.methods.pickWinner().send({
            from: accounts[0]
        });
        
        // Returns the winner's balance after their payout
        const finalBalance = await web3.eth.getBalance(accounts[0]); 
        const difference = finalBalance - initialBalance;
        console.log('Gas cost:', 2 - difference);
        
        // Checking if the array of participants is reset
        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });        

        const contractBalance = await web3.eth.getBalance(lottery.options.address);

        assert(difference > web3.utils.toWei('1.8','ether')); // Difference accounts for gas costs; approximation 
        assert.equal(0,players.length);
        assert.equal(0,contractBalance);
    });
});