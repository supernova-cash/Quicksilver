const Qstroller = artifacts.require("Qstroller");
const Unitroller = artifacts.require("Unitroller");
const CToken = artifacts.require("CToken");

module.exports = async function(callback) {
    try {
        console.log("set tokens pause");
        let newTokenPause = {
            "0x77Da11dd27e79b94F80A95F7252139D7b1dF81B3": 1,    // sNULS
            "0x3f8d291bf3081E9aa12c603b13fd53573e31A809": 1,    // sMAN
            "0x894298A6d4b85234CabE81497a89BBcF8d7BD002": 1,    // MAN
        }
        let qsControllerInstance = await Qstroller.at(Unitroller.address);
        for (let ctokenaddr_ in newTokenPause) {
            let cTokenInstance = await CToken.at(ctokenaddr_);
            let tokenName = await cTokenInstance.name();

            await qsControllerInstance._setMintPaused(ctokenaddr_, newTokenPause[ctokenaddr_])
            console.log(tokenName, "MintPaused: ", await qsControllerInstance.mintGuardianPaused(ctokenaddr_))
        }
        callback();
    } catch (e) {
        callback(e);
    }
}
