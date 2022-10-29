// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";

contract ConfirmedOwnerTestHelper is ConfirmedOwner {
    event Here();

    constructor() ConfirmedOwner(msg.sender) {}

    function modifierOnlyOwner() public onlyOwner {
        emit Here();
    }
}
