import Web3 from "web3";

const provider = new Web3.providers.HttpProvider(
  "https://sepolia.infura.io/v3/4abd0512745244c995d31aad9685535c"
);
// OR for local Ganache: "http://127.0.0.1:7545"

const web3 = new Web3(provider);

export default web3;
