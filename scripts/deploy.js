const hre = require("hardhat");
const namehash = require('eth-ens-namehash');
const tld = "eth";
const ethers = hre.ethers;
const utils = ethers.utils;
const labelhash = (label) => utils.keccak256(utils.toUtf8Bytes(label))
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const ZERO_HASH = "0x0000000000000000000000000000000000000000000000000000000000000000";
async function main() {
    const ENSRegistry = await ethers.getContractFactory("ENSRegistry")
    const FIFSRegistrar = await ethers.getContractFactory("FIFSRegistrar")
    const ReverseRegistrar = await ethers.getContractFactory("ReverseRegistrar")
    const PublicResolver = await ethers.getContractFactory("PublicResolver")
    const signers = await ethers.getSigners();
    const accounts = signers.map(s => s.address)

    const ensaddress ='0x7bc06c482DEAd17c0e297aFbC32f6e63d3846650';
    //const ensaddress='0xed055F160D056EB858A4e510C31B9328475dc205';

    console.log('accounts 0：'+accounts[0]);
    const {chainId,ensAddress,name}=await ethers.provider.getNetwork();
    console.log('network id：'+chainId,ensAddress,name);
    const resolverAddress = '0x5c74c94173F05dA1720953407cbb920F3DF9f887';
    const rinkeby={ens:'0x4Defdf248B10Fd75701C97687aDfDa44022070B2',
                   resolver:'0xb3Cf9cE3F38e6b53800E8320159ac9115a73217f',
                   registar:'0x1fE1aCC7389F6462BDf9529fE661C15C46d51588',
                   reverse:'0x2058fAaad4DE0663BB71E7B1925Fd72F37b872Fc' }
    var ens,resolver;
    if (chainId==4)
         ens = await ENSRegistry.attach(rinkeby.ens);
    else
        if (chainId==1515)
             ens = ENSRegistry.attach(ensaddress);
        else
//            ens = await ENSRegistry.deploy();
            return;
    await ens.deployed();
    console.log('ens:'+ens.address);
    if (chainId==4)
            resolver = PublicResolver.attach(rinkeby.resolver);
    else
        if (chainId==1515)
            resolver = PublicResolver.attach(resolverAddress);
        else
            resolver = await PublicResolver.deploy(ens.address, ZERO_ADDRESS);
    await resolver.deployed()
    console.log(tld+' resolver:'+resolver.address);
    if (chainId!=1515)
        await setupResolver(ens, resolver, accounts)
//    const registrar = await  FIFSRegistrar.deploy(ens.address, namehash.hash(tld),{gasLimit:210000});
    const registrar = await  FIFSRegistrar.deploy(ens.address, namehash.hash(tld));
    await registrar.deployed()
    console.log(tld+' registrar:'+registrar.address);
    await setupRegistrar(ens, registrar);
    const reverseRegistrar = await ReverseRegistrar.deploy(ens.address, resolver.address);
    await reverseRegistrar.deployed()
    await setupReverseRegistrar(ens, registrar, reverseRegistrar, accounts);
    console.log(tld+' reverseRegistrar:'+reverseRegistrar.address);
};

async function setupResolver(ens, resolver, accounts) {
    const resolverNode = namehash.hash("resolver");
    const resolverLabel = labelhash("resolver");
    console.log('setSubnodeOwner accounts[0]:'+accounts[0])
    await ens.setSubnodeOwner(ZERO_HASH, resolverLabel, accounts[0],{gasLimit:210000});
    console.log('setSubnodeOwner accounts[0]:'+accounts[0])
    await ens.setResolver(resolverNode, resolver.address,{gasLimit:210000});
    console.log('setResolver done');
    await resolver['setAddr(bytes32,address)'](resolverNode, resolver.address,{gasLimit:210000});
    console.log('setAddr done');
}

async function setupRegistrar(ens, registrar) {
    console.log('setSubnodeOwner ...',tld);
    await ens.setSubnodeOwner(ZERO_HASH, labelhash(tld), registrar.address,{gasLimit:210000});
    console.log('setSubnodeOwner done',tld);
}

async function setupReverseRegistrar(ens, registrar, reverseRegistrar, accounts) {
    console.log('setSubnodeOwner ...',"reverse");
    await ens.setSubnodeOwner(ZERO_HASH, labelhash("reverse"), accounts[0],{gasLimit:210000});
    console.log('setSubnodeOwner done ',"reverse");
    console.log('setSubnodeOwner ...',"addr");
    await ens.setSubnodeOwner(namehash.hash("reverse"), labelhash("addr"), reverseRegistrar.address,{gasLimit:210000});
    console.log('setSubnodeOwner done ',"addr");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

/*
E:\work\enstest>npx hardhat run scripts\deploy.js --network beagle
ens:0xE6E340D132b5f46d1e472DebcD681B2aBc16e57E
resolver:0xc3e53F4d16Ae77Db1c982e75a937B9f60FE63690
registrar:0x1613beB3B2C4f22Ee086B2b38C1476A3cE7f78E8
reverseRegistrar:0xf5059a5D33d5853360D16C683c16e67980206f36

ens:0x7bc06c482DEAd17c0e297aFbC32f6e63d3846650
bsc resolver:0xc351628EB244ec633d5f21fBD6621e1a683B1181
bsc registrar:0xB0D4afd8879eD9F52b28595d31B441D079B2Ca07
bsc reverseRegistrar:0x922D6956C99E12DFeB3224DEA977D0939758A1Fe

ens:0x7bc06c482DEAd17c0e297aFbC32f6e63d3846650
sol resolver:0x04C89607413713Ec9775E14b954286519d836FEf
sol registrar:0xD8a5a9b31c3C0232E196d518E89Fd8bF83AcAd43
sol reverseRegistrar:0x51A1ceB83B83F1985a81C295d1fF28Afef186E02

ens:0x7bc06c482DEAd17c0e297aFbC32f6e63d3846650
ltc resolver:0x4C2F7092C2aE51D986bEFEe378e50BD4dB99C901
ltc registrar:0x7A9Ec1d04904907De0ED7b6839CcdD59c3716AC9
ltc reverseRegistrar:0x4631BCAbD6dF18D94796344963cB60d44a4136b6

ens:0x7bc06c482DEAd17c0e297aFbC32f6e63d3846650
btc resolver:0x5c74c94173F05dA1720953407cbb920F3DF9f887
btc registrar:0x720472c8ce72c2A2D711333e064ABD3E6BbEAdd3
btc reverseRegistrar:0x5067457698Fd6Fa1C6964e416b3f42713513B3dD

ens:0x7bc06c482DEAd17c0e297aFbC32f6e63d3846650
eth resolver:0x5c74c94173F05dA1720953407cbb920F3DF9f887
eth registrar:0xc0F115A19107322cFBf1cDBC7ea011C19EbDB4F8
eth reverseRegistrar:0x34B40BA116d5Dec75548a9e9A8f15411461E8c70

ens:0xD84379CEae14AA33C123Af12424A37803F885889
btc resolver:0x2B0d36FACD61B71CC05ab8F3D2355ec3631C0dd5
btc registrar:0xfbC22278A96299D91d41C453234d97b4F5Eb9B2d
btc reverseRegistrar:0xC9a43158891282A2B1475592D5719c001986Aaec

 */
/*
E:\work\enstest>npx hardhat run scripts/deploy.js --network rinkeby
accounts 0：0x67548a3c43819643390A9Aa5E0BCB284422DEA86
network id：4 0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e rinkeby
ens:0x4Defdf248B10Fd75701C97687aDfDa44022070B2
eth resolver:0xb3Cf9cE3F38e6b53800E8320159ac9115a73217f
setSubnodeOwner accounts[0]:0x67548a3c43819643390A9Aa5E0BCB284422DEA86
setSubnodeOwner accounts[0]:0x67548a3c43819643390A9Aa5E0BCB284422DEA86
setResolver done
setAddr done
eth registrar:0x1fE1aCC7389F6462BDf9529fE661C15C46d51588
setSubnodeOwner ... eth
setSubnodeOwner done eth
setSubnodeOwner ... reverse
setSubnodeOwner done  reverse
setSubnodeOwner ... addr
setSubnodeOwner done  addr
eth reverseRegistrar:0x2058fAaad4DE0663BB71E7B1925Fd72F37b872Fc
* */