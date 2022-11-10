const assert = require('chai').assert;
const createRequest = require('../index.js').createRequest;
const {
  PROMISE_NAME,
  PROMISE_ADDRESS,
  USER_ADDRESS,
  IPFS_CID,
  ARWEAVE_ID,
  ENCRYPTED_PROOF,
} = require('./mocks/mock-data.js');

describe('createRequest', () => {
  const jobID = '1';

  /**
   * SUCCESSFUL CALLS
   */

  context('Successful calls', () => {
    // Requests to the mock data to get fake tweets for the signature check
    const requests = [
      {
        name: 'id not supplied',
        testData: {
          data: {
            promiseName: PROMISE_NAME,
            promiseAddress: PROMISE_ADDRESS,
            userAddress: USER_ADDRESS,
            ipfsCid: IPFS_CID,
            arweaveId: ARWEAVE_ID,
            encryptedProof: ENCRYPTED_PROOF,
          },
        },
      },
      {
        name: 'empty id',
        testData: {
          id: '',
          data: {
            promiseName: PROMISE_NAME,
            promiseAddress: PROMISE_ADDRESS,
            userAddress: USER_ADDRESS,
            ipfsCid: IPFS_CID,
            arweaveId: ARWEAVE_ID,
            encryptedProof: ENCRYPTED_PROOF,
          },
        },
      },
      {
        name: 'regular call',
        testData: {
          id: jobID,
          data: {
            promiseName: PROMISE_NAME,
            promiseAddress: PROMISE_ADDRESS,
            userAddress: USER_ADDRESS,
            ipfsCid: IPFS_CID,
            arweaveId: ARWEAVE_ID,
            encryptedProof: ENCRYPTED_PROOF,
          },
        },
      },
    ];

    requests.forEach((req) => {
      it(`${req.name}`, (done) => {
        createRequest(req.testData, (statusCode, data) => {
          assert.equal(statusCode, 200);
          assert.equal(data.jobRunID, req.name === 'empty id' ? '' : jobID);
          assert.equal(data.data.result, true);
          assert.equal(data.data.promiseAddress, PROMISE_ADDRESS);
          done();
        });
      });
    });
  });

  /**
   * ERROR CALLS
   */

  context('Error calls', () => {
    const requests = [
      {
        name: 'no data supplied',
        testData: { id: jobID, data: {} },
        expectedError: 'Required parameter not supplied: promiseName',
      },
      {
        name: 'no promiseName supplied',
        testData: {
          id: jobID,
          data: {
            promiseAddress: PROMISE_ADDRESS,
            userAddress: USER_ADDRESS,
            ipfsCid: IPFS_CID,
            arweaveId: ARWEAVE_ID,
            encryptedProof: ENCRYPTED_PROOF,
          },
        },
        expectedError: 'Required parameter not supplied: promiseName',
      },
      {
        name: 'no promiseAddress supplied',
        testData: {
          id: jobID,
          data: {
            promiseName: PROMISE_NAME,
            userAddress: USER_ADDRESS,
            ipfsCid: IPFS_CID,
            arweaveId: ARWEAVE_ID,
            encryptedProof: ENCRYPTED_PROOF,
          },
        },
        expectedError: 'Required parameter not supplied: promiseAddress',
      },
      {
        name: 'no userAddress supplied',
        testData: {
          id: jobID,
          data: {
            promiseName: PROMISE_NAME,
            promiseAddress: PROMISE_ADDRESS,
            ipfsCid: IPFS_CID,
            arweaveId: ARWEAVE_ID,
            encryptedProof: ENCRYPTED_PROOF,
          },
        },
        expectedError: 'Required parameter not supplied: userAddress',
      },
      {
        name: 'no ipfsCid supplied',
        testData: {
          id: jobID,
          data: {
            promiseName: PROMISE_NAME,
            promiseAddress: PROMISE_ADDRESS,
            userAddress: USER_ADDRESS,
            arweaveId: ARWEAVE_ID,
            encryptedProof: ENCRYPTED_PROOF,
          },
        },
        expectedError: 'Required parameter not supplied: ipfsCid',
      },
      {
        name: 'no arweaveId supplied',
        testData: {
          id: jobID,
          data: {
            promiseName: PROMISE_NAME,
            promiseAddress: PROMISE_ADDRESS,
            userAddress: USER_ADDRESS,
            ipfsCid: IPFS_CID,
            encryptedProof: ENCRYPTED_PROOF,
          },
        },
        expectedError: 'Required parameter not supplied: arweaveId',
      },
      {
        name: 'no encryptedProof supplied',
        testData: {
          id: jobID,
          data: {
            promiseName: PROMISE_NAME,
            promiseAddress: PROMISE_ADDRESS,
            userAddress: USER_ADDRESS,
            ipfsCid: IPFS_CID,
            arweaveId: ARWEAVE_ID,
          },
        },
        expectedError: 'Required parameter not supplied: encryptedProof',
      },
    ];

    requests.forEach((req) => {
      it(`${req.name}`, (done) => {
        createRequest(req.testData, (statusCode, data) => {
          console.log('ERROR', data.error.message);
          const errorMessage = data.error.message.message;
          assert.equal(statusCode, 500);
          assert.equal(data.jobRunID, jobID);
          assert.equal(data.status, 'errored');
          assert.include(errorMessage, req.expectedError);
          done();
        });
      });
    });
  });

  /**
   * VALIDATION ERROR CALLS
   */

  context('Validation error calls', () => {
    // An empty body should return a TypeError
    it('empty body', (done) => {
      createRequest({}, (statusCode, data) => {
        assert.equal(statusCode, 500);
        assert.equal(data.jobRunID, jobID);
        assert.equal(data.status, 'errored');
        assert.equal(
          data.error,
          "AdapterError: TypeError: Cannot read properties of undefined (reading 'promiseName')",
        );
        done();
      });
    });
  });
});
