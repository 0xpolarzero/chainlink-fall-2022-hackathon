//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";
import "./IPromiseFactory.sol";
import "./utils/AddressToString.sol";

// storageStatus = 0 -> the provided IPFS and Arweave hashes have not yet been verified
// storageStatus = 1 -> the provided IPFS and eventually Arweave hashes could not be verified
// storageStatus = 2 -> only the IPFS hash has been provided and verified
// storageStatus = 3 -> both the IPFS & Arweave hashes has been provided and verified

/**
 * @author polarzero
 * @title VerifyStorage
 * @notice Sends a request to the Chainlink oracle to verify the IPFS & Arweave hashes
 * of a promise contract
 * - If the promise has been created through the website, a string containing the user address,
 * the IPFS hash and the Arweave ID will be encrypted along with a secret key and sent with the
 * contract creation arguments. It will be decrypted by making a request to the Chainlink Node,
 * with the help of an external adapter. The latter will decrypt the string and verify it does
 * indeed contain the correct IPFS & Arweave hashes.
 * -> It allows us to make sure the promise links to a permanent storage for the content, and
 * that this content is the one the user uploaded to both platforms.
 * - The users can still create promises without using the website, in which case the hashes
 * will be sent as arguments to the contract constructor. In this case, the oracle will simply
 * not be able to verify the hashes, therefore the website will not be able to display a 'verified'
 * badge.
 */

contract VerifyStorage is ChainlinkClient, ConfirmedOwner {
    using Chainlink for Chainlink.Request;

    error VerifyStorage__NOT_FACTORY();

    // Chainlink variables
    uint256 private constant ORACLE_PAYMENT = (1 * LINK_DIVISIBILITY) / 10; // 0.1 LINK
    bytes32 private s_oracleJobId = "cd430ded65b64b5fae032f9b9b37b89d";

    // Declare the PromiseFactory contract address and the interface
    address private s_promiseFactoryContract;
    IPromiseFactory private s_promiseFactoryInterface;

    // Events
    event StorageStatusUpdateRequested(
        bytes32 indexed requestId,
        address indexed promiseAddress
    );
    event StorageStatusUpdateSuccessful(
        bytes32 indexed requestId,
        address indexed promiseAddress,
        uint8 storageStatus
    );

    /**
     * @notice Initialize the link token and target oracle
     * @param _linkTokenContract (Mumbai): 0x326C977E6efc84E512bB9C30f76E30c160eD06FB
     * @param _oracleContract (Mumbai): 0x2BB8Dd9C16edeF313eb9ccBd5F42A8b577cB1E3c
     * @param _promiseFactoryContract: The address of the PromiseFactory contract
     */

    constructor(
        address _linkTokenContract,
        address _oracleContract,
        address _promiseFactoryContract
    ) ConfirmedOwner(msg.sender) {
        setChainlinkToken(_linkTokenContract);
        setChainlinkOracle(_oracleContract);
        setPromiseFactoryContract(_promiseFactoryContract);
    }

    // Modifier to check if the caller is the PromiseFactory contract
    modifier onlyPromiseFactory() {
        if (msg.sender != s_promiseFactoryContract)
            revert VerifyStorage__NOT_FACTORY();
        _;
    }

    /**
     * @notice Request a promise storage status to be updated
     * @param _promiseAddress The address of the promise contract
     * @param _userAddress The address of the user who created the promise
     * @param _ipfsCid The IPFS CID of the promise content
     * @param _arweaveId The Arweave ID of the promise content
     * @param _encryptedProof The encrypted string containing the user address, the IPFS hash
     * and the Arweave ID
     * @dev Only the PromiseFactory contract can call this function (it will after
     * creating a new promise)
     */

    function requestStorageStatusUpdate(
        address _promiseAddress,
        address _userAddress,
        string memory _ipfsCid,
        string memory _arweaveId,
        string memory _encryptedProof
    ) external onlyPromiseFactory returns (bytes32 requestId) {
        Chainlink.Request memory req = buildChainlinkRequest(
            s_oracleJobId,
            address(this),
            this.fulfillStorageStatusUpdate.selector
        );

        string memory promiseAddress = addressToString(_promiseAddress);
        string memory userAddress = addressToString(_userAddress);

        req.add("promiseAddress", promiseAddress);
        req.add("userAddress", userAddress);
        req.add("ipfsCid", _ipfsCid);
        req.add("arweaveId", _arweaveId);
        req.add("encryptedProof", _encryptedProof);

        requestId = sendOperatorRequest(req, ORACLE_PAYMENT);
        emit StorageStatusUpdateRequested(requestId, _promiseAddress);
    }

    /**
     * @notice Callback function used by the oracleto return the promise storage status
     * @param _requestId The request ID
     * @param _promiseAddress The address of the promise contract
     * @param _backupStatus The storage status of the promise
     * -> We're receiving _backupStatus instead of _storageStatus because the Node is
     * confused about that _storage keyword, so it's better to change it only in that job.
     * @dev Only the Chainlink oracle can call this function
     */

    function fulfillStorageStatusUpdate(
        bytes32 _requestId,
        address _promiseAddress,
        uint8 _backupStatus
    ) external recordChainlinkFulfillment(_requestId) {
        s_promiseFactoryInterface.updateStorageStatus(
            _promiseAddress,
            _backupStatus
        );

        emit StorageStatusUpdateSuccessful(
            _requestId,
            _promiseAddress,
            _backupStatus
        );
    }

    /**
     * @notice Set the address of the PromiseFactory contract
     * @param _promiseFactoryContract: The address of the PromiseFactory contract
     */

    function setPromiseFactoryContract(address _promiseFactoryContract)
        public
        onlyOwner
    {
        s_promiseFactoryContract = _promiseFactoryContract;
        s_promiseFactoryInterface = IPromiseFactory(_promiseFactoryContract);
    }

    /**
     * @notice Set the oracle job ID
     * @param _oracleJobId The oracle job ID
     */

    function setOracleJobId(bytes32 _oracleJobId) public onlyOwner {
        s_oracleJobId = _oracleJobId;
    }

    // Getters

    function getPromiseFactoryContract() public view returns (address) {
        return s_promiseFactoryContract;
    }

    function getOracleJobId() public view returns (bytes32) {
        return s_oracleJobId;
    }

    function getOraclePayment() public pure returns (uint256) {
        return ORACLE_PAYMENT;
    }

    function getLinkBalance() public view returns (uint256) {
        LinkTokenInterface linkToken = LinkTokenInterface(
            chainlinkTokenAddress()
        );
        return linkToken.balanceOf(address(this));
    }
}
