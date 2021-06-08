// const InterestModel = artifacts.require("DefaultHecoInterestModel");
const CToken = artifacts.require("CToken");
const reserveFactor = 0.15e18.toString();
const Qstroller = artifacts.require("Qstroller");

const collateralFactor = 40e16;

const argv = require('yargs').argv;
const interestModelAddress = "0x0Ea2372497A4A73CC8A11766489E3EF84027835E";
const newQscontrollerAddress = "0x8A7586f46a281900b41744D30859Bdd66d428072";

async function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time * 1000));
}

module.exports = async function(callback) {
    try {
        // 迁移币到新的借贷中心
        console.log(`argv> market=${argv.market}`);
        let cTokenInstance = await CToken.at(argv.market);
        let cTokenName = await cTokenInstance.name();
        let oldInterestModelAddr = await cTokenInstance.interestRateModel();
        let oldclAddr = await cTokenInstance.comptroller();

        let qsControllerInstance = await Qstroller.at(newQscontrollerAddress);

        // // exchange
        console.log("exchange");
        await cTokenInstance._setInterestRateModel(interestModelAddress);
        console.log("exchange1");
        await cTokenInstance._setReserveFactor(reserveFactor);
        console.log("exchange2");

        await cTokenInstance._setComptroller(newQscontrollerAddress);
        console.log("exchange3");

        await sleep(10);
        console.log("exchange4");

        await qsControllerInstance._supportMarket(cTokenInstance.address);
        console.log(`Done to support market ${cTokenInstance.symbol()}: ${cTokenInstance.address}`);

        await qsControllerInstance._setCollateralFactor(cTokenInstance.address, collateralFactor.toString());
        console.log("Done to set collateral factor %s for %s %s", collateralFactor.toString(), cTokenInstance.symbol(), cTokenInstance.address);

        await qsControllerInstance._setMintPaused(cTokenInstance.address, false);
        console.log("MintPaused: ", await qsControllerInstance.mintGuardianPaused(cTokenInstance.address));

        // show
        let newInterestModelAddr = await cTokenInstance.interestRateModel();
        console.log(`oldInterestModel ${oldInterestModelAddr} is replaced with newInterestModel: ${newInterestModelAddr} for token ${cTokenName} : ${cTokenInstance.address}`);
        let newclAddr = await cTokenInstance.comptroller();
        console.log(`oldclAddr ${oldclAddr} is replaced with newclAddr: ${newclAddr} for token ${cTokenName} : ${cTokenInstance.address}`);
        callback();
    } catch (e) {
        console.log(e);
        callback(e);
    }
}