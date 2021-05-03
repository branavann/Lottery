import logo from "./logo.svg";
import "./App.css";
import React from "react";
import web3 from './web3';
import lottery from './lottery';
import { getElementError } from "@testing-library/dom";

class App extends React.Component {
  state = {
    manager: '',
    players: [],
    balance: '',
    value: '',
    message: 'Please enter an amount above 0.1 ether to participate'
  }

  async componentDidMount() {
    // Don't have to declare the accounts within .call() because we're using MetaMask's provider
    const manager = await lottery.methods.manager().call();
    const players = await lottery.methods.getPlayers().call();
    const balance = await web3.eth.getBalance(lottery.options.address);
    this.setState({ manager, players, balance });
  }

  onSubmit = async (event) => {
    event.preventDefault();

    const accounts = await web3.eth.getAccounts();

    this.setState({ message: 'Waiting on transaction confirmation' });

    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei(this.state.value, 'ether')
    });

    this.setState({ message: 'You have successfully entered Branavan\'s lottery' })
  }

  onClick = async () => {

    const accounts = await web3.eth.getAccounts();

    this.setState({ message: 'Waiting on transaction confirmation'});

    await lottery.methods.pickWinner().send({
      from: accounts[0]
    });

    this.setState({ message: 'A winner has been picked!'});
  }

  render() {
    return (
      <div>
        <h2>Lottery Contract</h2>
        <p>This contract is managed by {this.state.manager}.</p>
        <p>There are currently {this.state.players.length} people entered, competing to win {web3.utils.fromWei(this.state.balance, 'ether')} ether!</p>

        <hr />

        <form onSubmit={this.onSubmit}>
          <h4>Enter Branavan's Annual Lottery:</h4>
          <h5>Status: {this.state.message}</h5>
          <div>
            <label>Buy-in amount </label>
            <input 
              value={this.state.value} // Enables our onSubmit function to access the user's buy-in
              onChange={event => this.setState({ value: event.target.value })}
            />
          </div>
          <br />
          <button>Enter</button>
        </form>

        <h4>Ready to pick a winner?</h4>
        <button onClick={this.onClick}>Pick a winner!</button>

        <h4>{this.state.pickWinner}</h4>
      </div>
     
    );
  }
}
export default App;
