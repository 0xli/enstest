const hre = require("hardhat/internal/lib/hardhat-lib");
const namehash = require('eth-ens-namehash');
const tld = "sol";
const ethers = hre.ethers;
const utils = ethers.utils;
const labelhash = (label) => utils.keccak256(utils.toUtf8Bytes(label))
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const ZERO_HASH = "0x0000000000000000000000000000000000000000000000000000000000000000";
//import Web3 from 'web3';
var Web3= require('web3');
var ENS = require('ethereum-ens');
//import ENS, { getEnsAddress } from '@ensdomains/ensjs';
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
//    > await delay(1000) /// waiting 1 second.

async function main() {
    const ENSRegistry = await ethers.getContractFactory("ENSRegistry")
    const FIFSRegistrar = await ethers.getContractFactory("FIFSRegistrar")
    const ReverseRegistrar = await ethers.getContractFactory("ReverseRegistrar")
    const PublicResolver = await ethers.getContractFactory("PublicResolver")
    const signers = await ethers.getSigners();
    let defaultAccount;
    const accounts = signers.map(s =>{defaultAccount=s.address, console.log('account:'+s.address)});
    console.log('0：',accounts[0],defaultAccount);
    var ensaddress='0xed055F160D056EB858A4e510C31B9328475dc205';
    const resolverAddress='0xc3e53F4d16Ae77Db1c982e75a937B9f60FE63690';
    //var ensaddress='0xE6E340D132b5f46d1e472DebcD681B2aBc16e57E';
    ensaddress ='0x7bc06c482DEAd17c0e297aFbC32f6e63d3846650';
    const network = {
        name: "dev",
        chainId: 1515,
        ensAddress: ensaddress
    };
    const rinkeby={ens:'0x4Defdf248B10Fd75701C97687aDfDa44022070B2',
        resolver:'0xb3Cf9cE3F38e6b53800E8320159ac9115a73217f',
        registar:'0x1fE1aCC7389F6462BDf9529fE661C15C46d51588',
        reverse:'0x2058fAaad4DE0663BB71E7B1925Fd72F37b872Fc' }
    const {chainId,ensAddress,name}=await ethers.provider.getNetwork();
    console.log('network id：'+chainId,ensAddress,name);
    const rinkebyEns={ens:'0x98325eDBE53119bB4A5ab7Aa35AA4621f49641E6',
        resolver:'0xAe41CFDE7ABfaaA2549C07b2363458154355bAbD',
        reverse: '0xFdb1b60AdFCba28f28579D709a096339F5bEb651'}

    var ens,resolver;
    if (chainId==4)
        ens = await ENSRegistry.attach(rinkebyEns.ens);
    else
    if (chainId==1515)
        ens = ENSRegistry.attach(ensaddress);
    else
//            ens = await ENSRegistry.deploy();
        return;
    await ens.deployed();
    console.log('ens:'+ens.address);
    if (chainId==4)
        var resolver = PublicResolver.attach(rinkebyEns.resolver);
    else
        if (chainId==1515)
            var resolver = PublicResolver.attach(resolverAddress);
    await resolver.deployed();
    console.log('resolver:'+resolver.address);
    const names=['liwei.beagles.eth'
       // ,'zeliang.eth'
        //,'liwei.eth'
        ,'fichat.eth'];//,'ltc'];
    for (let i=0;i<names.length;i++) {
        let mynode = namehash.hash(names[i]);
        let tld=await ens.owner(namehash.hash(names[i]))
        //if (tld && tld.length>0) {
        if (tld != '0x0000000000000000000000000000000000000000') {
            console.log(names[i] + ' exist',tld);
            let registar = await FIFSRegistrar.attach(tld);
            let resolverAddress=await ens.resolver(namehash.hash(names[i]))
            console.log(names[i]+' resolver:',resolverAddress);
            let email = await resolver.text(namehash.hash(names[i]),'email');
            let nickname = await resolver.text(namehash.hash(names[i]),'nickname');
            let url = await resolver.text(namehash.hash(names[i]),'url');
            console.log('get nickname:',nickname);
            console.log('get email:',email);
            console.log('get url:',nickname);
            if (defaultAccount==tld && nickname.length==0) {
                // this only work for web3js
//              https://web3js.readthedocs.io/en/v1.2.0/web3-eth-contract.html#methods-mymethod-encodeabi
//                await resolver['setAddr(bytes32,address)'](resolverNode, resolver.address,{gasLimit:210000});
//                var textNickname = resolver.contract.methods.setText(mynode, "nickname", names[i]+' is me').encodeABI();
//                var textUrl = resolver.contract.methods.setText(mynode, "url", "https://beagle.chat/"+names[i]).encodeABI();

                // this works for ethers v5 or newer
                var textNickname = resolver.interface.encodeFunctionData("setText",[mynode, "nickname", names[i]+' is me']);
                var textUrl = resolver.interface.encodeFunctionData("setText",[mynode, "url", "https://beagle.chat/"+names[i]]);
                var tx = await resolver.multicall([textNickname, textUrl], {from: defaultAccount,gasLimit:410000});
                let result = await resolver.setText(namehash.hash(names[i]), 'email',  names[i]+'@beagle.chat', {gasLimit: 410000});
                console.log('set email', result);
            }
            else
                console.log('skip set nickname, owner is', tld);
            continue;
        }
        else{
            //registerName(ens,registar,resolver,tlds[i],'beagle',accounts[0]?accounts[0]:defaultAccount);
        }

            continue;
        tld=tlds[i];
        console.log(tld,'registrar deploy ...');
        const registrar = await FIFSRegistrar.deploy(ens.address, namehash.hash(tld),{gasLimit: 410000 });
        await registrar.deployed()
        console.log(tld+' registrar:' + registrar.address);
        await setupRegistrar(ens, tld, registrar);
        // just one time enough
        // const reverseRegistrar = await ReverseRegistrar.deploy(ens.address, resolver.address);
        // await reverseRegistrar.deployed()
        // await setupReverseRegistrar(ens, registrar, reverseRegistrar, accounts);
        // console.log(tld+' reverseRegistrar:' + reverseRegistrar.address);
    }
    return;
    const tlds=['bsc','sol','eth'];//,'ltc'];
    for (let i=0;i<tlds.length;i++) {
        let tld=await ens.owner(namehash.hash(tlds[i]))
        //if (tld && tld.length>0) {
        if (tld != '0x0000000000000000000000000000000000000000') {
            console.log(tlds[i] + ' exist',tld);
            let registar = await FIFSRegistrar.attach(tld);
            await registar.deployed();
            console.log(tlds[i],registar.address);
            registerName(ens,registar,resolver,tlds[i],'beagle',accounts[0]?accounts[0]:defaultAccount);
            continue;
        }
        tld=tlds[i];
        console.log(tld,'registrar deploy ...');
        const registrar = await FIFSRegistrar.deploy(ens.address, namehash.hash(tld),{gasLimit: 410000 });
        await registrar.deployed()
        console.log(tld+' registrar:' + registrar.address);
        await setupRegistrar(ens, tld, registrar);
        // just one time enough
        // const reverseRegistrar = await ReverseRegistrar.deploy(ens.address, resolver.address);
        // await reverseRegistrar.deployed()
        // await setupReverseRegistrar(ens, registrar, reverseRegistrar, accounts);
        // console.log(tld+' reverseRegistrar:' + reverseRegistrar.address);
    }
    var addr = await ens.owner(namehash.hash(`alanch.eth`));//,owner=>{console.log(owner)});
    var ensname = 'alan.eth';
    console.log(ensname+":"+addr);
    ensname = 'alan.sol';
    var addr = await ens.owner(namehash.hash(ensname));//,owner=>{console.log(owner)});
    console.log(name+":"+addr);
    ensname = 'beagles.bsc';
    addr = await ens.owner(namehash.hash(ensname));//,owner=>{console.log(owner)});
    console.log(ensname+":"+addr);
    ensname = 'beagles.sol';
    addr = await ens.owner(namehash.hash(ensname));//,owner=>{console.log(owner)});
    console.log(name+":"+addr);
    ensname = 'beagles.ltc';
    addr = await ens.owner(namehash.hash(ensname));//,owner=>{console.log(owner)});
    console.log(ensname+":"+addr);
    ensname = 'beagles.eth';
    addr = await ens.owner(namehash.hash(ensname));//,owner=>{console.log(owner)});
    console.log(ensname+":"+addr);
    await delay(1000000);
}

async function setupResolver(ens, resolver, accounts) {
    const resolverNode = namehash.hash("resolver");
    const resolverLabel = labelhash("resolver");
    await ens.setSubnodeOwner(ZERO_HASH, resolverLabel, accounts[0]);
    await ens.setResolver(resolverNode, resolver.address);
    await resolver['setAddr(bytes32,address)'](resolverNode, resolver.address);
}

async function setupRegistrar(ens, tld, registrar) {
    console.log('setupRegistar ...',tld)
    await ens.setSubnodeOwner(ZERO_HASH, labelhash(tld), registrar.address);
    console.log('setupRegistar done',tld)
}

async function registerName(ens, registrar,resolver,tld,name,address) {
    const nameNode = namehash.hash(name);
    const nameLabel = labelhash(name);
    var domainname = name+'.'+tld;
    var addr = await ens.owner(namehash.hash(domainname));//,owner=>{console.log(owner)});
    console.log(domainname+"::"+addr);
    if (addr != '0x0000000000000000000000000000000000000000') {
        console.log(domainname + ' exist');
         // const unix_timestamp = await registrar.nameExpires(labelhash(domainname));
         // var date = new Date(unix_timestamp * 1000);
         // console.log(domainname + ' will expire at '+    date.toDateString());
        if (addr!=address){
            console.log(name+'.'+tld+':'+'setSubnodeOwner ...');
            await ens.setSubnodeOwner(namehash.hash(tld),nameLabel, address,{gasLimit: 510000 });
            console.log(name+'.'+tld+':'+'setSubnodeOwner done');
            addr = await ens.owner(namehash.hash(domainname));//,owner=>{console.log(owner)});
            console.log(domainname+":==>："+addr);
        }
        return ;
    }
    console.log('register ...',name+'.'+tld+':'+address);
//    let result = await registrar.register(nameNode,address,{gasLimit: 210000 });
    let result = await registrar.register(nameLabel,address,{gasLimit: 310000 });
    console.log(name+'.'+tld+':'+'register done',result);
    // await ens.setSubnodeOwner(namehash.hash(tld),nameLabel, address,{gasLimit: 210000 });
    // console.log(name+'.'+tld+':'+'setSubnodeOwner done');
    await ens.setResolver(namehash.hash(domainname), resolver.address,{gasLimit: 210000 });
    console.log(name+'.'+tld+':'+'setResolver done');
    await resolver['setAddr(bytes32,address)'](namehash.hash(domainname), resolver.address,{gasLimit: 210000 });
//    await resolver.setAddr(namehash.hash(domainname), address,{gasLimit: 210000 });
    console.log(name+'.'+tld+':'+'setAddr done');
    addr = await ens.owner(namehash.hash(domainname));//,owner=>{console.log(owner)});
    console.log(domainname+":-->："+addr);
}

async function setupReverseRegistrar(ens, registrar, reverseRegistrar, accounts) {
    await ens.setSubnodeOwner(ZERO_HASH, labelhash("reverse"), accounts[0]);
    await ens.setSubnodeOwner(namehash.hash("reverse"), labelhash("addr"), reverseRegistrar.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

/*
E:\work\enstest>npx hardhat run scripts/enstest.js --network rinkeby
account:0x67548a3c43819643390A9Aa5E0BCB284422DEA86
0： undefined
network id：4 0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e rinkeby
ens:0x4Defdf248B10Fd75701C97687aDfDa44022070B2
resolver:0xb3Cf9cE3F38e6b53800E8320159ac9115a73217f
bsc registrar deploy ...
bsc registrar:0xCde5ad1dB6204a94Af1E0f898794B6E9b1A4C55b

E:\work\enstest>npx hardhat run scripts/enstest.js --network rinkeby
account:0x67548a3c43819643390A9Aa5E0BCB284422DEA86
0： undefined
network id：4 0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e rinkeby
ens:0x4Defdf248B10Fd75701C97687aDfDa44022070B2
resolver:0xb3Cf9cE3F38e6b53800E8320159ac9115a73217f
0xc8b831a772a688106f419f1274e13181E3d8497E exist
bsc 0xc8b831a772a688106f419f1274e13181E3d8497E
0xCde5ad1dB6204a94Af1E0f898794B6E9b1A4C55b exist
alan.bsc::0x0000000000000000000000000000000000000000
register alan.bsc:0x67548a3c43819643390A9Aa5E0BCB284422DEA86
sol 0xCde5ad1dB6204a94Af1E0f898794B6E9b1A4C55b
0x1fE1aCC7389F6462BDf9529fE661C15C46d51588 exist
alan.sol::0x0000000000000000000000000000000000000000
register alan.sol:0x67548a3c43819643390A9Aa5E0BCB284422DEA86
eth 0x1fE1aCC7389F6462BDf9529fE661C15C46d51588

ork\enstest>npx hardhat run scripts/enstest.js --network rinkeby
account:0x67548a3c43819643390A9Aa5E0BCB284422DEA86
0： undefined
network id：4 0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e rinkeby
ens:0x4Defdf248B10Fd75701C97687aDfDa44022070B2
resolver:0xb3Cf9cE3F38e6b53800E8320159ac9115a73217f
bsc exist 0xc8b831a772a688106f419f1274e13181E3d8497E
bsc 0xc8b831a772a688106f419f1274e13181E3d8497E
alan.bsc::0x67548a3c43819643390A9Aa5E0BCB284422DEA86
alan.bsc exist
sol exist 0xCde5ad1dB6204a94Af1E0f898794B6E9b1A4C55b
sol 0xCde5ad1dB6204a94Af1E0f898794B6E9b1A4C55b
alan.sol::0x0000000000000000000000000000000000000000
register ... alan.sol:0x67548a3c43819643390A9Aa5E0BCB284422DEA86
eth exist 0x1fE1aCC7389F6462BDf9529fE661C15C46d51588
eth 0x1fE1aCC7389F6462BDf9529fE661C15C46d51588
ltc registrar deploy ...
alan.eth::0x67548a3c43819643390A9Aa5E0BCB284422DEA86
alan.eth exist

 */