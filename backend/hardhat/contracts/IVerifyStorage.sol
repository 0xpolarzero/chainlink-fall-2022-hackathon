// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

interface IVerifyStorage {
    function requestStorageStatusUpdate(
        address _promiseContractAddress,
        address _userAddress,
        string memory _ipfsHash,
        string memory _arweaveId,
        string memory _encryptedProof
    ) external;
}
