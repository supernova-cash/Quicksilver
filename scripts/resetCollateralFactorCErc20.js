const Qstroller = artifacts.require("Qstroller");
const Unitroller = artifacts.require("Unitroller");
const CToken = artifacts.require("CToken");

module.exports = async function(callback) {
    try {
        console.log("start reset collateral factor");
        let newTokenCollateralFactor = {
            "0x81376D428e6D835D7eaFea84503Ac9fb01e6EcbB": 80e16,    // HT
            "0x403a0399B54D932e1df25CAf461D9b5ae34917fF": 80e16,    // USDT
            "0xebd170f721A969A58299887Ede12408f07016D08": 20e16,    // sCASH
            "0x3DB1dEed6b3e67aEe7848BCd3F9C58AA762F441A": 10e16,    // sHT
            "0x0bf22aDf52a7fc41e72ceb1e47205E34AAC1Df65": 10e16,    // sNEO
            "0x5bb335E81a4Fb6f61Cb5a73243F21Fe9789F0eE2": 10e16,    // sFILDA
            "0x315aBbD0eD8F5A5C4d56f2BD9F97eef96325b49F": 10e16,    // sMDX
            "0x551Aed47Ee9D0c589288e0c3392a8E677A3E369C": 0,    // sNULS
            "0x67648aA7c25f1aa74151444052F5ca56fbB5DC70": 0,    // sMAN
            "0x3D57E1ea59a385D8403211408cF4336982476b95": 40e16,    // FILDA
            "0x1d6Cc73a2a0486d95260e8557b314537dd66eC15": 40e16,    // MDX
            "0x84D0401956f9265449B0B6794ED32283ce75755c": 40e16,    // MAN
            "0xf16d50407E97c60A059db55610b3C25828aFB341": 40e16,    // NULs
            "0x0FF521fC12E23998013c5Da168bb5bdf0011209B": 40e16,    // PNEO
        }
        let qsControllerInstance = await Qstroller.at(Unitroller.address);
        for (let ctokenaddr_ in newTokenCollateralFactor) {
            let cTokenInstance = await CToken.at(ctokenaddr_);
            let tokenName = await cTokenInstance.name();

            await qsControllerInstance._setCollateralFactor(ctokenaddr_, newTokenCollateralFactor[ctokenaddr_].toString());
            console.log("%s %s set collateral factor %s", tokenName, ctokenaddr_, newTokenCollateralFactor[ctokenaddr_].toString());
        }
        callback();
    } catch (e) {
        callback(e);
    }
}