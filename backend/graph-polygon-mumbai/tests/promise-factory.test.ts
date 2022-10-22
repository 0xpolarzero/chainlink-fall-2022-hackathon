import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address } from "@graphprotocol/graph-ts"
import { ExampleEntity } from "../generated/schema"
import { PromiseContractCreated } from "../generated/PromiseFactory/PromiseFactory"
import { handlePromiseContractCreated } from "../src/promise-factory"
import { createPromiseContractCreatedEvent } from "./promise-factory-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let _owner = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let _contractAddress = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let _promiseName = "Example string value"
    let _pdfUri = "Example string value"
    let _partyNames = ["Example string value"]
    let _partyTwitterHandles = ["Example string value"]
    let _partyAddresses = [
      Address.fromString("0x0000000000000000000000000000000000000001")
    ]
    let newPromiseContractCreatedEvent = createPromiseContractCreatedEvent(
      _owner,
      _contractAddress,
      _promiseName,
      _pdfUri,
      _partyNames,
      _partyTwitterHandles,
      _partyAddresses
    )
    handlePromiseContractCreated(newPromiseContractCreatedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("ExampleEntity created and stored", () => {
    assert.entityCount("ExampleEntity", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "ExampleEntity",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a",
      "_owner",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "ExampleEntity",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a",
      "_contractAddress",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "ExampleEntity",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a",
      "_promiseName",
      "Example string value"
    )
    assert.fieldEquals(
      "ExampleEntity",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a",
      "_pdfUri",
      "Example string value"
    )
    assert.fieldEquals(
      "ExampleEntity",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a",
      "_partyNames",
      "[Example string value]"
    )
    assert.fieldEquals(
      "ExampleEntity",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a",
      "_partyTwitterHandles",
      "[Example string value]"
    )
    assert.fieldEquals(
      "ExampleEntity",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a",
      "_partyAddresses",
      "[0x0000000000000000000000000000000000000001]"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
