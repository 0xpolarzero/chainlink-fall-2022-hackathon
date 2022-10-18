import { newMockEvent } from "matchstick-as"
import { ethereum, Address } from "@graphprotocol/graph-ts"
import { ChildContractCreated } from "../generated/MasterContract/MasterContract"

export function createChildContractCreatedEvent(
  _owner: Address,
  _contractAddress: Address,
  _agreementName: string,
  _pdfUri: string,
  _partyNames: Array<string>,
  _partyTwitterHandles: Array<string>,
  _partyAddresses: Array<Address>
): ChildContractCreated {
  let childContractCreatedEvent = changetype<ChildContractCreated>(
    newMockEvent()
  )

  childContractCreatedEvent.parameters = new Array()

  childContractCreatedEvent.parameters.push(
    new ethereum.EventParam("_owner", ethereum.Value.fromAddress(_owner))
  )
  childContractCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "_contractAddress",
      ethereum.Value.fromAddress(_contractAddress)
    )
  )
  childContractCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "_agreementName",
      ethereum.Value.fromString(_agreementName)
    )
  )
  childContractCreatedEvent.parameters.push(
    new ethereum.EventParam("_pdfUri", ethereum.Value.fromString(_pdfUri))
  )
  childContractCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "_partyNames",
      ethereum.Value.fromStringArray(_partyNames)
    )
  )
  childContractCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "_partyTwitterHandles",
      ethereum.Value.fromStringArray(_partyTwitterHandles)
    )
  )
  childContractCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "_partyAddresses",
      ethereum.Value.fromAddressArray(_partyAddresses)
    )
  )

  return childContractCreatedEvent
}
