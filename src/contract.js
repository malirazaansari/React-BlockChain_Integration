import web3 from "./web3";
import contractABI from "./contractABI.json";

const contractAddress = "0x617f954d314aC05fb521537eb462Df3e55E3b3A2";

const contract = new web3.eth.Contract(contractABI, contractAddress);

export default contract;
