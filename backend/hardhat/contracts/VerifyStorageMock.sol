//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./tests/ChainlinkClientTestHelper.sol";
import "./tests/ConfirmedOwnerTestHelper.sol";
import "./IPromiseFactory.sol";
import "./utils/AddressToString.sol";

/**
 * @author polarzero
 * @title VerifyStorageMock
 * @notice This contract is used to test the VerifyStorage contract
 * The functions are the same, but they don't actually send data to the operator
 * We make use of the ChainlinkClientTestHelper contract to mock the ChainlinkClient
 * as well as the ConfirmedOwnerTestHelper contract to mock the ConfirmedOwner
 * They provide additional functions to test that the contract is correctly initialized
 */

contract VerifyStorageMock is
    ChainlinkClientTestHelper,
    ConfirmedOwnerTestHelper
{
    using Chainlink for Chainlink.Request;

    error VerifyStorage__NOT_FACTORY();

    // Chainlink variables
    uint256 private constant ORACLE_PAYMENT = (1 * LINK_DIVISIBILITY) / 10; // 0.1 LINK
    bytes32 private s_oracleJobId = "6b8a5d182e2640999421f57e9c0a1d4e";

    // Declare the PromiseFactory contract address and the interface
    address private s_promiseFactoryContract;
    IPromiseFactory private s_promiseFactoryInterface;
    address private s_fakePromiseFactoryContract;

    // Events
    event StorageStatusUpdateRequested(
        bytes32 indexed requestId,
        address indexed contractAddress
    );

    // For testing purposes
    event StorageStatusUpdateRequestedVerifyArguments(
        address promiseAddress,
        address userAddress,
        string ipfsCid,
        string arweaveId,
        string encryptedProof
    );

    event StorageStatusUpdateSuccessful(
        bytes32 indexed requestId,
        address indexed contractAddress,
        uint8 storageStatus
    );

    /**
     * @notice Initialize the link token and target oracle
     * @param _linkTokenContract (Mumbai): 0x326C977E6efc84E512bB9C30f76E30c160eD06FB
     * @param _oracleContract ! Not the true oracle contract, but the address we own
     * @param _promiseFactoryContract: The address of the PromiseFactory contract
     */

    // Differences from the real contract:
    // We don't need to pass the owner address to ConfirmedOwnerTestHelper
    // But need to pass the link token address and the oracle address to ChainlinkClientTestHelper
    // We are passing a fake address that we own as the oracle, to be able to fulfill requests
    // We do the same for the promise factory contract, to test the onlyFactory modifier
    constructor(
        address _linkTokenContract,
        address _oracleContract,
        address _promiseFactoryContract,
        address _fakePromiseFactoryContract
    )
        ConfirmedOwnerTestHelper()
        ChainlinkClientTestHelper(_linkTokenContract, _oracleContract)
    {
        setChainlinkToken(_linkTokenContract);
        setChainlinkOracle(_oracleContract);
        setPromiseFactoryContract(_promiseFactoryContract);
        s_fakePromiseFactoryContract = _fakePromiseFactoryContract;
    }

    // Modifier to check if the caller is the PromiseFactory contract
    modifier onlyPromiseFactory() {
        if (msg.sender != s_fakePromiseFactoryContract)
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
        // We don't make the request to the oracle here
        // But we are hardcoding the requestId for testing purpose
        // ! This is absolutely not how it should be done in production
        // ! This should be called by Chainlink when building the request
        // ! It would associate the requestId with the operator address
        // ! ... which prevents anyone else from calling the fulfill function
        requestId = "0x1234567890";
        publicAddExternalRequest(msg.sender, requestId);

        emit StorageStatusUpdateRequested(requestId, _promiseAddress);
        // Only for testing purposes
        emit StorageStatusUpdateRequestedVerifyArguments(
            _promiseAddress,
            _userAddress,
            _ipfsCid,
            _arweaveId,
            _encryptedProof
        );
    }

    /**
     * @notice Callback function used by the oracleto return the promise storage status
     * @param _requestId The request ID
     * @param _promiseAddress The address of the promise contract
     * @param _storageStatus The storage status of the promise
     * @dev Only the Chainlink oracle can call this function
     */

    function fulfillStorageStatusUpdate(
        bytes32 _requestId,
        address _promiseAddress,
        uint8 _storageStatus
    ) external recordChainlinkFulfillment(_requestId) {
        s_promiseFactoryInterface.updateStorageStatus(
            _promiseAddress,
            _storageStatus
        );

        emit StorageStatusUpdateSuccessful(
            _requestId,
            _promiseAddress,
            _storageStatus
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
}
