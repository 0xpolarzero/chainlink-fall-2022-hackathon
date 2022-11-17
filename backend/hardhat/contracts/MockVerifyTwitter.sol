//SPDX-License-Identifier: MIT
// Make sure it is compatible with all ^0.7.0, ^0.8.0 and ^0.8.16
pragma solidity ^0.8.0;

import "./tests/ChainlinkClientTestHelper.sol";
import "./tests/ConfirmedOwnerTestHelper.sol";
import "./IPromiseFactory.sol";
import "./utils/AddressToString.sol";

/**
 * @author polarzero
 * @title MockVerifyTwitter
 * @notice This contract is used to test the VerifyTwitter contract
 * The functions are the same, but they don't actually send data to the operator
 * We make use of the ChainlinkClientTestHelper contract to mock the ChainlinkClient
 * as well as the ConfirmedOwnerTestHelper contract to mock the ConfirmedOwner
 * They provide additional functions to test that the contract is correctly initialized
 */

contract MockVerifyTwitter is
    ChainlinkClientTestHelper,
    ConfirmedOwnerTestHelper
{
    using Chainlink for Chainlink.Request;

    // Chainlink variables
    uint256 private constant ORACLE_PAYMENT = (1 * LINK_DIVISIBILITY) / 10; // 0.1 LINK
    bytes32 private s_oracleJobId = "b6ddd15e02e84e3cb8840f75c7658ba8";

    // Declare the PromiseFactory contract address and the interface
    address private s_promiseFactoryContract;
    IPromiseFactory private s_promiseFactoryInterface;

    // Events
    event VerificationRequested(bytes32 indexed requestId, string username);
    event VerificationFailed(bytes32 indexed requestId, string username);
    event VerificationSuccessful(
        bytes32 indexed requestId,
        string username,
        address userAddress,
        bool verified
    );

    /**
     * @notice Initialize the link token and target oracle
     * @param _linkTokenContract (Mumbai): 0x326C977E6efc84E512bB9C30f76E30c160eD06FB
     * @param _oracleContract ! Not the true oracle contract, but the address we own
     * @param _promiseFactoryContract: The address of the PromiseFactory contract
     * Operator contract: 0x2BB8Dd9C16edeF313eb9ccBd5F42A8b577cB1E3c
     * Job ID: 79bf989a-d076-48c0-a59b-d679f366592d
     */

    // Another difference here: we don't need to pass the owner address to ConfirmedOwnerTestHelper
    // We also need to pass the link token address and the oracle address to ChainlinkClientTestHelper
    // Again, this is just needed for testing, to make sure it is correctly initialized
    constructor(
        address _linkTokenContract,
        // In this mock, we're passing an address we own as the oracle address
        // so we can test the fulfill function
        address _oracleContract,
        address _promiseFactoryContract
    )
        ConfirmedOwnerTestHelper()
        ChainlinkClientTestHelper(_linkTokenContract, _oracleContract)
    {
        setChainlinkToken(_linkTokenContract);
        setChainlinkOracle(_oracleContract);
        setPromiseFactoryContract(_promiseFactoryContract);
    }

    /**
     * @notice Request a Twitter username to be verified
     * @param _username The username to verify
     */

    function requestVerification(string memory _username)
        public
        returns (bytes32 requestId)
    {
        // ! This should be called by Chainlink when building the request
        // ! It would associate the requestId with the operator address
        // ! ... which prevents anyone else from calling the fulfill function
        // ! We're doing it here only for testing purposes, so we can trigger it manually
        requestId = "0x1234567890";
        publicAddExternalRequest(msg.sender, requestId);
        emit VerificationRequested(requestId, _username);
    }

    /**
     * @notice Callback function used by the oracle to return the verification result
     * @param _requestId The request ID
     * @param _username The username to verify
     * @param _verified The verification result
     */

    function fulfillVerification(
        bytes32 _requestId,
        string memory _username,
        bool _verified,
        address _userAddress
    ) external recordChainlinkFulfillment(_requestId) {
        if (_verified) {
            // It's ok if the user already have a verified account, they can still verify another one
            // Call the PromiseFactory contract to verify the user
            // Which will map their address to their verified Twitter username(s)
            s_promiseFactoryInterface.addTwitterVerifiedUser(
                _userAddress,
                _username
            );

            emit VerificationSuccessful(
                _requestId,
                _username,
                _userAddress,
                _verified
            );
        } else {
            emit VerificationFailed(_requestId, _username);
        }
    }

    function setPromiseFactoryContract(address _promiseFactoryContract)
        public
        onlyOwner
    {
        s_promiseFactoryContract = _promiseFactoryContract;
        s_promiseFactoryInterface = IPromiseFactory(_promiseFactoryContract);
    }

    function getPromiseFactoryContract() public view returns (address) {
        return s_promiseFactoryContract;
    }

    function getOraclePayment() public pure returns (uint256) {
        return ORACLE_PAYMENT;
    }

    // Additional function to test 'addressToString'
    function testAddressToString(address _address)
        public
        pure
        returns (string memory)
    {
        return addressToString(_address);
    }
}
