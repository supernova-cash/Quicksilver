const Qstroller = artifacts.require("Qstroller");
const Unitroller = artifacts.require("Unitroller");
const CToken = artifacts.require("CToken");

module.exports = async function(callback) {
    try {
        let unitrollerInstance = await Unitroller.deployed();
        let proxiedQstroller = await Qstroller.at(unitrollerInstance.address);
        let allSupportedMarkets = await proxiedQstroller.getAllMarkets();
        let tokens = [];
        let compSpeeds = [];
        for (market of allSupportedMarkets) {
            let cTokenInstance = await CToken.at(market);
            let cTokenName = await cTokenInstance.name();
            let compSpeed = await proxiedQstroller.compSpeeds(market);
            let mintPaused = await proxiedQstroller.mintGuardianPaused(market)
            console.log(`${cTokenName} ${market} mintPaused: ${mintPaused}`);
            // if (compSpeed <= 0) continue;
            // let maxAssets = await proxiedQstroller.maxAssets();
            // let AssetsIn = await proxiedQstroller.getAssetsIn("0xFE7b30C1f83077C9A7723A54EbAd3CB0cD242CaD");
            // let checkMembership = await proxiedQstroller.checkMembership("0xFE7b30C1f83077C9A7723A54EbAd3CB0cD242CaD", );
            // checkMembership(address account, CToken cToken)
            let marketState = await proxiedQstroller.markets(market);
            let collateralRatio = marketState['collateralFactorMantissa'].toString();
            // let collateralRatio = marketState['isListed'].toString();
            // let collateralRatio = marketState['accountMembership'].toString();
            console.log(`${cTokenName} ${market} collateralFactor: ${collateralRatio}`);
        }
        callback();
    } catch (e) {
        console.log(e);
        callback(e);
    }
}