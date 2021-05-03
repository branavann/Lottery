ragma solidity ^0.4.17;

contract Lottery {
    address public manager;
    address[] public players;

// Constructor function saves the manager's address
    function Lottery() public {
        manager = msg.sender;
    }
    
    function enter() public payable {
        require(msg.value > 0.1 ether);
        players.push(msg.sender);
    }
    
    function getPlayers() public view returns (address[]){
        return players;
    }
    
    function random() private view returns (uint) {
        return uint(keccak256(block.difficulty, now, players));
    }
    
    function pickWinner() public restricted {
        require(players.length > 0);
        uint index = random() % players.length; // Declare the type of variable 
        players[index].transfer(this.balance); // Returns the winner's address and sends the jackpot
        players = new address[](0); // Returns a brand new array for another lottery round
    }
    
    modifier restricted() {
        require(msg.sender == manager); // Validation; only the manager is able to run the contract
        _;
    }
} 
