import Web3 from "web3";
import contractABI from "./contractABI.json";

const provider = new Web3.providers.HttpProvider(
  "https://mainnet.infura.io/v3/4abd0512745244c995d31aad9685535c"
);
const web3 = new Web3(provider);

const contractAddress = "0x617f954d314aC05fb521537eb462Df3e55E3b3A2";

const contract = new web3.eth.Contract(contractABI, contractAddress);

export default contract;
