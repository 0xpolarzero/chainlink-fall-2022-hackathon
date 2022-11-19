---
description: How does the frontend listen for contract events?
---

# Catching events from promises

When reloading, or after a custom interaction from the user, the application performs queries to The Graph, and retrieves data from active node operators listening and indexing our selected contract events [(Learn more)](https://thegraph.com/docs/en/about/).

{% embed url="https://thegraph.com/hosted-service/subgraph/polar0/promises-subgraph-mumbai-v1" %}
Our subgraph on the Hosted Service.
{% endembed %}

{% embed url="https://api.thegraph.com/subgraphs/name/polar0/promises-subgraph-mumbai-v1/graphql" %}
The API to make queries to.
{% endembed %}

The subgraph, deployed on The Graph Network, is available for queries on the Hosted Service. It contains:

* `subgraph.yaml`: a manifest that describes the data it's interested in ;
* `schema.graphql`: a schema that defines the data entities, and how the queries should be performed ;
* `promise-factory.ts`: a mapping that handles the custom actions, by translating the data it receives into understandable entities we defined in the `schema`.

## Manifest

{% code title="subgraph.yaml" %}
```yaml
specVersion: 0.0.4
schema:
  file: ./schema.graphql
dataSources:
  - kind: ethereum
    name: PromiseFactory
    network: mumbai
    source:
      # The current PromiseFactory address
      address: '0xa288Da44e534Ebed813D7ea8aEc7A86A50a878B9'
      abi: PromiseFactory
      # The block it should start indexing at
      startBlock: 29217396
    mapping:
      kind: ethereum/events
      apiVersion: 0.0.6
      language: wasm/assemblyscript
      entities:
        - ActivePromise
        - PromiseContractCreated
        - ParticipantAdded
        - TwitterVerifiedUser
        - TwitterAddVerifiedSuccessful
      abis:
        - name: PromiseFactory
          file: ./abis/PromiseFactory.json
      eventHandlers:
        # A new promise creation event
        - event: PromiseContractCreated(indexed address,indexed
            address,string,string,string,string,string[],string[],address[])
          # How to handle it in the mapping
          handler: handlePromiseContractCreated
          # A new participant added to a promise event
        - event: ParticipantAdded(indexed address,string,string,address)
          handler: handleParticipantAdded
          # A successful Twitter verification event
        - event: TwitterAddVerifiedSuccessful(indexed address,string)
          handler: handleTwitterAddVerifiedSuccessful
      file: ./src/promise-factory.ts

```
{% endcode %}

## Schema

{% code title="schema.graphql" %}
```graphql
# Updated at PromiseContractCreated and ParticipantAdded
type ActivePromise @entity {
  # A unique ID created in the mapping
  id: ID!
  # The creator of the promise
  owner: Bytes!
  # The address of the promise
  contractAddress: Bytes!
  # The name, IPFS CID and Arweave ID of the promise
  promiseName: String!
  ipfsCid: String!
  arweaveId: String!
  # The participants informations
  partyNames: [String!]!
  partyTwitterHandles: [String!]!
  partyAddresses: [Bytes!]!
  # The date of the promise creation - base on the block timestamp
  # of PromiseContractCreated
  createdAt: BigInt
  # The date of the last modification - base on the block timestamp
  # of ParticipantAdded
  updatedAt: BigInt
}

# Fired when a promise is created
type PromiseContractCreated @entity {
  id: ID!
  owner: Bytes!
  contractAddress: Bytes!
  promiseName: String!
  ipfsCid: String!
  arweaveId: String!
  partyNames: [String!]!
  partyTwitterHandles: [String!]!
  partyAddresses: [Bytes!]!
  blockTimestamp: BigInt
}

# Fired when a participant is added to a promise
type ParticipantAdded @entity {
  id: ID!
  contractAddress: Bytes! # address
  participantName: String! # string
  participantTwitterHandle: String! # string
  participantAddress: Bytes! # address
}

# Updated at TwitterAddVerifiedSuccessful
type TwitterVerifiedUser @entity {
  id: ID!
  address: Bytes!
  # All unique handles verified for this address
  twitterHandles: [String!]!
  # The timestamp of the verification
  verifiedAt: BigInt
}

# Fired when a participant gets a Twitter account verified
type TwitterAddVerifiedSuccessful @entity {
  id: ID!
  address: Bytes!
  twitterHandle: String!
}
```
{% endcode %}

## Mapping

#### Handling `PromiseContractCreated`

{% code title="promise-factory.ts" %}
```typescript
export function handlePromiseContractCreated(
  event: PromiseContractCreatedEvent,
): void {
  // It should never happen that the same contract is created twice
  // But we can't ever be sure enough, so we check if the entity already exists anyway
  let activePromise = ActivePromise.load(
    getIdFromEventParams(event.params._contractAddress),
  );

  // If this ActivePromise doesn't exist, create it
  if (!activePromise) {
    activePromise = new ActivePromise(
      getIdFromEventParams(event.params._contractAddress),
    );
  }

  // Grab the data from the event parameters
  // and associate it to this entity
  // From the contract...
  activePromise.owner = event.params._owner;
  activePromise.contractAddress = event.params._contractAddress;
  activePromise.promiseName = event.params._promiseName;
  activePromise.ipfsCid = event.params._ipfsCid;
  activePromise.arweaveId = event.params._arweaveId;
  activePromise.partyNames = event.params._partyNames;
  activePromise.partyTwitterHandles = event.params._partyTwitterHandles;
  activePromise.partyAddresses = event.params._partyAddresses.map<Bytes>(
    (e: Bytes) => e,
  );
  // From the block...
  activePromise.createdAt = event.block.timestamp;
  activePromise.updatedAt = event.block.timestamp;

  // Save the entity
  activePromise.save();
}
```
{% endcode %}

#### Handling `ParticipantAdded`

{% code title="promise-factory.ts" %}
```typescript
export function handleParticipantAdded(event: ParticipantAddedEvent): void {
  // Grab the entity (created when the promise was created)
  // We won't need to create it here, it should not be possible to add
  // a participant to a promise that doesn't exist
  let activePromise = ActivePromise.load(
    getIdFromEventParams(event.params._contractAddress),
  );

  // We can't use the .push method here because it's not supported by AssemblyScript
  // So we have to do it 'manually'
  // Create an new array from the old one along with the new parameter
  const newNamesArray = activePromise!.partyNames.concat([
    event.params._participantName,
  ]);
  const newTwitterHandlesArray = activePromise!.partyTwitterHandles.concat([
    event.params._participantTwitterHandle,
  ]);
  const newAddressesArray = activePromise!.partyAddresses.concat([
    event.params._participantAddress,
  ]);

  // Set the promise new parameter with the new array
  activePromise!.partyNames = newNamesArray;
  activePromise!.partyTwitterHandles = newTwitterHandlesArray;
  activePromise!.partyAddresses = newAddressesArray;
  activePromise!.updatedAt = event.block.timestamp;

  activePromise!.save();
}
```
{% endcode %}

#### Handling `TwitterAddVerifiedSuccessful`

{% code title="promise-factory.ts" %}
```typescript
export function handleTwitterAddVerifiedSuccessful(
  event: TwitterAddVerifiedSuccessfulEvent,
): void {
  // Load the user entity, if they already have verified Twitter accounts
  let twitterVerifiedUser = TwitterVerifiedUser.load(
    getIdFromEventParams(event.params._owner),
  );
  // We prefer not interacting directly with twitterHandles that could be null
  // Create a new array
  let twitterHandlesArray: string[] = [];

  // If the user has no verified account (so no entity) yet...
  if (!twitterVerifiedUser) {
    // Create an entity...
    twitterVerifiedUser = new TwitterVerifiedUser(
      getIdFromEventParams(event.params._owner),
    );
    // ... and just add the handle to a new array
    twitterHandlesArray = new Array<string>().concat([
      event.params._twitterHandle,
    ]);
  } else {
    // If the user has been verified before, get the array from the entity
    twitterHandlesArray = twitterVerifiedUser.twitterHandles;
    // Add the new handle to the array
    twitterHandlesArray = twitterHandlesArray.concat([
      event.params._twitterHandle,
    ]);
    // Remove duplicates from the array (if the same handle has been verified)
    twitterHandlesArray = twitterHandlesArray.filter(
      (value, index, self) => self.indexOf(value) === index,
    );
  }

  twitterVerifiedUser.address = event.params._owner;
  // Set the twitterHandles without ever checking the content of the entity
  twitterVerifiedUser.twitterHandles = twitterHandlesArray;
  twitterVerifiedUser.verifiedAt = event.block.timestamp;

  twitterVerifiedUser.save();
}
```
{% endcode %}

## Resources

| Repository                                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------- |
| [Subgraph](https://github.com/polar0/chainlink-fall-2022-hackathon/tree/main/backend/subgraph)                                              |
| [Manifest (`subgraph.yaml`)](https://github.com/polar0/chainlink-fall-2022-hackathon/blob/main/backend/subgraph/subgraph.yaml)              |
| [Schema (`schema.graphql`)](https://github.com/polar0/chainlink-fall-2022-hackathon/blob/main/backend/subgraph/schema.graphql)              |
| [Mapping (`promise-factory.ts`)](https://github.com/polar0/chainlink-fall-2022-hackathon/blob/main/backend/subgraph/src/promise-factory.ts) |

| External                                                                                                                   |
| -------------------------------------------------------------------------------------------------------------------------- |
| [Subgraph on the Hosted Service (Mumbai)](https://thegraph.com/hosted-service/subgraph/polar0/promises-subgraph-mumbai-v1) |
| [The Graph documentation - About The Graph](https://thegraph.com/docs/en/about/)                                           |
| [The Graph documentation - Creating a Subgraph](https://thegraph.com/docs/en/developing/creating-a-subgraph/)              |
