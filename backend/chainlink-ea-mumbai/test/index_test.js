/**
 * For the successful tests to pass, the tweet results must be mocked
 * in the development environment.
 * @dev A variable `DEVELOPMENT` must be set to true in the .env file
 */

const { expect } = require('chai');
const assert = require('chai').assert;
const createRequest = require('../index.js').createRequest;

const {
  CORRECT_SIGNATURE,
  INCORRECT_SIGNATURE,
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
          data: { username: 'TwitterDev', signature: CORRECT_SIGNATURE },
        },
      },
      {
        name: 'empty id',
        testData: {
          id: '',
          data: { username: 'TwitterDev', signature: CORRECT_SIGNATURE },
        },
      },
      {
        name: 'regular username and correct signature',
        testData: {
          id: jobID,
          data: { username: 'TwitterDev', signature: CORRECT_SIGNATURE },
        },
      },
    ];

    requests.forEach((req) => {
      it(`${req.name}`, (done) => {
        createRequest(req.testData, (statusCode, data) => {
          assert.equal(statusCode, 200);
          assert.equal(data.jobRunID, req.name === 'empty id' ? '' : jobID);
          assert.isNotEmpty(data.data);
          assert.equal(data.data.result, true);
          assert.isNotEmpty(data.data.username);
          assert.isNotEmpty(data.data.userId);
          assert.isNotEmpty(data.data.name);
          done();
        });
      });
    });

    // An empty username should work - it will return the @TwitterDev account
    it('empty username', (done) => {
      createRequest(
        {
          id: jobID,
          data: { username: '', signature: CORRECT_SIGNATURE },
        },
        (statusCode, data) => {
          assert.equal(statusCode, 200);
          assert.equal(data.jobRunID, jobID);
          assert.equal(data.data.result, true);
          assert.equal(data.data.username, 'TwitterDev');
          assert.equal(data.data.userId, '2244994945');
          assert.equal(data.data.name, 'Twitter Dev');
          done();
        },
      );
    });
  });

  /**
   * ERROR CALLS
   */

  context('Error calls', () => {
    const requests = [
      {
        name: 'username and signature not supplied',
        testData: { id: jobID, data: {} },
        expectedError: 'Required parameter not supplied: username',
      },
      {
        name: 'username not supplied',
        testData: { id: jobID, data: { signature: CORRECT_SIGNATURE } },
        expectedError: 'Required parameter not supplied: username',
      },
      {
        name: 'signature not supplied',
        testData: {
          id: jobID,
          data: { username: 'TwitterDev' },
        },
        expectedError: 'Required parameter not supplied: signature',
      },
      {
        name: 'signature empty',
        testData: {
          id: jobID,
          data: { username: 'TwitterDev', signature: '' },
        },
        expectedError: 'Could not verify signature',
      },
      {
        name: 'username with spaces',
        testData: {
          id: jobID,
          data: { username: 'Twitter Dev', signature: CORRECT_SIGNATURE },
        },
        expectedError:
          'Invalid Request: One or more parameters to your request was invalid.',
      },
      {
        name: 'username with special characters',
        testData: {
          id: jobID,
          data: { username: 'TwitterDev!', signature: CORRECT_SIGNATURE },
        },
        expectedError:
          'Invalid Request: One or more parameters to your request was invalid.',
      },
      {
        name: 'incorrect signature',
        testData: {
          id: jobID,
          data: { username: 'TwitterDev', signature: INCORRECT_SIGNATURE },
        },
        expectedError: 'Could not verify signature',
      },
    ];

    requests.forEach((req) => {
      it(`${req.name}`, (done) => {
        createRequest(req.testData, (statusCode, data) => {
          const errorMessage =
            typeof data.error.message === 'string'
              ? data.error.message
              : data.error.message.message;
          assert.equal(statusCode, 500);
          assert.equal(data.jobRunID, jobID);
          assert.equal(data.status, 'errored');
          assert.include(errorMessage, req.expectedError);
          done();
        });
      });
    });

    it('username not found', (done) => {
      const req = {
        id: jobID,
        data: { username: 'notarealuser', signature: '0x' },
      };
      createRequest(req, (statusCode, data) => {
        assert.equal(statusCode, 500);
        assert.equal(data.jobRunID, jobID);
        assert.equal(data.status, 'errored');
        assert.isNotEmpty(data.error);
        done();
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
          "AdapterError: TypeError: Cannot read properties of undefined (reading 'username')",
        );
        done();
      });
    });

    // A username too long should return a validation error
    it('username too long to exist', (done) => {
      const req = {
        id: jobID,
        data: {
          username: 'TwitterDevTwitterDevTwitterDevTwitterDev',
          signature: '0x',
        },
      };
      createRequest(req, (statusCode, data) => {
        assert.equal(statusCode, 500);
        assert.equal(data.jobRunID, jobID);
        assert.equal(data.status, 'errored');
        assert.include(
          data.error.message.message,
          'Invalid Request: One or more parameters to your request was invalid.',
        );
        done();
      });
    });
  });
});
