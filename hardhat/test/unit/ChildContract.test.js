const { assert, expect } = require('chai');
const { developmentChains } = require('../../helper-hardhat-config');
const { deployments, network, ethers } = require('hardhat');

!developmentChains.includes(network.name)
  ? describe.skip
  : describe.only('MasterContract unit tests', function() {
      let deployer;
      let userFirst;
      let userSecond;
      let userForbidden;
      let childContractDeploy;
      let childContract;
      let deployTxReceipt;

      beforeEach(async () => {
        const accounts = await ethers.getSigners();
        deployer = accounts[0];
        userFirst = accounts[1];
        userSecond = accounts[2];
        userForbidden = accounts[3];
        await deployments.fixture('main');
        const masterContract = (
          await ethers.getContract('MasterContract')
        ).connect(userFirst);

        const deployTx = await masterContract.createContract(
          'Test Agreement',
          'ipfs://mockURI',
          ['Bob', 'Alice'],
          ['@bob', '@alice'],
          [userFirst.address, userSecond.address],
        );
        deployTxReceipt = await deployTx.wait(1);
        const childContractAddress = deployTxReceipt.events[1].address;

        childContractDeploy = await ethers.getContractAt(
          'ChildContract',
          childContractAddress,
        );
        childContract = childContractDeploy.connect(userFirst);
      });

      describe('constructor', function() {
        it('Should initialize the variables with the right value', async () => {
          const owner = await childContract.getOwner();
          const name = await childContract.getName();
          const uri = await childContract.getPdfUri();
          const participantCount = await childContract.getParticipantCount();

          assert.equal(owner, userFirst.address);
          assert.equal(name, 'Test Agreement');
          assert.equal(uri, 'ipfs://mockURI');
          assert.equal(participantCount, 2);
        });
      });

      describe('createParticipant', function() {
        it('Should create a mapping between the participants addresses and a struct Participant', async () => {
          const participant = await childContract.getParticipant(
            userFirst.address,
          );

          assert.equal(participant.participantName, 'Bob');
          assert.equal(participant.participantTwitterHandle, '@bob');
          assert.equal(participant.participantAddress, userFirst.address);
        });

        it('Should emit an event ParticipantCreated with the right arguments', async () => {
          const masterEvent = deployTxReceipt.events[2];
          const childEvent = (await masterEvent.getTransactionReceipt())
            .events[2];
          console.log(masterEvent);

          //   assert.equal(event.event, 'ParticipantCreated');
          //   assert.equal(event.args.participantName, 'Bob');
          //   assert.equal(event.args.participantTwitterHandle, '@bob');
          //   assert.equal(event.args.participantAddress, userFirst.address);
        });
      });
    });
