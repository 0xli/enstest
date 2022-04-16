# Basic Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, a sample script that deploys that contract, and an example of a task implementation, which simply lists the available accounts.

Try running some of the following tasks:

```shell
npx hardhat --network rinkeby run scripts/enstest.js
npx hardhat accounts
npx hardhat compile
npx hardhat clean
npx hardhat test
npx hardhat node
node scripts/sample-script.js
npx hardhat help
```
```
E:\work\enstest>npx hardhat run scripts\deployFIFSregistrar.js --network rinkeby
accounts 0：0x67548a3c43819643390A9Aa5E0BCB284422DEA86
network id：4 0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e rinkeby
ens:0x98325eDBE53119bB4A5ab7Aa35AA4621f49641E6
eth resolver:0xAe41CFDE7ABfaaA2549C07b2363458154355bAbD
setSubnodeOwner accounts[0]:0x67548a3c43819643390A9Aa5E0BCB284422DEA86
setSubnodeOwner accounts[0]:0x67548a3c43819643390A9Aa5E0BCB284422DEA86
setResolver done
setAddr done
eth registrar:0x0b5f2288e2aBF6CB902Cd0a3aED19790870591C6
setSubnodeOwner ... eth
setSubnodeOwner done eth
setSubnodeOwner ... reverse
setSubnodeOwner done  reverse
setSubnodeOwner ... addr
setSubnodeOwner done  addr
eth reverseRegistrar:0xFdb1b60AdFCba28f28579D709a096339F5bEb651

```
beagles.eth
```
```

## multicall is different in ethers
```
let ABI=["function setText(bytes32 node, string calldata key, string calldata value) external"];
let iface = new ethers.utils.Interface(ABI);
var textNickname = iface.encodeFunctionData("setText",[mynode, "nickname", names[i]+' is me']);
```
https://medium.com/@itsMarcoSolis/integrating-ens-into-your-reactjs-dapp-using-the-multicall-contract-fca126b9ffec

https://medium.com/@itsMarcoSolis/integrating-the-multicall-contract-into-your-reactjs-dapp-5b08cd649d5d

https://github.com/ethers-io/ethers.js/issues/478

https://github.com/ethers-io/ethers.js/issues/826

https://web3js.readthedocs.io/en/v1.2.0/web3-eth-contract.html#methods-mymethod-encodeabi

```
In v4:

let ABI = [
"function transfer(address to, uint amount)"
];
let iface = new ethers.utils.Interface(ABI);
iface.functions.transfer.encode([ "0x1234567890123456789012345678901234567890", ethers.utils.parseEther("1.0") ]);
'0xa9059cbb00000000000000000000000012345678901234567890123456789012345678900000000000000000000000000000000000000000000000000de0b6b3a7640000'

In v5:

let ABI = [
"function transfer(address to, uint amount)"
];
let iface = new ethers.utils.Interface(ABI);
iface.encodeFunctionData("transfer", [ "0x1234567890123456789012345678901234567890", parseEther("1.0") ])
'0xa9059cbb00000000000000000000000012345678901234567890123456789012345678900000000000000000000000000000000000000000000000000de0b6b3a7640000'
```