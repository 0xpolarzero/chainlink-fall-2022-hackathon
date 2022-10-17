// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import "./ChildContract.sol";
import "hardhat/console.sol";

/**
 * @author polarzero
 * @title Master Contract
 * @notice This is the master contract initializing & referencing all child contracts
 */

contract MasterContract {
    error MasterContract__createContract__EMPTY_FIELD();
    error MasterContract__createContract__INCORRECT_FIELD_LENGTH();
    error MasterContract__createContract__DUPLICATE_ADDRESS();

    mapping(address => ChildContract[]) public childContracts;

    /// Events
    event ChildContractCreated(
        address _owner,
        address indexed _contractAddress,
        string _agreementName,
        string _pdfUri,
        string[] indexed _partyNames,
        string[] _partyTwitterHandles,
        address[] indexed _partyAddresses
    );

    /// Functions

    /**
     * @notice Create a new contract and add it to the list of child contracts
     * @param _agreementName The name of the contract specified by the user
     * @param _pdfUri The URI of the PDF file stored on IPFS
     * @param _partyNames The names of the parties specified by the user
     * @param _partyTwitterHandles The Twitter handles of the parties specified by the user
     * @param _partyAddresses The addresses specified by the user that will be allowed to interact
     * with the contract
     */

    function createContract(
        string memory _agreementName,
        string memory _pdfUri,
        string[] memory _partyNames,
        string[] memory _partyTwitterHandles,
        address[] memory _partyAddresses
    ) public returns (address childContractAddress) {
        // Revert if one of the fields is empty
        if (
            !(bytes(_agreementName).length > 0 &&
                bytes(_pdfUri).length > 0 &&
                _partyNames.length > 0 &&
                _partyAddresses.length > 0)
        ) revert MasterContract__createContract__EMPTY_FIELD();

        // Revert if the number of names, twitter handles and addresses are not equal
        if (
            !(_partyAddresses.length == _partyTwitterHandles.length &&
                _partyAddresses.length == _partyNames.length)
        ) revert MasterContract__createContract__INCORRECT_FIELD_LENGTH();

        // Revert if the same address is used twice
        for (uint256 i = 0; i < _partyAddresses.length; i++) {
            for (uint256 j = i + 1; j < _partyAddresses.length; j++) {
                if (_partyAddresses[i] == _partyAddresses[j])
                    revert MasterContract__createContract__DUPLICATE_ADDRESS();
            }
        }

        // Create a new contract for this letter of intent
        ChildContract childContract = new ChildContract(
            msg.sender,
            _agreementName,
            _pdfUri,
            _partyNames,
            _partyTwitterHandles,
            _partyAddresses
        );
        childContracts[msg.sender].push(childContract);

        emit ChildContractCreated(
            msg.sender,
            address(childContract),
            _agreementName,
            _pdfUri,
            _partyNames,
            _partyTwitterHandles,
            _partyAddresses
        );

        return address(childContract);
    }

    /// Getters

    function getChildContractAddresses(address _owner)
        public
        view
        returns (ChildContract[] memory)
    {
        return childContracts[_owner];
    }

    function getChildContractCount(address _userAddress)
        public
        view
        returns (uint256)
    {
        return childContracts[_userAddress].length;
    }
}
