const { assert, expect } = require('chai');
const { developmentChains } = require('../../helper-hardhat-config');
const { deployments, network, ethers } = require('hardhat');

!developmentChains.includes(network.name)
  ? describe.skip
  : describe('MasterContract unit tests', function() {
      let deployer;
      let user;
      let masterContractDeploy;
      let masterContract;
      let args = {};

      const createCorrectChildContract = async () => {
        const tx = await masterContract.createContract(
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
        masterContractDeploy = await ethers.getContract('MasterContract');
        masterContract = masterContractDeploy.connect(deployer);
        args = {
          name: 'Test Agreement',
          uri: 'ipfs://mockURI',
          partyNames: ['Bob', 'Alice'],
          partyTwitters: ['@bob', '@alice'],
          partyAddresses: [deployer.address, user.address],
        };
      });

      describe('createContract', function() {
        it('Should revert if one of the required fields is empty', async () => {
          await expect(
            masterContract.createContract(args.name, args.uri, [], [], []),
          ).to.be.revertedWith('MasterContract__createContract__EMPTY_FIELD()');

          await expect(
            masterContract.createContract(
              '',
              args.uri,
              args.partyNames,
              args.partyTwitters,
              args.partyAddresses,
            ),
          ).to.be.revertedWith('MasterContract__createContract__EMPTY_FIELD()');
        });

        it('Should revert if there is a mismatch between names and addresses length', async () => {
          await expect(
            masterContract.createContract(
              args.name,
              args.uri,
              args.partyNames,
              args.partyTwitters,
              [deployer.address],
            ),
          ).to.be.revertedWith(
            'MasterContract__createContract__INCORRECT_FIELD_LENGTH()',
          );
        });

        it('Should revert if the same address is used twice', async () => {
          await expect(
            masterContract.createContract(
              args.name,
              args.uri,
              args.partyNames,
              args.partyTwitters,
              [deployer.address, deployer.address],
            ),
          ).to.be.revertedWith(
            'MasterContract__createContract__DUPLICATE_ADDRESS()',
          );
        });

        it('Should create a new ChildContract', async () => {
          const { txReceipt } = await createCorrectChildContract();
          const childContractAddress = txReceipt.events[1].address;
          const childContract = await ethers.getContractAt(
            'ChildContract',
            childContractAddress,
          );
          const childContractOwner = await childContract.getOwner();

          assert.equal(childContractOwner, deployer.address);
        });

        it('Should create a mapping between the sender and the child contract addresses', async () => {
          const { txReceipt } = await createCorrectChildContract();
          const expectedChildContractAddress = txReceipt.events[1].address;

          const receivedChildContractAddresses = await masterContract.getChildContractAddresses(
            deployer.address,
          );

          assert.equal(
            receivedChildContractAddresses[0],
            expectedChildContractAddress,
          );
        });

        it('Should emit a ChildContractCreated event with the right arguments', async () => {
          const { tx, txReceipt } = await createCorrectChildContract();
          const childContractAddress = txReceipt.events[1].address;

          expect(tx)
            .to.emit(masterContract, 'ChildContractCreated')
            .withArgs(
              deployer.address,
              childContractAddress,
              args.name,
              args.uri,
              args.partyNames,
              args.partyTwitters,
              args.partyAddresses,
            );
        });

        it('Should return the correct number of child contracts for a user', async () => {
          await createCorrectChildContract();
          await createCorrectChildContract();

          const childContractsLength = await masterContract.getChildContractCount(
            deployer.address,
          );
          assert.equal(childContractsLength, 2);
        });
      });
    });
