const SimplePriceOracle = artifacts.require("QsSimplePriceOracle");
const InterestModel = artifacts.require("WhitePaperInterestRateModel");
const Qstroller = artifacts.require("Qstroller");
const sELA = artifacts.require("CEther");
const erc20Delegate = artifacts.require("CErc20Delegate");
const erc20Delegator = artifacts.require("CErc20Delegator");
const Unitroller = artifacts.require("Unitroller");
const CompoundLens = artifacts.require("CompoundLens");
const QsPriceOracle = artifacts.require("QsPriceOracle");

// Mock Tokens
const TetherToken = artifacts.require("TetherToken");
const HFILToken = artifacts.require("HFILToken");
const ETHToken = artifacts.require("ETHToken");

// Parameters
const closeFactor = 0.5e18.toString();
const liquidationIncentive = 1.13e18.toString();
const compRate = 0.5e18.toString();
    
const maxAssets = 10;

module.exports = async function(deployer, network) {
    await deployer.deploy(Unitroller);
    await deployer.deploy(Qstroller);
    await deployer.deploy(CompoundLens);
    await deployer.deploy(QsPriceOracle);

    let unitrollerInstance = await Unitroller.deployed();
    let comptrollerInstance = await Qstroller.deployed();
    let admin = await comptrollerInstance.admin();
    console.log("admin: ", admin);

    await unitrollerInstance._setPendingImplementation(Qstroller.address);
    await comptrollerInstance._become(Unitroller.address);
    await deployer.deploy(InterestModel, "20000000000000000", "200000000000000000");
    await deployer.deploy(sELA, Unitroller.address, InterestModel.address, "20000000000000000", "QuickSilver ELA", "sELA", 18, admin);

    let proxiedComptrollerContract = new web3.eth.Contract(comptrollerInstance.abi, unitrollerInstance.address);
    console.log("admin: ", await proxiedComptrollerContract.methods.admin().call());

    let setPriceOracle = proxiedComptrollerContract.methods._setPriceOracle(QsPriceOracle.address).encodeABI();
    await sendTx(admin, unitrollerInstance.address, setPriceOracle);
    console.log("Done to set price oracle.")

    let setMaxAssets = proxiedComptrollerContract.methods._setMaxAssets(maxAssets).encodeABI();
    await sendTx(admin, unitrollerInstance.address, setMaxAssets);
    console.log("Done to set max assets.")

    let supportELA = proxiedComptrollerContract.methods._supportMarket(sELA.address).encodeABI();
    await sendTx(admin, unitrollerInstance.address, supportELA);
    console.log("Done to support market: ", sELA.address);

    let elaCollateralFactor = 0.15e18.toString();
    await proxiedComptrollerContract.methods._setCollateralFactor(sELA.address, elaCollateralFactor).send({from: admin, gas: 3000000});
    console.log("Done to set collateral factor %s for %s", elaCollateralFactor, sELA.address);

    await proxiedComptrollerContract.methods._setLiquidationIncentive(liquidationIncentive).send({from: admin, gas: 3000000});
    console.log("Done to set liquidation incentive.");
    let incentive = await proxiedComptrollerContract.methods.liquidationIncentiveMantissa().call();
    console.log("New incentive: ", incentive);

    await proxiedComptrollerContract.methods._addCompMarkets([sELA.address]).send({from: admin, gas: 3000000});
    console.log("Done to add comp market.");

    await proxiedComptrollerContract.methods._setCompRate(compRate).send({from: admin, gas: 3000000});
    console.log("Done to set comp rate.");

    await proxiedComptrollerContract.methods._setCloseFactor(closeFactor).send({from: admin, gas: 3000000});
    console.log("Done to set comp rate.");

    // await proxiedComptrollerContract.methods._setCompToken(CompToken.address).send({from: admin, gas: 3000000});
    // console.log("Done to set comp token.");

    if (network == "development" || network == "ethdev") {
        let compImpl = await unitrollerInstance.comptrollerImplementation();
        console.log("compImpl: " + compImpl);
        // let compTokenInstance = await CompToken.deployed();

        await deployer.deploy(SimplePriceOracle);

        // Handle Mocked USDT
        await deployer.deploy(TetherToken, "1000000000000000", "Tether USD", "USDT", 6);
        await deployer.deploy(erc20Delegate);
        await deployer.deploy(erc20Delegator, TetherToken.address, Unitroller.address, InterestModel.address, "20000", "QuickSilver USDT", "sUSDT", 18, admin, erc20Delegate.address, "0x0");
        const sUSDT = erc20Delegator;
        let supportUSDT = proxiedComptrollerContract.methods._supportMarket(sUSDT.address).encodeABI();
        await sendTx(admin, unitrollerInstance.address, supportUSDT);
        let usdtCollateralFactor = 0.8e18.toString();
        await proxiedComptrollerContract.methods._setCollateralFactor(sUSDT.address, usdtCollateralFactor).send({from: admin, gas: 3000000});
        console.log("Done to set collateral factor %s for %s", usdtCollateralFactor, sUSDT.address);

        // Handle Mocked HFIL
        await deployer.deploy(HFILToken);
        await deployer.deploy(erc20Delegate);
        await deployer.deploy(erc20Delegator, HFILToken.address, Unitroller.address, InterestModel.address, "20000000000000000", "QuickSilver HFIL", "sHFIL", 18, admin, erc20Delegate.address, "0x0");
        const sHFIL = erc20Delegator;
        let supportHFIL = proxiedComptrollerContract.methods._supportMarket(sHFIL.address).encodeABI();
        await sendTx(admin, unitrollerInstance.address, supportHFIL);
        let hfilCollateralFactor = 0.5e18.toString();
        await proxiedComptrollerContract.methods._setCollateralFactor(sHFIL.address, hfilCollateralFactor).send({from: admin, gas: 3000000});
        console.log("Done to set collateral factor %s for %s", hfilCollateralFactor, sHFIL.address);

        // Handle Mocked ETH
        await deployer.deploy(ETHToken);
        await deployer.deploy(erc20Delegate);
        await deployer.deploy(erc20Delegator, TetherToken.address, Unitroller.address, InterestModel.address, "20000000000000000", "QuickSilver ETH", "sETH", 18, admin, erc20Delegate.address, "0x0");
        const sETHElastos = erc20Delegator;
        let supportETHElastos = proxiedComptrollerContract.methods._supportMarket(sETHElastos.address).encodeABI();
        await sendTx(admin, unitrollerInstance.address, supportETHElastos);
        let ETHElastosCollateralFactor = 0.5e18.toString();
        await proxiedComptrollerContract.methods._setCollateralFactor(sETHElastos.address, ETHElastosCollateralFactor).send({from: admin, gas: 3000000});
        console.log("Done to set collateral factor %s for %s", ETHElastosCollateralFactor, sETHElastos.address);

        let allSupportedMarkets = await proxiedComptrollerContract.methods.getAllMarkets().call();
        console.log(allSupportedMarkets);

        await proxiedComptrollerContract.methods._setCloseFactor(closeFactor).send({from: admin, gas: 3000000});
        console.log("Done to set comp rate.");

        await proxiedComptrollerContract.methods._setPriceOracle(SimplePriceOracle.address).send({from: admin, gas: 3000000});
        console.log("Done to update price oracle.");
        // let tetherTokenInstance = await TetherToken.deployed();
        // let tetherTokenContract = new web3.eth.Contract(tetherTokenInstance.abi, tetherTokenInstance.address);
        // await tetherTokenContract.methods.approve(sUSDT.address, 1000000000).send({from: admin});
        // let sUSDTInstance = await sUSDT.deployed();
        // let sUSDTContract = new web3.eth.Contract(sUSDTInstance.abi, sUSDTInstance.address);
        // await sUSDTContract.methods.mint(1000000000).send({from: admin, gas: 8000000});
        // let cash = await sUSDTContract.methods.totalSupply().call();
        // console.log(cash);

        // let sELAInstance = await sELA.deployed();
        // let sELAContract = new web3.eth.Contract(sELAInstance.abi, sELAInstance.address);
        // await sELAContract.methods.mint().send({from: admin, gas: 8000000, value: 1e18});
        //
        // await proxiedComptrollerContract.methods.refreshCompSpeeds().send({from: admin, gas: 3000000});;
        //
        // await proxiedComptrollerContract.methods.enterMarkets([sELA.address, sUSDT.address]).send({from: admin, gas: 8000000});
        // let accountLiquidity = await proxiedComptrollerContract.methods.getAccountLiquidity(admin).call();
        // console.log("Account Liquidity: ", accountLiquidity);
        //
        // await sUSDTContract.methods.borrow(1000000).send({from: admin, gas: 8000000});
        // let borrowBalance = await sUSDTContract.methods.borrowBalanceCurrent(admin).call();
        // console.log("borrowBalance: ", borrowBalance);
        //
        // await proxiedComptrollerContract.methods.refreshCompSpeeds().send({from: admin, gas: 3000000});;
        //
        // let accountLiquidity2 = await proxiedComptrollerContract.methods.getAccountLiquidity(admin).call();
        // console.log("Account Liquidity: ", accountLiquidity2);
        // await sUSDTContract.methods.borrow(1000000).send({from: admin, gas: 8000000});
        // let borrowBalance2 = await sUSDTContract.methods.borrowBalanceCurrent(admin).call();
        // console.log("borrowBalance2: ", borrowBalance2);
        //
        // let compTotalSupply = await compTokenInstance.totalSupply();
        // let compTotal = await compTotalSupply.toString();
        // console.log("Comp Token total supply: ", compTotal);
        // let compAmount = await compTokenInstance.balanceOf(admin);
        // console.log("Comp Token Balance: ", await compAmount.toString());
        //
        // let compAccrued = await proxiedComptrollerContract.methods.compAccrued(admin).call();
        // console.log("compAccrued: ", compAccrued);
        // let compSpeeds = await proxiedComptrollerContract.methods.compSpeeds(sUSDT.address).call();
        // console.log("compSpeeds: ", compSpeeds);
    }

    if (network == "kovan" || network == "ropsten") {
        await deployer.deploy(MockPriceOracle);
        await deployer.deploy(TetherToken, "1000000000000000", "Tether USD", "USDT", 6);

        await deployer.deploy(erc20Delegate);
        await deployer.deploy(erc20Delegator, TetherToken.address, Unitroller.address, InterestModel.address, "10000000", "QuickSilver USDT", "sUSDT", 18, admin, erc20Delegate.address, "0x0");
        const sUSDT = erc20Delegator;

        let supportUSDT = proxiedComptrollerContract.methods._supportMarket(sUSDT.address).encodeABI();
        await sendTx(admin, unitrollerInstance.address, supportUSDT);
        console.log("Done to support market: ", sUSDT.address);

        let allSupportedMarkets = await proxiedComptrollerContract.methods.getAllMarkets().call();
        console.log("allSupportedMarkets: ", allSupportedMarkets);
    }

    if (network == "elaeth") {
        let allSupportedMarkets = await proxiedComptrollerContract.methods.getAllMarkets().call();
        console.log("allSupportedMarkets: ", allSupportedMarkets);
    }
};

function sendTx(fromAddress, toAddress, data) {
    web3.eth.sendTransaction({
        from: fromAddress,
        to: toAddress,
        gas: 6000000,
        gasPrice: 5000000000,
        data: data,
        value: 0
    });
}
