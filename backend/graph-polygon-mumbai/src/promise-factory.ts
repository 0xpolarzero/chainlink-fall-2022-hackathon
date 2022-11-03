import { Address, Bytes } from '@graphprotocol/graph-ts';
import { PromiseContractCreated as PromiseContractCreatedEvent } from '../generated/PromiseFactory/PromiseFactory';
import { PromiseContractCreated } from '../generated/schema';

export function handlePromiseContractCreated(
  event: PromiseContractCreatedEvent,
): void {
  // It should never happen that the same contract is created twice
  // But we can't ever be sure enough, so we check if the entity already exists anyway
  let promiseContractCreated = PromiseContractCreated.load(
    getIdFromEventParams(event.params._owner, event.params._contractAddress),
  );

  if (!promiseContractCreated) {
    promiseContractCreated = new PromiseContractCreated(
      getIdFromEventParams(event.params._owner, event.params._contractAddress),
    );
  }

  promiseContractCreated.blockTimestamp = event.block.timestamp;
  promiseContractCreated.owner = event.params._owner;
  promiseContractCreated.contractAddress = event.params._contractAddress;
  promiseContractCreated.promiseName = event.params._promiseName;
  promiseContractCreated.ipfsCid = event.params._ipfsCid;
  promiseContractCreated.partyNames = event.params._partyNames;
  promiseContractCreated.partyTwitterHandles =
    event.params._partyTwitterHandles;
  promiseContractCreated.partyAddresses = event.params._partyAddresses.map<
    Bytes
  >((e: Bytes) => e);

  promiseContractCreated.save();
}

function getIdFromEventParams(
  owner: Address,
  contractAddress: Address,
): string {
  return owner.toHexString() + '-' + contractAddress.toHexString();
}
