const { assert, expect } = require('chai');
const { developmentChains } = require('../../helper-hardhat-config');
const { deployments, network, ethers } = require('hardhat');

!developmentChains.includes(network.name)
  ? describe.skip
  : describe('MasterContract unit tests', function() {
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
          // Here the child contract will emit and event once created by the master contract
          // So we need to access the events from the child contract
          const filter = childContract.filters.ParticipantCreated();
          const logs = await childContract.queryFilter(filter);

          const participantFirst = {
            name: logs[0].args.participantName,
            twitter: logs[0].args.participantTwitterHandle,
            address: logs[0].args.participantAddress,
          };

          const participantSecond = {
            name: logs[1].args.participantName,
            twitter: logs[1].args.participantTwitterHandle,
            address: logs[1].args.participantAddress,
          };

          assert(
            logs[0].event === 'ParticipantCreated' &&
              logs[1].event === 'ParticipantCreated',
          );

          assert.equal(participantFirst.name, 'Bob');
          assert.equal(participantFirst.twitter, '@bob');
          assert.equal(participantFirst.address, userFirst.address);

          assert.equal(participantSecond.name, 'Alice');
          assert.equal(participantSecond.twitter, '@alice');
          assert.equal(participantSecond.address, userSecond.address);
        });
      });
    });
