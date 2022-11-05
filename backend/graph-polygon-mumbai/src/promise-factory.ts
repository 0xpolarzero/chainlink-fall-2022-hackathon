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
  // let promiseContractCreated = PromiseContractCreated.load(
  //   getIdFromEventParams(event.params._contractAddress, event.params._owner),
  // );

  let activePromise = ActivePromise.load(
    getIdFromEventParams(event.params._contractAddress),
  );

  // if (!promiseContractCreated) {
  //   promiseContractCreated = new PromiseContractCreated(
  //     getIdFromEventParams(event.params._contractAddress, event.params._owner),
  //   );
  // }

  if (!activePromise) {
    activePromise = new ActivePromise(
      getIdFromEventParams(event.params._contractAddress),
    );
  }

  // promiseContractCreated
  // promiseContractCreated.blockTimestamp = event.block.timestamp;
  // promiseContractCreated.owner = event.params._owner;
  // promiseContractCreated.contractAddress = event.params._contractAddress;
  // promiseContractCreated.promiseName = event.params._promiseName;
  // promiseContractCreated.ipfsCid = event.params._ipfsCid;
  // promiseContractCreated.partyNames = event.params._partyNames;
  // promiseContractCreated.partyTwitterHandles =
  //   event.params._partyTwitterHandles;
  // promiseContractCreated.partyAddresses = event.params._partyAddresses.map<
  //   Bytes
  // >((e: Bytes) => e);

  // activePromise
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

  // promiseContractCreated.save();
  activePromise.save();
}

export function handleParticipantAdded(event: ParticipantAddedEvent): void {
  // let participantAdded = ParticipantAdded.load(
  //   getIdFromEventParams(
  //     event.params._contractAddress,
  //     event.params._participantAddress,
  //   ),
  // );

  let activePromise = ActivePromise.load(
    getIdFromEventParams(event.params._contractAddress),
  );

  // if (!participantAdded) {
  //   participantAdded = new ParticipantAdded(
  //     getIdFromEventParams(
  //       event.params._contractAddress,
  //       event.params._participantAddress,
  //     ),
  //   );
  // }

  // participantAdded.contractAddress = event.params._contractAddress;
  // participantAdded.participantName = event.params._participantName;
  // participantAdded.participantTwitterHandle =
  //   event.params._participantTwitterHandle;
  // participantAdded.participantAddress = event.params._participantAddress;

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

  // participantAdded.save();
  activePromise!.save();
}

export function handleTwitterAddVerifiedSuccessful(
  event: TwitterAddVerifiedSuccessfulEvent,
): void {
  // An event is emitted with the user address and their twitter handle
  // An address can verify several twitter handles
  // So their address will be linked to several twitter handles with TwitterVerifiedUser

  let twitterVerifiedUser = TwitterVerifiedUser.load(
    getIdFromEventParams(event.params._owner),
  );

  if (!twitterVerifiedUser) {
    twitterVerifiedUser = new TwitterVerifiedUser(
      getIdFromEventParams(event.params._owner),
    );
  }

  const newTwitterHandlesArray = twitterVerifiedUser.twitterHandles.concat([
    event.params._twitterHandle,
  ]);

  twitterVerifiedUser.address = event.params._owner;
  twitterVerifiedUser.twitterHandles = newTwitterHandlesArray;
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
