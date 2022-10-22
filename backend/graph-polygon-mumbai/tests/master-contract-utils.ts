import { newMockEvent } from 'matchstick-as';
import { ethereum, Address } from '@graphprotocol/graph-ts';
import { PromiseContractCreated } from '../generated/PromiseFactory/PromiseFactory';

export function createPromiseContractCreatedEvent(
  _owner: Address,
  _contractAddress: Address,
  _promiseName: string,
  _pdfUri: string,
  _partyNames: Array<string>,
  _partyTwitterHandles: Array<string>,
  _partyAddresses: Array<Address>,
): PromiseContractCreated {
  let promiseContractCreatedEvent = changetype<PromiseContractCreated>(
    newMockEvent(),
  );

  promiseContractCreatedEvent.parameters = new Array();

  promiseContractCreatedEvent.parameters.push(
    new ethereum.EventParam('_owner', ethereum.Value.fromAddress(_owner)),
  );
  promiseContractCreatedEvent.parameters.push(
    new ethereum.EventParam(
      '_contractAddress',
      ethereum.Value.fromAddress(_contractAddress),
    ),
  );
  promiseContractCreatedEvent.parameters.push(
    new ethereum.EventParam(
      '_promiseName',
      ethereum.Value.fromString(_promiseName),
    ),
  );
  promiseContractCreatedEvent.parameters.push(
    new ethereum.EventParam('_pdfUri', ethereum.Value.fromString(_pdfUri)),
  );
  promiseContractCreatedEvent.parameters.push(
    new ethereum.EventParam(
      '_partyNames',
      ethereum.Value.fromStringArray(_partyNames),
    ),
  );
  promiseContractCreatedEvent.parameters.push(
    new ethereum.EventParam(
      '_partyTwitterHandles',
      ethereum.Value.fromStringArray(_partyTwitterHandles),
    ),
  );
  promiseContractCreatedEvent.parameters.push(
    new ethereum.EventParam(
      '_partyAddresses',
      ethereum.Value.fromAddressArray(_partyAddresses),
    ),
  );

  return promiseContractCreatedEvent;
}
