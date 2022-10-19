import { Address, Bytes } from '@graphprotocol/graph-ts';
import { ChildContractCreated as ChildContractCreatedEvent } from '../generated/MasterContract/MasterContract';
import { ChildContractCreated } from '../generated/schema';

export function handleChildContractCreated(
  event: ChildContractCreatedEvent,
): void {
  // It should never happen that the same contract is created twice
  // But we can't ever be sure enough, so we check if the entity already exists anyway
  let childContractCreated = ChildContractCreated.load(
    getIdFromEventParams(
      event.params._promiseName,
      event.params._contractAddress,
    ),
  );

  if (!childContractCreated) {
    childContractCreated = new ChildContractCreated(
      getIdFromEventParams(
        event.params._promiseName,
        event.params._contractAddress,
      ),
    );
  }

  childContractCreated.owner = event.params._owner;
  childContractCreated.contractAddress = event.params._contractAddress;
  childContractCreated.promiseName = event.params._promiseName;
  childContractCreated.pdfUri = event.params._pdfUri;
  childContractCreated.partyNames = event.params._partyNames;
  childContractCreated.partyTwitterHandles = event.params._partyTwitterHandles;
  childContractCreated.partyAddresses = event.params._partyAddresses.map<Bytes>(
    (e: Bytes) => e,
  );

  childContractCreated.save();
}

function getIdFromEventParams(
  promiseName: String,
  contractAddress: Address,
): string {
  return promiseName + '-' + contractAddress.toHexString();
}
