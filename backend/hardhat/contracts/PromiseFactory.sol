// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import "./PromiseContract.sol";
import "hardhat/console.sol";

/**
 * @author polarzero
 * @title Master Contract
 * @notice This is the master contract initializing & referencing all child contracts
 */

contract PromiseFactory {
    /// Errors
    error PromiseFactory__createPromiseContract__EMPTY_FIELD();
    error PromiseFactory__createPromiseContract__INCORRECT_FIELD_LENGTH();
    error PromiseFactory__createPromiseContract__DUPLICATE_FIELD();
    error PromiseFactory__createPromiseContract__INVALID_URI();

    // Map the owner addresses to the child contracts they created
    mapping(address => PromiseContract[]) public promiseContracts;

    /// Events
    event PromiseContractCreated(
        address indexed _owner,
        address indexed _contractAddress,
        string _promiseName,
        string _pdfUri,
        string[] _partyNames,
        string[] _partyTwitterHandles,
        address[] _partyAddresses
    );

    /// Functions
    /**
     * @notice Create a new contract and add it to the list of child contracts
     * @param _promiseName The name of the contract specified by the user
     * @param _pdfUri The URI of the PDF file stored on IPFS
     * @param _partyNames The names of the parties specified by the user
     * @param _partyTwitterHandles The Twitter handles of the parties specified by the user
     * @param _partyAddresses The addresses specified by the user that will be allowed to interact
     * with the contract
     */

    function createPromiseContract(
        string memory _promiseName,
        string memory _pdfUri,
        string[] memory _partyNames,
        string[] memory _partyTwitterHandles,
        address[] memory _partyAddresses
    ) public returns (address promiseContractAddress) {
        // Revert if one of the fields is empty
        if (
            !(bytes(_promiseName).length > 0 &&
                bytes(_pdfUri).length > 0 &&
                _partyNames.length > 0 &&
                _partyAddresses.length > 0)
        ) revert PromiseFactory__createPromiseContract__EMPTY_FIELD();

        // Revert if the number of names, Twitter and addresses are not equal
        // If Twitter handles are not provided, it will pass an empty string
        if (
            !(_partyAddresses.length == _partyTwitterHandles.length &&
                _partyAddresses.length == _partyNames.length)
        )
            revert PromiseFactory__createPromiseContract__INCORRECT_FIELD_LENGTH();

        // Revert if the same address or twitter handle is used twice
        for (uint256 i = 0; i < _partyAddresses.length; i++) {
            for (uint256 j = i + 1; j < _partyAddresses.length; j++) {
                if (
                    _partyAddresses[i] == _partyAddresses[j] ||
                    keccak256(abi.encodePacked(_partyTwitterHandles[i])) ==
                    keccak256(abi.encodePacked(_partyTwitterHandles[j]))
                )
                    revert PromiseFactory__createPromiseContract__DUPLICATE_FIELD();
            }
        }

        // We could test the validity of the Twitter handles here, but it would not really matter
        // since it won't have any value without being verified, and the verification already
        // needs it to be valid

        // Revert if the name of the promise is longer than 70 characters
        if (bytes(_promiseName).length > 70) {
            revert PromiseFactory__createPromiseContract__INCORRECT_FIELD_LENGTH();
        }

        // Check if the provided URI is a valid IPFS URI
        bytes memory pdfUriBytes = bytes(_pdfUri);

        // Minimum 5 bytes encoded in Base58 -> minimum 7 characters
        if (!(pdfUriBytes.length > 6))
            revert PromiseFactory__createPromiseContract__INVALID_URI();

        // It should match the allowed characters in Base58
        for (uint i = 0; i < pdfUriBytes.length; i++) {
            if (
                !(0x7ffeffe07ff7dfe03fe000000000000 &
                    (uint(1) << uint8(pdfUriBytes[i])) >
                    0)
            ) {
                revert PromiseFactory__createPromiseContract__INVALID_URI();
            }
        }

        // Create a new contract for this promise
        PromiseContract promiseContract = new PromiseContract(
            msg.sender,
            _promiseName,
            _pdfUri,
            _partyNames,
            _partyTwitterHandles,
            _partyAddresses
        );
        promiseContracts[msg.sender].push(promiseContract);

        emit PromiseContractCreated(
            msg.sender,
            address(promiseContract),
            _promiseName,
            _pdfUri,
            _partyNames,
            _partyTwitterHandles,
            _partyAddresses
        );

        return address(promiseContract);
    }

    /// Getters
    function getPromiseContractAddresses(address _owner)
        public
        view
        returns (PromiseContract[] memory)
    {
        return promiseContracts[_owner];
    }

    function getPromiseContractCount(address _userAddress)
        public
        view
        returns (uint256)
    {
        return promiseContracts[_userAddress].length;
    }
}
