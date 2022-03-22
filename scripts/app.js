const hre = require("hardhat");
const namehash = require('eth-ens-namehash');
const tld = "sol";
const ethers = hre.ethers;
const utils = ethers.utils;
const provider = ethers.provider;//providers.getDefaultProvider();
//const provider = new ethers.providers.Web3Provider(window.ethereum, "any");

const usdc = {
  address: "0x68ec573C119826db2eaEA1Efbfc2970cDaC869c4",
  abi: [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function gimmeSome() external",
    "function balanceOf(address _owner) public view returns (uint256 balance)",
    "function transfer(address _to, uint256 _value) public returns (bool success)",
  ],
};

async function main() {
  /*=======
    CONNECT TO METAMASK
    =======*/
  const network = await provider.getNetwork();
  console.log(JSON.stringify(network));
  const ENSRegistry = await ethers.getContractFactory("ENSRegistry")
  const FIFSRegistrar = await ethers.getContractFactory("FIFSRegistrar")
  const ReverseRegistrar = await ethers.getContractFactory("ReverseRegistrar")
  const PublicResolver = await ethers.getContractFactory("PublicResolver")
  const signers = await ethers.getSigners();
  const accounts = signers.map(s => s.address)

  const ens = await ENSRegistry.deploy()
  await ens.deployed();
  console.log('ens:'+ens.address);
  const contracts= {
    ens: '0xE6E340D132b5f46d1e472DebcD681B2aBc16e57E',
    resolver: '0xc3e53F4d16Ae77Db1c982e75a937B9f60FE63690',
    registrar: '0x1613beB3B2C4f22Ee086B2b38C1476A3cE7f78E8',
    reverseRegistrar: '0xf5059a5D33d5853360D16C683c16e67980206f36'
  }
  const resolver = PublicResolver.attach(contracts['resolver']);
//  console.log(JSON.stringify(resolver));

  const registrar = FIFSRegistrar.attach(contracts['registrar']);
//  console.log(JSON.stringify(registrar));
  const  address = await resolver.address("sol");
  console.log('add:'+address);
//  await provider.send("eth_requestAccounts", []);
//  const signer = provider.getSigner();
  let userAddress = await signer.getAddress();
  document.getElementById("userAddress").innerText =
    userAddress.slice(0, 8) + "...";

  /*======
    INITIALIZING CONTRACT
    ======*/
  const usdcContract = new ethers.Contract(usdc.address, usdc.abi, signer);

  let contractName = await usdcContract.name();
  // document.getElementById("contractName").innerText = contractName;
  let usdcBalance = await usdcContract.balanceOf(userAddress);
  usdcBalance = ethers.utils.formatUnits(usdcBalance, 6);
  document.getElementById("usdcBalance").innerText = usdcBalance;
}
main();
