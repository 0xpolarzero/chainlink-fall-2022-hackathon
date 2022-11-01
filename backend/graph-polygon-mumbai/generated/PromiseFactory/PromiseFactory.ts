// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  ethereum,
  JSONValue,
  TypedMap,
  Entity,
  Bytes,
  Address,
  BigInt
} from "@graphprotocol/graph-ts";

export class PromiseContractCreated extends ethereum.Event {
  get params(): PromiseContractCreated__Params {
    return new PromiseContractCreated__Params(this);
  }
}

export class PromiseContractCreated__Params {
  _event: PromiseContractCreated;

  constructor(event: PromiseContractCreated) {
    this._event = event;
  }

  get _owner(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get _contractAddress(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get _promiseName(): string {
    return this._event.parameters[2].value.toString();
  }

  get _pdfUri(): string {
    return this._event.parameters[3].value.toString();
  }

  get _partyNames(): Array<string> {
    return this._event.parameters[4].value.toStringArray();
  }

  get _partyTwitterHandles(): Array<string> {
    return this._event.parameters[5].value.toStringArray();
  }

  get _partyAddresses(): Array<Address> {
    return this._event.parameters[6].value.toAddressArray();
  }
}

export class TwitterAddVerifiedFailed extends ethereum.Event {
  get params(): TwitterAddVerifiedFailed__Params {
    return new TwitterAddVerifiedFailed__Params(this);
  }
}

export class TwitterAddVerifiedFailed__Params {
  _event: TwitterAddVerifiedFailed;

  constructor(event: TwitterAddVerifiedFailed) {
    this._event = event;
  }

  get _owner(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get _twitterHandle(): string {
    return this._event.parameters[1].value.toString();
  }
}

export class TwitterAddVerifiedSuccessful extends ethereum.Event {
  get params(): TwitterAddVerifiedSuccessful__Params {
    return new TwitterAddVerifiedSuccessful__Params(this);
  }
}

export class TwitterAddVerifiedSuccessful__Params {
  _event: TwitterAddVerifiedSuccessful;

  constructor(event: TwitterAddVerifiedSuccessful) {
    this._event = event;
  }

  get _owner(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get _twitterHandle(): string {
    return this._event.parameters[1].value.toString();
  }
}

export class PromiseFactory extends ethereum.SmartContract {
  static bind(address: Address): PromiseFactory {
    return new PromiseFactory("PromiseFactory", address);
  }

  createPromiseContract(
    _promiseName: string,
    _pdfUri: string,
    _partyNames: Array<string>,
    _partyTwitterHandles: Array<string>,
    _partyAddresses: Array<Address>
  ): Address {
    let result = super.call(
      "createPromiseContract",
      "createPromiseContract(string,string,string[],string[],address[]):(address)",
      [
        ethereum.Value.fromString(_promiseName),
        ethereum.Value.fromString(_pdfUri),
        ethereum.Value.fromStringArray(_partyNames),
        ethereum.Value.fromStringArray(_partyTwitterHandles),
        ethereum.Value.fromAddressArray(_partyAddresses)
      ]
    );

    return result[0].toAddress();
  }

  try_createPromiseContract(
    _promiseName: string,
    _pdfUri: string,
    _partyNames: Array<string>,
    _partyTwitterHandles: Array<string>,
    _partyAddresses: Array<Address>
  ): ethereum.CallResult<Address> {
    let result = super.tryCall(
      "createPromiseContract",
      "createPromiseContract(string,string,string[],string[],address[]):(address)",
      [
        ethereum.Value.fromString(_promiseName),
        ethereum.Value.fromString(_pdfUri),
        ethereum.Value.fromStringArray(_partyNames),
        ethereum.Value.fromStringArray(_partyTwitterHandles),
        ethereum.Value.fromAddressArray(_partyAddresses)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  getOperator(): Address {
    let result = super.call("getOperator", "getOperator():(address)", []);

    return result[0].toAddress();
  }

  try_getOperator(): ethereum.CallResult<Address> {
    let result = super.tryCall("getOperator", "getOperator():(address)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  getOwner(): Address {
    let result = super.call("getOwner", "getOwner():(address)", []);

    return result[0].toAddress();
  }

  try_getOwner(): ethereum.CallResult<Address> {
    let result = super.tryCall("getOwner", "getOwner():(address)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  getPromiseContractAddresses(_owner: Address): Array<Address> {
    let result = super.call(
      "getPromiseContractAddresses",
      "getPromiseContractAddresses(address):(address[])",
      [ethereum.Value.fromAddress(_owner)]
    );

    return result[0].toAddressArray();
  }

  try_getPromiseContractAddresses(
    _owner: Address
  ): ethereum.CallResult<Array<Address>> {
    let result = super.tryCall(
      "getPromiseContractAddresses",
      "getPromiseContractAddresses(address):(address[])",
      [ethereum.Value.fromAddress(_owner)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddressArray());
  }

  getPromiseContractCount(_userAddress: Address): BigInt {
    let result = super.call(
      "getPromiseContractCount",
      "getPromiseContractCount(address):(uint256)",
      [ethereum.Value.fromAddress(_userAddress)]
    );

    return result[0].toBigInt();
  }

  try_getPromiseContractCount(
    _userAddress: Address
  ): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "getPromiseContractCount",
      "getPromiseContractCount(address):(uint256)",
      [ethereum.Value.fromAddress(_userAddress)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  getTwitterVerifiedHandle(_userAddress: Address): Array<string> {
    let result = super.call(
      "getTwitterVerifiedHandle",
      "getTwitterVerifiedHandle(address):(string[])",
      [ethereum.Value.fromAddress(_userAddress)]
    );

    return result[0].toStringArray();
  }

  try_getTwitterVerifiedHandle(
    _userAddress: Address
  ): ethereum.CallResult<Array<string>> {
    let result = super.tryCall(
      "getTwitterVerifiedHandle",
      "getTwitterVerifiedHandle(address):(string[])",
      [ethereum.Value.fromAddress(_userAddress)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toStringArray());
  }

  getVerifier(): Address {
    let result = super.call("getVerifier", "getVerifier():(address)", []);

    return result[0].toAddress();
  }

  try_getVerifier(): ethereum.CallResult<Address> {
    let result = super.tryCall("getVerifier", "getVerifier():(address)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }
}

export class ConstructorCall extends ethereum.Call {
  get inputs(): ConstructorCall__Inputs {
    return new ConstructorCall__Inputs(this);
  }

  get outputs(): ConstructorCall__Outputs {
    return new ConstructorCall__Outputs(this);
  }
}

export class ConstructorCall__Inputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }

  get _operator(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class ConstructorCall__Outputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }
}

export class AddTwitterVerifiedUserCall extends ethereum.Call {
  get inputs(): AddTwitterVerifiedUserCall__Inputs {
    return new AddTwitterVerifiedUserCall__Inputs(this);
  }

  get outputs(): AddTwitterVerifiedUserCall__Outputs {
    return new AddTwitterVerifiedUserCall__Outputs(this);
  }
}

export class AddTwitterVerifiedUserCall__Inputs {
  _call: AddTwitterVerifiedUserCall;

  constructor(call: AddTwitterVerifiedUserCall) {
    this._call = call;
  }

  get _userAddress(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get _twitterHandle(): string {
    return this._call.inputValues[1].value.toString();
  }
}

export class AddTwitterVerifiedUserCall__Outputs {
  _call: AddTwitterVerifiedUserCall;

  constructor(call: AddTwitterVerifiedUserCall) {
    this._call = call;
  }
}

export class CreatePromiseContractCall extends ethereum.Call {
  get inputs(): CreatePromiseContractCall__Inputs {
    return new CreatePromiseContractCall__Inputs(this);
  }

  get outputs(): CreatePromiseContractCall__Outputs {
    return new CreatePromiseContractCall__Outputs(this);
  }
}

export class CreatePromiseContractCall__Inputs {
  _call: CreatePromiseContractCall;

  constructor(call: CreatePromiseContractCall) {
    this._call = call;
  }

  get _promiseName(): string {
    return this._call.inputValues[0].value.toString();
  }

  get _pdfUri(): string {
    return this._call.inputValues[1].value.toString();
  }

  get _partyNames(): Array<string> {
    return this._call.inputValues[2].value.toStringArray();
  }

  get _partyTwitterHandles(): Array<string> {
    return this._call.inputValues[3].value.toStringArray();
  }

  get _partyAddresses(): Array<Address> {
    return this._call.inputValues[4].value.toAddressArray();
  }
}

export class CreatePromiseContractCall__Outputs {
  _call: CreatePromiseContractCall;

  constructor(call: CreatePromiseContractCall) {
    this._call = call;
  }

  get promiseContractAddress(): Address {
    return this._call.outputValues[0].value.toAddress();
  }
}

export class SetOperatorCall extends ethereum.Call {
  get inputs(): SetOperatorCall__Inputs {
    return new SetOperatorCall__Inputs(this);
  }

  get outputs(): SetOperatorCall__Outputs {
    return new SetOperatorCall__Outputs(this);
  }
}

export class SetOperatorCall__Inputs {
  _call: SetOperatorCall;

  constructor(call: SetOperatorCall) {
    this._call = call;
  }

  get _operator(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class SetOperatorCall__Outputs {
  _call: SetOperatorCall;

  constructor(call: SetOperatorCall) {
    this._call = call;
  }
}

export class SetVerifierCall extends ethereum.Call {
  get inputs(): SetVerifierCall__Inputs {
    return new SetVerifierCall__Inputs(this);
  }

  get outputs(): SetVerifierCall__Outputs {
    return new SetVerifierCall__Outputs(this);
  }
}

export class SetVerifierCall__Inputs {
  _call: SetVerifierCall;

  constructor(call: SetVerifierCall) {
    this._call = call;
  }

  get _verifier(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class SetVerifierCall__Outputs {
  _call: SetVerifierCall;

  constructor(call: SetVerifierCall) {
    this._call = call;
  }
}
