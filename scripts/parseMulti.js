const Qstroller = artifacts.require("Qstroller");
const Unitroller = artifacts.require("Unitroller");
const CToken = artifacts.require("CToken");

module.exports = async function(callback) {
    try {
        console.log("set tokens pause");
        let newTokenPause = {
            "0x551Aed47Ee9D0c589288e0c3392a8E677A3E369C": 0,    // sNULS
            "0x67648aA7c25f1aa74151444052F5ca56fbB5DC70": 0,    // sMAN
            "0x84D0401956f9265449B0B6794ED32283ce75755c": 0,    // MAN
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
