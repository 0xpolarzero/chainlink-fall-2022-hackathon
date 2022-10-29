// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

interface IPromiseFactory {
    function addTwitterVerifiedUser(
        address _userAddress,
        string memory _username
    ) external;
}
