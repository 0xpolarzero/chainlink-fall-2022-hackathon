// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

function stringToBytes32(string memory source) pure returns (bytes32 result) {
    if (bytes(source).length == 0) {
        return 0x0;
    }

    assembly {
        result := mload(add(source, 32))
    }
}
