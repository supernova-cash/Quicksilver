pragma solidity ^0.5.16;

import "../PriceOracle.sol";
import "../CErc20.sol";
import "./IPriceCollector.sol";

contract ElaPriceOracle is PriceOracle, IPriceCollector {
    mapping(address => uint) prices;
    address public priceAdmin;
    event PricePosted(address asset, uint previousPriceMantissa, uint requestedPriceMantissa, uint newPriceMantissa);

    modifier onlyAdmin {
        require(msg.sender == priceAdmin, "Price Admin required.");
        _;
    }

    constructor(address _priceAdmin) public {
        if (_priceAdmin == address(0x0)) {
            priceAdmin = msg.sender;
        } else {
            priceAdmin = _priceAdmin;
        }
    }

    function getUnderlyingPrice(CToken cToken) public view returns (uint) {
        if (compareStrings(cToken.symbol(), "cETH")) {
            return 1e18;
        } else {
            return prices[address(CErc20(address(cToken)).underlying())];
        }
    }

    function setUnderlyingPrice(CToken cToken, uint underlyingPriceMantissa) public onlyAdmin {
        address asset = address(CErc20(address(cToken)).underlying());
        setDirectPrice(asset, underlyingPriceMantissa);
    }

    function setDirectPrice(address asset, uint price) public onlyAdmin {
        emit PricePosted(asset, prices[asset], price, price);
        prices[asset] = price;
    }

    // v1 price oracle interface for use as backing of proxy
    function assetPrices(address asset) external view returns (uint) {
        return prices[asset];
    }

    function compareStrings(string memory a, string memory b) internal pure returns (bool) {
        return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))));
    }
}