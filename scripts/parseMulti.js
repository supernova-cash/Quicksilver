const Qstroller = artifacts.require("Qstroller");
const Unitroller = artifacts.require("Unitroller");
const CToken = artifacts.require("CToken");

module.exports = async function(callback) {
    try {
        console.log("set tokens pause");
        // // heco
        // let newTokenPause = {
        //     "0x551Aed47Ee9D0c589288e0c3392a8E677A3E369C": 0,    // sNULS
        //     "0x67648aA7c25f1aa74151444052F5ca56fbB5DC70": 0,    // sMAN
        //     "0x84D0401956f9265449B0B6794ED32283ce75755c": 0,    // MAN
        // }
        // ESC
        let newTokenPause = {
            "0x33882026a197Ddab2f60926acEa64647BC8608E3": 0,    // ELA
            "0x566A2e4e1C1275E397B79884D3CA5aAF02fd70B9": 0,    // USDT
            "0x4998F5D04ba8ae05e557531898B3fC71a40ef46B": 0,    // FILDA
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
