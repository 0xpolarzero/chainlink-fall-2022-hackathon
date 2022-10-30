//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";
import "@chainlink/contracts/src/v0.7/interfaces/LinkTokenInterface.sol";
import "./IPromiseFactory.sol";

// TODO METTRE TOUT EN PRIVATE (OU INTERNAL) ET FAIRE DES GETTERS

/**
 * @author polarzero
 * @title VerifyTwitter
 * @notice Sends a request to the Chainlink oracle to verify a Twitter account
 * - The oracle will return the username, address, and verification status
 * - It uses a Chainlink node & an external adapter to interact with the Twitter API
 */

contract VerifyTwitter is ChainlinkClient, ConfirmedOwner {
    using Chainlink for Chainlink.Request;

    // Chainlink variables
    uint256 private constant ORACLE_PAYMENT = (1 * LINK_DIVISIBILITY) / 10; // 0.1 LINK
    bytes32 private s_oracleJobId = "2adee90f8a864ae1ab4138d06d99a80f";

    // Declare the PromiseFactory contract address and the interface
    address private s_promiseFactoryContract;
    IPromiseFactory private s_promiseFactoryInterface;

    // Variables returned by the oracle
    string private s_username;
    address private s_userAddress;
    bool private s_verified = false;

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

    /**
     * @notice Request a Twitter username to be verified
     * @param _username The username to verify
     */

    function requestVerification(string memory _username)
        public
        returns (bytes32 requestId)
    {
        Chainlink.Request memory req = buildChainlinkRequest(
            s_oracleJobId,
            address(this),
            this.fulfillVerification.selector
        );
        string memory userAddress = addressToString(msg.sender);

        // Generate a signature with
        // "Verifying my Twitter account for ETH address <address>" as the message
        // It will prevent the signature from being passed as a parameter
        string memory signature = string(
            abi.encodePacked(
                "Verifying my Twitter account for ETH address ",
                userAddress
            )
        );

        req.add("username", _username);
        req.add("signature", signature);
        req.add("address", userAddress);
        // req.add("copyPath1", "data,username"); // username (string)
        // req.add("copyPath2", "data,result"); // verified (bool)
        // req.add("copyPath3", "data,userAddress"); // user address (msg.sender here) (address)
        requestId = sendOperatorRequest(req, ORACLE_PAYMENT);

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
    ) public recordChainlinkFulfillment(_requestId) {
        s_username = _username;
        s_userAddress = _userAddress;
        s_verified = _verified;

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

    /**
     * @notice Call the promise factory contract to verify a Twitter account
     * @dev It also sets the promise factory contract interface with this address
     * @param _promiseFactoryContract The address of the PromiseFactory contract
     */

    function setPromiseFactoryContract(address _promiseFactoryContract)
        public
        onlyOwner
    {
        s_promiseFactoryContract = _promiseFactoryContract;
        s_promiseFactoryInterface = IPromiseFactory(_promiseFactoryContract);
    }

    function setOracleJobId(bytes32 _oracleJobId) public onlyOwner {
        s_oracleJobId = _oracleJobId;
    }

    /**
     * @notice Convert address to string
     * @param _addr The address to convert
     */

    function addressToString(address _addr)
        public
        pure
        returns (string memory)
    {
        bytes32 value = bytes32(uint256(uint160(_addr)));
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(42);
        str[0] = "0";
        str[1] = "x";

        for (uint256 i = 0; i < 20; i++) {
            str[2 + i * 2] = alphabet[uint8(value[i + 12] >> 4)];
            str[3 + i * 2] = alphabet[uint8(value[i + 12] & 0x0f)];
        }

        return string(str);
    }

    function withdrawLink() public onlyOwner {
        LinkTokenInterface linkToken = LinkTokenInterface(
            chainlinkTokenAddress()
        );
        (bool success, ) = address(this).call(
            abi.encodeWithSelector(
                linkToken.transfer.selector,
                msg.sender,
                linkToken.balanceOf(address(this))
            )
        );
        require(success, "Unable to transfer");
    }

    // Getters

    function getOracleJobId() public view returns (bytes32) {
        return s_oracleJobId;
    }

    function getPromiseFactoryContract() public view returns (address) {
        return s_promiseFactoryContract;
    }

    function getOraclePayment() public pure returns (uint256) {
        return ORACLE_PAYMENT;
    }

    function getLinkBalance() public view returns (uint256) {
        return LINK.balanceOf(address(this));
    }
}
