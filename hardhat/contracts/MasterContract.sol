// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import "./ChildContract.sol";

/**
 * @author polarzero
 * @title Master Contract
 * @notice This is the master contract initializing & referencing all child contracts
 */

contract MasterContract {
    /// Types

    mapping(address => ChildContract[]) public childContracts;

    /// Events
    event ContractCreated(
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
     * @param _partyAddresses The addresses specified by the user that will be allowed to interact
     * with the contract
     * @param _partyTwitterHandles The Twitter handles of the parties specified by the user
     */

    function createContract(
        string memory _agreementName,
        string memory _pdfUri,
        string[] memory _partyNames,
        string[] memory _partyTwitterHandles,
        address[] memory _partyAddresses
    ) public {
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

        emit ContractCreated(
            msg.sender,
            address(childContract),
            _agreementName,
            _pdfUri,
            _partyNames,
            _partyTwitterHandles,
            _partyAddresses
        );
    }
}
