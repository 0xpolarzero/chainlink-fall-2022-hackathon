// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import "hardhat/console.sol";

/**
 * @author polarzero
 * @title Child Contract
 * @notice This is the child contract generated by the master contract
 * once a user creates a new agreement
 */

contract ChildContract {
    /// Errors
    error ChildContract__NOT_PARTICIPANT();
    error ChildContract__AGREEMENT_LOCKED();
    error ChildContract__approveAgreement__ALREADY_APPROVED();
    error ChildContract__lockAgreement__PARTICIPANT_NOT_APPROVED();

    /// Types
    struct Participant {
        string participantName;
        string participantTwitterHandle;
        address participantAddress;
    }

    /// Variables
    uint256 public s_participantCount;
    string public s_promiseName;
    string public s_pdfUri;
    address public immutable i_owner;
    address[] public s_participantAddresses;
    bool public s_agreementLocked = false;

    // Mapping of addresses to name & twitter handle
    mapping(address => Participant) public s_parties;
    // Mapping of addresses to whether or not they have approved the agreement
    mapping(address => bool) public s_approvedParties;

    /// Events
    event ParticipantCreated(
        string participantName,
        string participantTwitterHandle,
        address indexed participantAddress
    );

    event ParticipantApproved(
        string participantName,
        string participantTwitterHandle,
        address indexed participantAddress
    );

    event AgreementLocked();

    /// Modifiers
    modifier onlyParticipant() {
        address[] memory participantAddresses = s_participantAddresses;
        bool isParticipant = false;

        // The owner will probably interact more with the contract
        // So we can save some gas by checking it first
        if (i_owner == msg.sender) {
            isParticipant = true;
        } else {
            // Loop through the parties and check if the sender is a party
            for (uint256 i = 0; i < s_participantCount; i++) {
                if (participantAddresses[i] == msg.sender) {
                    isParticipant = true;
                    break;
                }
            }
        }

        if (!isParticipant) revert ChildContract__NOT_PARTICIPANT();
        _;
    }

    modifier onlyUnlocked() {
        if (s_agreementLocked) revert ChildContract__AGREEMENT_LOCKED();
        _;
    }

    /// Functions
    /**
     * @dev Initialize the contract from the Master Contract with the user address as the owner
     */

    constructor(
        address _owner,
        string memory _promiseName,
        string memory _pdfUri,
        string[] memory _partyNames,
        string[] memory _partyTwitterHandles,
        address[] memory _partyAddresses
    ) {
        i_owner = _owner;
        s_promiseName = _promiseName;
        s_pdfUri = _pdfUri;
        s_participantCount = _partyAddresses.length;

        for (uint256 i = 0; i < _partyAddresses.length; i++) {
            _createParticipant(
                _partyNames[i],
                _partyTwitterHandles[i],
                _partyAddresses[i]
            );
        }
    }

    /**
     * @notice Approve the agreement as a participant
     */

    function approveAgreement() public onlyParticipant onlyUnlocked {
        if (s_approvedParties[msg.sender] == true) {
            revert ChildContract__approveAgreement__ALREADY_APPROVED();
        }

        s_approvedParties[msg.sender] = true;
        emit ParticipantApproved(
            s_parties[msg.sender].participantName,
            s_parties[msg.sender].participantTwitterHandle,
            msg.sender
        );
    }

    /**
     * @notice Validate the agreement and lock it so that no more participants can change any state
     * or even try to and lose gas
     */

    function lockAgreement() public onlyParticipant onlyUnlocked {
        address[] memory participantAddresses = s_participantAddresses;

        // Loop through the parties and check if anyone has not approved yet
        for (uint256 i = 0; i < s_participantCount; i++) {
            if (s_approvedParties[participantAddresses[i]] == false) {
                console.log(participantAddresses[i]);
                revert ChildContract__lockAgreement__PARTICIPANT_NOT_APPROVED();
            }
        }

        s_agreementLocked = true;
        emit AgreementLocked();
    }

    /**
     * @notice Create a new participant and add them to the mapping
     * @dev This function can only be called during the contract creation
     * @param _participantName The name of the participant
     * @param _participantTwitterHandle The twitter handle of the participant
     * @param _participantAddress The address of the participant
     */

    function _createParticipant(
        string memory _participantName,
        string memory _participantTwitterHandle,
        address _participantAddress
    ) private {
        Participant memory participant = Participant(
            _participantName,
            _participantTwitterHandle,
            _participantAddress
        );
        s_parties[_participantAddress] = participant;
        s_participantAddresses.push(_participantAddress);

        emit ParticipantCreated(
            _participantName,
            _participantTwitterHandle,
            _participantAddress
        );
    }

    /// Getters
    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getName() public view returns (string memory) {
        return s_promiseName;
    }

    function getPdfUri() public view returns (string memory) {
        return s_pdfUri;
    }

    function getParticipant(address _participantAddress)
        public
        view
        returns (Participant memory)
    {
        if (s_parties[_participantAddress].participantAddress == address(0)) {
            revert ChildContract__NOT_PARTICIPANT();
        }

        return s_parties[_participantAddress];
    }

    function getParticipantCount() public view returns (uint256) {
        return s_participantCount;
    }

    function getParticipantAddresses() public view returns (address[] memory) {
        return s_participantAddresses;
    }

    function getIsAgreementApproved(address _participantAddress)
        public
        view
        returns (bool)
    {
        return s_approvedParties[_participantAddress];
    }

    function getIsAgreementLocked() public view returns (bool) {
        return s_agreementLocked;
    }
}
