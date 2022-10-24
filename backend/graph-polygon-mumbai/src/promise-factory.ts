import { Address, BigInt, Bytes } from '@graphprotocol/graph-ts';
import { PromiseContractCreated as PromiseContractCreatedEvent } from '../generated/PromiseFactory/PromiseFactory';
import { PromiseContractCreated } from '../generated/schema';

export function handlePromiseContractCreated(
  event: PromiseContractCreatedEvent,
): void {
  // It should never happen that the same contract is created twice
  // But we can't ever be sure enough, so we check if the entity already exists anyway
  let promiseContractCreated = PromiseContractCreated.load(
    getIdFromEventParams(event.params._contractAddress, event.block.number),
  );

  if (!promiseContractCreated) {
    promiseContractCreated = new PromiseContractCreated(
      getIdFromEventParams(event.params._contractAddress, event.block.number),
    );
  }

  promiseContractCreated.blockNumber = event.block.number;
  promiseContractCreated.owner = event.params._owner;
  promiseContractCreated.contractAddress = event.params._contractAddress;
  promiseContractCreated.promiseName = event.params._promiseName;
  promiseContractCreated.pdfUri = event.params._pdfUri;
  promiseContractCreated.partyNames = event.params._partyNames;
  promiseContractCreated.partyTwitterHandles =
    event.params._partyTwitterHandles;
  promiseContractCreated.partyAddresses = event.params._partyAddresses.map<
    Bytes
  >((e: Bytes) => e);

  promiseContractCreated.save();
}

function getIdFromEventParams(
  contractAddress: Address,
  blockNumber: BigInt,
): string {
  return contractAddress.toHexString() + '-' + blockNumber.toString();
}
