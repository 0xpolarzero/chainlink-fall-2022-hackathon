import { Address, Bytes } from '@graphprotocol/graph-ts';
import {
  PromiseContractCreated as PromiseContractCreatedEvent,
  ParticipantAdded as ParticipantAddedEvent,
  TwitterAddVerifiedSuccessful as TwitterAddVerifiedSuccessfulEvent,
} from '../generated/PromiseFactory/PromiseFactory';
import {
  ActivePromise,
  PromiseContractCreated,
  ParticipantAdded,
  TwitterAddVerifiedSuccessful,
  TwitterVerifiedUser,
} from '../generated/schema';

export function handlePromiseContractCreated(
  event: PromiseContractCreatedEvent,
): void {
  // It should never happen that the same contract is created twice
  // But we can't ever be sure enough, so we check if the entity already exists anyway
  let activePromise = ActivePromise.load(
    getIdFromEventParams(event.params._contractAddress),
  );

  if (!activePromise) {
    activePromise = new ActivePromise(
      getIdFromEventParams(event.params._contractAddress),
    );
  }

  activePromise.owner = event.params._owner;
  activePromise.contractAddress = event.params._contractAddress;
  activePromise.promiseName = event.params._promiseName;
  activePromise.ipfsCid = event.params._ipfsCid;
  activePromise.partyNames = event.params._partyNames;
  activePromise.partyTwitterHandles = event.params._partyTwitterHandles;
  activePromise.partyAddresses = event.params._partyAddresses.map<Bytes>(
    (e: Bytes) => e,
  );
  activePromise.createdAt = event.block.timestamp;
  activePromise.updatedAt = event.block.timestamp;

  activePromise.save();
}

export function handleParticipantAdded(event: ParticipantAddedEvent): void {
  let activePromise = ActivePromise.load(
    getIdFromEventParams(event.params._contractAddress),
  );

  // We can't use the .push method here because it's not supported by AssemblyScript
  // So we have to do it 'manually'
  const newNamesArray = activePromise!.partyNames.concat([
    event.params._participantName,
  ]);
  const newTwitterHandlesArray = activePromise!.partyTwitterHandles.concat([
    event.params._participantTwitterHandle,
  ]);
  const newAddressesArray = activePromise!.partyAddresses.concat([
    event.params._participantAddress,
  ]);

  activePromise!.partyNames = newNamesArray;
  activePromise!.partyTwitterHandles = newTwitterHandlesArray;
  activePromise!.partyAddresses = newAddressesArray;
  activePromise!.updatedAt = event.block.timestamp;

  activePromise!.save();
}

export function handleTwitterAddVerifiedSuccessful(
  event: TwitterAddVerifiedSuccessfulEvent,
): void {
  let twitterVerifiedUser = TwitterVerifiedUser.load(
    getIdFromEventParams(event.params._owner),
  );
  // We can avoid interacting directly with twitterHandles that could be null
  let twitterHandlesArray: string[] = [];

  if (!twitterVerifiedUser) {
    twitterVerifiedUser = new TwitterVerifiedUser(
      getIdFromEventParams(event.params._owner),
    );
    // If the user has never been verified before, create a new array
    twitterHandlesArray = new Array<string>();
  } else {
    // If the user has been verified before, get the array from the entity
    twitterHandlesArray = twitterVerifiedUser.twitterHandles;
  }

  twitterVerifiedUser.address = event.params._owner;
  // Set the twitterHandles without needing to check its content
  twitterVerifiedUser.twitterHandles = twitterHandlesArray.concat([
    event.params._twitterHandle,
  ]);
  twitterVerifiedUser.verifiedAt = event.block.timestamp;

  twitterVerifiedUser.save();
}

function getIdFromEventParams(
  contractAddress: Address,
  owner: Address | null = null,
): string {
  if (!owner) {
    return contractAddress.toHexString();
  }
  return contractAddress.toHexString() + '-' + owner.toHexString();
}
