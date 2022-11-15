- Overview (first lines)
- Link to documentation with a screenshot?
- Overview of the repository structure
- Instructions for building and running the code

# -------------------

# Resources

## Chainlink:

- Social Media Identity and Domain Names
  → https://unstoppabledomains.com/blog/verifying-twitter-on-your-domain-with-chainlink
  → https://github.com/unstoppabledomains/dot-crypto/blob/1a33aa9312b43a31b2d04dbd53e363801c0ccdf1/contracts/operators/TwitterValidationOperator.sol
- ? Use it to display ETH/USD price feeds so the users can have a better understanding of the value they need to pay for the service

# First steps of brainstorming

## Smart contract

### Promise factory

1. The PDF uploaded agreement is sent to IPFS using Web3.Storage, an URI is generated & it can't be modified anymore.
2. The 'admin' user should then setup a few parameters for the contract, which when validated will:

   - Create a smart contract for this agreement
   - Create a mapping between the URI of the PDF (as a unique ID) & the smart contract address

   a. We can gather these first parameters (to save some gas, and not create useless entries in the mapping):

   - A name for the agreement
   - The addresses of the parties that will be allowed to interact
   - The names of the parties
   - The twitter handle of the parties

   b. The contract is created, an event `contractCreated` with the address of the owner & address of the child contract. So is `Your letters of intent` in the UI.

### Promise

3. The child contract is created, with the following parameters (passed in the constructor):
   a. The address of the owner
   b. The name of the intent (! limit the size)
   c. The addresses of the parties associated to a denomination (name) (! verify if valid address)
   d. The URI of the PDF (! check if it exists ?)

4. Now the contract is created, and the page should show the name of the intent, the parties, and the URI of the PDF (and show the PDF in the UI). It is in a `pending` state.

   - Everyone can:
   a. Accept the intent (by signing a message with their wallet)
   b. But only right after adding a KYC or declaring to not give it
   → This will trigger an event `signatureAccepted` that will be caught by the UI
   x. ! LATER: KYC with Twitter, which would need anoter stage of approval, preceding the signature (and another state)
   <!-- - The owner can:
     a. Cancel the agreement (by signing a message with their wallet)
     → This will trigger an event `contractCancelled` which will be caught by the UI to update the page.
     → The contract is now in a `cancelled` state.
     → Nobody can't do anything else with the contract. -->

5. Once all the parties have accepted the agreement, the owner can trigger the `contractValidated` function, which will:
   → Set the contract in a `validated` state
   → Emit an event `contractValidated` that will be caught by the UI to update the page
   → Maybe generate a hash will the content of all the signatures (+ the URI of the PDF)
   → Nobody can't do anything else with the contract.

### Signing & verifying (for meta transactions)

- OpenZeppelin: https://docs.openzeppelin.com/contracts/2.x/utilities
- OpenZeppelin ECDSA library: https://docs.openzeppelin.com/contracts/2.x/api/cryptography#ECDSA
- Signing message: https://wagmi.sh/docs/hooks/useSignMessage
- https://programtheblockchain.com/posts/2018/02/17/signing-and-verifying-messages-in-ethereum/

### Relay Manager

- Argent contracts: https://github.com/argentlabs/argent-contracts/blob/develop/contracts/modules/RelayerManager.sol
- More decentralized (Open GSN): https://docs.opengsn.org/contracts/#receiving-a-relayed-call
- Chainlink-Relayers (Chainlink Spring Hackathon 2022): https://github.com/ciaranightingale/chainlink-relayers

Easiest solutions for meta transactions:

- Biconomy: https://docs.biconomy.io/products/enable-gasless-transactions
- Infura: https://infura.io/product/ethereum/transactions-itx
- Openzeppelin Defender: https://docs.openzeppelin.com/defender/relay
- Open GSN (more decentralized): https://docs.opengsn.org/contracts/#receiving-a-relayed-call
- Gelato: https://docs.gelato.network/developer-products/gelato-relay

### Twitter verification

- Unstoppable TwitterValidationOperator.sol: https://github.com/unstoppabledomains/dot-crypto/blob/1a33aa9312b43a31b2d04dbd53e363801c0ccdf1/contracts/operators/TwitterValidationOperator.sol

### Backups

When a promise is created via the website, the data is sent both to IPFS & to Arweave. Periodically, an upkeep is performed to pin on a custom IPFS Node the content that could not be uploaded to Arweave. There are 3 secure states:

- \*\*\* IPFS + Arweave (on upkeep, it checks if the data is valid on Arweave & it gives to the contract the status backedUpOnArweave)
- \*\* IPFS + IPFS Node (after 1st step, if it doesn't have the status backedUpOnArweave, it is backedUpOnIPFSNode)
- \* IPFS (if it doesn't have the status backedUpOnArweave or backedUpOnIPFSNode, it is backedUpOnIPFS)

## Have a contract be interactable only by the web app

Before making the request (Promise creation):

- Grab the encrypted string
- Mix it with anything that would make it unique and non-reproductible (timestamp, user address...)
  - How to make sure the user can't just copy/paste the encrypted string before validating the tx and quickly send it to the contract?
  - They could even do it with a script, so there would be no difference between the website and a script
  - The user will always validate the tx before sending it, as it is the last step of the process
    -> We need a step between the website & the contract that can't be processed if directly interacting with the contract
    -> Maybe the uploads to ipfs & arweave can contain a file with the key and an external adapter (with upkeep) can check its validity? Limits the needed memory for the function (but how to read the arweave zip...)

# TODO

- [x] Let user upload PDF when creating a promise
- [x] External adapter for Twitter verification + emit event with verified Twitter handle so it can be added to the search options (only verified)
- ❌ event PromiseContractCreated: only non-modifiable parameters (contract, owner, IPFS uri)
  - [x] fetch all other data from the child contract and not factory
  - [x] on modification (through factory) emit an event, catch it in graph (new handler) but modify the state in the child
  - [x] allow adding participant, ❌ modify Twitter handle
- ❌ Periodically backup all data to Arweave (and let it be known in the promise UI) OR Web3.Storage (unpin all then pin again)
  - Along with the way to incencitize users to pin that data, it provides multiple ways to keep it stored (and prevent both me from deleting it and users from providing an URI they are the only one to pin and could delete)
  - OR performUpkeep each time a promise is sent to pin the URI
- [x] Modal to interact with created or involved contracts
  - [x] Don't let interact if the contract is locked
    - [x] Both in the contract and the frontend
  - [x] Let the user verify Twitter (if not already)
    - [x] Both in the contract and the frontend
    - [x] In contract, if a twitter is provided (not '') then it needs to be validated for validating
    - ❌ Maybe: generate a RN with Chainlink, generate a text with address & number, tweet it, read twitter for last tweets (Do not refresh the page!)
  - [x] Let the user validate the contract
    - [x] Both in the contract and the frontend
- 🚩 [ ] Display ENS everywhere, allow to search for ENS
- 🚩 [ ] Add a button to say if there is a bug
- 🚩🚩 [ ] Monitor contracts with Slither, Tenderly
- 🚩[ ] Verify the contract when it's created from factory (EA + Automation)

## Later

- How to bypass web3.storage 5GiB limit?
- Add other KYC methods (Lens)
- Use a proxy to be able to change the implementation
- Let the signers upload different versions of the content and keep it in a single page
- Implement relay for meta transactions: separate whiletisted to non-whitelisted
- Allow whitelisted users (through a token, to avoid botting) to vote on the content reputation?
  - Need to figure out a way to issue the tokens to "reputables" users
    → e.g. contributors in recognized DAOs

## Steps

Deploy contracts

- PromiseFactory, VerifyStorage, VerifyTwitter

Set verifiers

- PromiseFactory.setVerifyStorage(VerifyStorage.address)
- PromiseFactory.setVerifyTwitter(VerifyTwitter.address)

_Fund contracts with Link_ -> if not, we won't be able to create promises

-> maybe better to use an upkeep / check the balance often

- VerifyStorage
- VerifyTwitter
