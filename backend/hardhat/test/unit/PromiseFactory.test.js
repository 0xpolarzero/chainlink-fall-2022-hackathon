const { assert, expect } = require('chai');
const { developmentChains } = require('../../helper-hardhat-config');
const { deployments, network, ethers } = require('hardhat');

!developmentChains.includes(network.name)
  ? describe.skip
  : describe('PromiseFactory unit tests', function() {
      let deployer;
      let user;
      let promiseFactoryDeploy;
      let promiseFactory;
      let args = {};

      const createCorrectPromiseContract = async () => {
        const tx = await promiseFactory.createPromiseContract(
          args.name,
          args.uri,
          args.partyNames,
          args.partyTwitters,
          args.partyAddresses,
        );
        const txReceipt = await tx.wait(1);

        return { tx, txReceipt };
      };

      beforeEach(async () => {
        const accounts = await ethers.getSigners();
        deployer = accounts[0];
        user = accounts[1];
        await deployments.fixture('main');
        promiseFactoryDeploy = await ethers.getContract('PromiseFactory');
        promiseFactory = promiseFactoryDeploy.connect(deployer);
        args = {
          name: 'Test Agreement',
          uri: 'bafybeieyah7pyu3mrreajpt4yp7fxzkjzhpir6wu4c6ofg42o57htgmfeq',
          partyNames: ['Bob', 'Alice'],
          partyTwitters: ['@bob', '@alice'],
          partyAddresses: [deployer.address, user.address],
        };
      });

      describe('createPromiseContract', function() {
        it('Should revert if one of the required fields is empty', async () => {
          await expect(
            promiseFactory.createPromiseContract(
              args.name,
              args.uri,
              [],
              [],
              [],
            ),
          ).to.be.revertedWith(
            'PromiseFactory__createPromiseContract__EMPTY_FIELD()',
          );

          await expect(
            promiseFactory.createPromiseContract(
              '',
              args.uri,
              args.partyNames,
              args.partyTwitters,
              args.partyAddresses,
            ),
          ).to.be.revertedWith(
            'PromiseFactory__createPromiseContract__EMPTY_FIELD()',
          );
        });

        it('Should revert if there is a mismatch between names and addresses length', async () => {
          await expect(
            promiseFactory.createPromiseContract(
              args.name,
              args.uri,
              args.partyNames,
              args.partyTwitters,
              [deployer.address],
            ),
          ).to.be.revertedWith(
            'PromiseFactory__createPromiseContract__INCORRECT_FIELD_LENGTH()',
          );
        });

        it('Should revert if the same address or Twitter handle is used twice', async () => {
          await expect(
            promiseFactory.createPromiseContract(
              args.name,
              args.uri,
              args.partyNames,
              args.partyTwitters,
              [deployer.address, deployer.address],
            ),
          ).to.be.revertedWith(
            'PromiseFactory__createPromiseContract__DUPLICATE_FIELD()',
          );

          await expect(
            promiseFactory.createPromiseContract(
              args.name,
              args.uri,
              args.partyNames,
              ['@bob', '@bob'],
              args.partyAddresses,
            ),
          ).to.be.revertedWith(
            'PromiseFactory__createPromiseContract__DUPLICATE_FIELD()',
          );
        });

        it('Should revert if the promise name is more than 70 characters', async () => {
          const name = 'a'.repeat(71);
          await expect(
            promiseFactory.createPromiseContract(
              name,
              args.uri,
              args.partyNames,
              args.partyTwitters,
              args.partyAddresses,
            ),
          ).to.be.revertedWith(
            'PromiseFactory__createPromiseContract__INCORRECT_FIELD_LENGTH()',
          );
        });

        it('Should revert if the PDF URI is not a valid IPFS URI', async () => {
          // It should revert if it's less than 5 bytes
          await expect(
            promiseFactory.createPromiseContract(
              args.name,
              'bafybe',
              args.partyNames,
              args.partyTwitters,
              args.partyAddresses,
            ),
          ).to.be.revertedWith(
            'PromiseFactory__createPromiseContract__INVALID_URI()',
          );

          // It should revert if it doesn't match the allowed characters in Base58
          await expect(
            promiseFactory.createPromiseContract(
              args.name,
              'bafybeieyah7pyu3mrreajpt4yp7fxzkjzhpir6wu4c6ofg42o57htgmfeq!',
              args.partyNames,
              args.partyTwitters,
              args.partyAddresses,
            ),
          ).to.be.revertedWith(
            'PromiseFactory__createPromiseContract__INVALID_URI()',
          );
        });

        it('Should create a new PromiseContract', async () => {
          const { txReceipt } = await createCorrectPromiseContract();
          const promiseContractAddress = txReceipt.events[1].address;
          const promiseContract = await ethers.getContractAt(
            'PromiseContract',
            promiseContractAddress,
          );
          const promiseContractOwner = await promiseContract.getOwner();

          assert.equal(promiseContractOwner, deployer.address);
        });

        it('Should create a mapping between the sender and the child contract addresses', async () => {
          const { txReceipt } = await createCorrectPromiseContract();
          const expectedPromiseContractAddress = txReceipt.events[1].address;

          const receivedPromiseContractAddresses = await promiseFactory.getPromiseContractAddresses(
            deployer.address,
          );

          assert.equal(
            receivedPromiseContractAddresses[0],
            expectedPromiseContractAddress,
          );
        });

        it('Should emit a PromiseContractCreated event with the right arguments', async () => {
          const { tx, txReceipt } = await createCorrectPromiseContract();
          const promiseContractAddress = txReceipt.events[1].address;

          expect(tx)
            .to.emit(promiseFactory, 'PromiseContractCreated')
            .withArgs(
              deployer.address,
              promiseContractAddress,
              args.name,
              args.uri,
              args.partyNames,
              args.partyTwitters,
              args.partyAddresses,
            );
        });

        it('Should return the correct number of child contracts for a user', async () => {
          await createCorrectPromiseContract();
          await createCorrectPromiseContract();

          const promiseContractsLength = await promiseFactory.getPromiseContractCount(
            deployer.address,
          );
          assert.equal(promiseContractsLength, 2);
        });
      });

      describe('addTwitterVerifiedUser', function() {
        it('Should not allow anyone other than the TwitterVerification contract to add a Twitter verified user', async () => {
          await expect(
            promiseFactory.addTwitterVerifiedUser(deployer.address, 'username'),
          ).to.be.revertedWith('PromiseFactory__NOT_VERIFIER()');
        });

        it('Should not allow anyone else than the owner to call `setOperator` or `setVerifier`', async () => {
          await expect(promiseFactory.setOperator(ethers.constants.AddressZero))
            .to.not.be.reverted;

          await expect(
            promiseFactory.connect(user).setOperator(user.address),
          ).to.be.revertedWith('PromiseFactory__NOT_OWNER()');

          await expect(
            promiseFactory.connect(user).setVerifier(user.address),
          ).to.be.revertedWith('PromiseFactory__NOT_OWNER()');
        });

        // The rest of the tests are performed in ./VerifyTwitter.test.js
      });
    });
