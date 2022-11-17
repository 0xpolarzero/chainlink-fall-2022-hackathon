// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import "@chainlink/contracts/src/v0.8/interfaces/LinkTokenInterface.sol";
import "./PromiseContract.sol";
import "./IVerifyStorage.sol";

/**
 * @author polarzero
 * @title MockPromiseFactory
 * @notice This is the factory contract initializing & referencing all promises
 * @dev This contract is the only one that can create new promises
 * For a successful flow, the following steps are recommended:
 * 1. Deploy the PromiseFactory contract
 * 2. Deploy the verifiers (VerifyStorage, VerifyTwitter)
 * 3. Set the verifiers in the PromiseFactory contract
 * 4. Fund the verifiers with LINK
 * 5. Deploy a new promise contract
 * * Only via the App can the promises be successfully verified by the VerifyStorage contract
 * * If you want to reproduce this verification, you will need your own External Adapter,
 * * and an interface that both encrypt/decrypt the IPFS & Arweave hashes with the same
 * * encryption key. More details in the documentation.
 * @dev This contract is identical to the PromiseFactory contract, except that it
 * doesn't actually make a request to the VerifyStorage contract on a promise creation
 */

contract MockPromiseFactory {
    /// Errors
    error PromiseFactory__EMPTY_FIELD();
    error PromiseFactory__INCORRECT_FIELD_LENGTH();
    error PromiseFactory__createPromiseContract__DUPLICATE_FIELD();
    error PromiseFactory__addParticipant__NOT_PARTICIPANT();
    error PromiseFactory__addParticipant__ALREADY_PARTICIPANT();
    error PromiseFactory__NOT_OWNER();
    error PromiseFactory__NOT_VERIFIER();

    /// Variables
    address private immutable i_owner;
    // The VerifyTwitter contract
    address private s_twitterVerifier;
    // The VerifyStorage contract
    address private s_storageVerifier;

    // Map the owner addresses to the child contracts they created
    mapping(address => PromiseContract[]) private s_promiseContracts;

    // Map the user addresses to their verified Twitter account(s)
    mapping(address => string[]) private s_twitterVerifiedUsers;

    /// Events
    // Emitted when a new PromiseContract is created
    event PromiseContractCreated(
        address indexed _owner,
        address indexed _contractAddress,
        string _promiseName,
        string _ipfsCid,
        string _arweaveId,
        string encryptedProof,
        string[] _partyNames,
        string[] _partyTwitterHandles,
        address[] _partyAddresses
    );

    // Emitted when a user was successfully verified by the VerifyTwitter contract
    event TwitterAddVerifiedSuccessful(
        address indexed _owner,
        string _twitterHandle
    );

    // Emitted when a user was added to a PromiseContract
    event ParticipantAdded(
        address indexed _contractAddress,
        string _participantName,
        string _participantTwitterHandle,
        address _participantAddress
    );

    // Emitted when a contract has just been created
    // and a storage update request was sent to the VerifyStorage contract
    event StorageStatusUpdateRequested(address promiseContract);

    // Emitted when the storage status has been updated (to 1 - 3)
    event StorageStatusUpdated(
        address indexed _contractAddress,
        uint8 _storageStatus
    );

    /// Modifiers
    modifier onlyOwner() {
        // msg sender should be the deployer of the contract
        if (msg.sender != i_owner) {
            revert PromiseFactory__NOT_OWNER();
        }
        _;
    }

    modifier onlyTwitterVerifier() {
        if (msg.sender != s_twitterVerifier) {
            revert PromiseFactory__NOT_VERIFIER();
        }
        _;
    }

    modifier onlyStorageVerifier() {
        if (msg.sender != s_storageVerifier) {
            revert PromiseFactory__NOT_VERIFIER();
        }
        _;
    }

    /// Functions

    /**
     * @notice Initialize the contract
     */

    constructor() {
        i_owner = msg.sender;
    }

    /**
     * @notice Create a new contract and add it to the list of child contracts
     * @param _promiseName The name of the contract specified by the user
     * @param _ipfsCid The CID of the directory stored on IPFS
     * @param _arweaveId The ID of the zip stored on Arweave
     * @param _encryptedProof The encrypted string of the promise name, user
     * address, IPFS and Arweave hashes
     * @param _partyNames The names of the parties specified by the user
     * @param _partyTwitterHandles The Twitter handles of the parties specified by the user
     * @param _partyAddresses The addresses specified by the user that will be allowed to interact
     * with the contract
     */

    function createPromiseContract(
        string memory _promiseName,
        string memory _ipfsCid,
        string memory _arweaveId,
        string memory _encryptedProof,
        string[] memory _partyNames,
        string[] memory _partyTwitterHandles,
        address[] memory _partyAddresses
    ) public returns (address promiseContractAddress) {
        // Revert if one of the fields is empty
        if (
            !(bytes(_promiseName).length > 0 &&
                bytes(_ipfsCid).length > 0 &&
                _partyNames.length > 0 &&
                _partyTwitterHandles.length > 0 &&
                _partyAddresses.length > 0)
        ) revert PromiseFactory__EMPTY_FIELD();

        // Revert if the number of names, Twitter and addresses are not equal
        // If Twitter handles are not provided, it will pass an empty string
        if (
            !(_partyAddresses.length == _partyTwitterHandles.length &&
                _partyAddresses.length == _partyNames.length)
        ) revert PromiseFactory__INCORRECT_FIELD_LENGTH();

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
            revert PromiseFactory__INCORRECT_FIELD_LENGTH();
        }

        // We don't need to check the length of the Twitter handles
        // If any were to be invalid, they would fail to get verified

        // We can't make sure the provided CID is valid,
        // because it could be provided either in a Base58 or Base32 format
        // but it will be shown in the UI

        // Create a new contract for this promise
        PromiseContract promiseContract = new PromiseContract(
            msg.sender,
            _promiseName,
            _ipfsCid,
            _arweaveId,
            _encryptedProof,
            _partyNames,
            _partyTwitterHandles,
            _partyAddresses
        );
        s_promiseContracts[msg.sender].push(promiseContract);

        emit PromiseContractCreated(
            msg.sender,
            address(promiseContract),
            _promiseName,
            _ipfsCid,
            _arweaveId,
            _encryptedProof,
            _partyNames,
            _partyTwitterHandles,
            _partyAddresses
        );

        // Pretend that a storage status update is requested
        // to the VerifyStorage contract
        // ! Here is the only difference with PromiseFactory.sol
        emit StorageStatusUpdateRequested(address(promiseContract));

        return address(promiseContract);
    }

    /**
     * @notice Add a participant to a promise contract
     * @dev Only a participant of the contract can call this function
     * @dev It can only be called if the contract is not locked (the child contract takes care of that)
     * @param _promiseContractAddress The address of the promise contract
     * @param _partyName The name of the party
     * @param _partyTwitterHandle The Twitter handle of the party
     * @param _partyAddress The address of the party
     */

    function addParticipant(
        address _promiseContractAddress,
        string memory _partyName,
        string memory _partyTwitterHandle,
        address _partyAddress
    ) public {
        // Revert if the sender is not a participant of the contract
        if (
            !PromiseContract(_promiseContractAddress).getIsParticipant(
                msg.sender
            )
        ) {
            revert PromiseFactory__addParticipant__NOT_PARTICIPANT();
        }

        // Revert if the user to add is already a participant of the contract
        if (
            PromiseContract(_promiseContractAddress).getIsParticipant(
                _partyAddress
            )
        ) {
            revert PromiseFactory__addParticipant__ALREADY_PARTICIPANT();
        }

        // Revert if the name of the party is longer than 30 characters
        if (bytes(_partyName).length > 30) {
            revert PromiseFactory__INCORRECT_FIELD_LENGTH();
        }

        // Add the participant to the contract and emit an event if successful
        PromiseContract(_promiseContractAddress).createParticipant(
            _partyName,
            _partyTwitterHandle,
            _partyAddress,
            true // Reset the approval status
        );

        emit ParticipantAdded(
            _promiseContractAddress,
            _partyName,
            _partyTwitterHandle,
            _partyAddress
        );
    }

    /**
     * @notice Add a verified Twitter account to the list of verified accounts
     * @dev Only the verifier contract can call this function, after the account
     * has been verified with the Chainlink Node + External Adapter
     * @param _userAddress The address of the user
     * @param _twitterHandle The Twitter handle of the verified account
     */

    function addTwitterVerifiedUser(
        address _userAddress,
        string memory _twitterHandle
    ) external onlyTwitterVerifier {
        // If the user address doesn't have a verified account yet, create a new array
        if (s_twitterVerifiedUsers[_userAddress].length == 0) {
            s_twitterVerifiedUsers[_userAddress] = new string[](1);
            // Add the verified account to the array
            s_twitterVerifiedUsers[_userAddress][0] = _twitterHandle;
        } else if (s_twitterVerifiedUsers[_userAddress].length > 0) {
            string[] memory verifiedAccounts = s_twitterVerifiedUsers[
                _userAddress
            ];
            for (uint256 i = 0; i < verifiedAccounts.length; i++) {
                // If the user already verified this account, revert
                if (
                    keccak256(abi.encodePacked(verifiedAccounts[i])) ==
                    keccak256(abi.encodePacked(_twitterHandle))
                ) {
                    emit TwitterAddVerifiedSuccessful(
                        _userAddress,
                        _twitterHandle
                    );
                    return;
                }
            }
            // But if it is not included, add it
            s_twitterVerifiedUsers[_userAddress].push(_twitterHandle);
        }

        emit TwitterAddVerifiedSuccessful(_userAddress, _twitterHandle);
    }

    /**
     * @notice Update the storage status of a promise contract
     * @dev Only the verifier contract can call this function, after the storage
     * has been verified with the Chainlink Node + External Adapter
     * @dev This step could as well be avoided for better optimization, since
     * VerifyStorage could directly call the PromiseContract to update its status
     * BUT we want to do it this way, because:
     * - it helps us keep this PromiseFactory contract as a mediator, which
     * allows for better event tracking & easier security measures
     * - it is not a major flaw in terms of gas usage, as long as we're deploying
     * on a L2 solution
     * @param _promiseContractAddress The address of the promise contract
     * @param _storageStatus The new storage status
     * -> 1 = failed, 2 = IPFS provided & verified, 3 = IPFS + Arweave provided & verified
     */

    function updateStorageStatus(
        address _promiseContractAddress,
        uint8 _storageStatus
    ) external onlyStorageVerifier {
        PromiseContract(_promiseContractAddress).updateStorageStatus(
            _storageStatus
        );
        emit StorageStatusUpdated(_promiseContractAddress, _storageStatus);
    }

    /// Setters
    function setTwitterVerifier(address _twitterVerifier) external onlyOwner {
        s_twitterVerifier = _twitterVerifier;
    }

    function setStorageVerifier(address _storageVerifier) external onlyOwner {
        s_storageVerifier = _storageVerifier;
    }

    /// Getters
    function getPromiseContractAddresses(address _owner)
        public
        view
        returns (PromiseContract[] memory)
    {
        return s_promiseContracts[_owner];
    }

    function getPromiseContractCount(address _userAddress)
        public
        view
        returns (uint256)
    {
        return s_promiseContracts[_userAddress].length;
    }

    function getTwitterVerifiedHandle(address _userAddress)
        public
        view
        returns (string[] memory)
    {
        // Return the username if the user has a verified account
        if (s_twitterVerifiedUsers[_userAddress].length > 0) {
            return s_twitterVerifiedUsers[_userAddress];
        } else {
            // Return an empty array
            string[] memory usernames = new string[](0);
            return usernames;
        }
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getTwitterVerifier() public view returns (address) {
        return s_twitterVerifier;
    }

    function getStorageVerifier() public view returns (address) {
        return s_storageVerifier;
    }
}
