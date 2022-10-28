const { expect } = require('chai');
const assert = require('chai').assert;
const createRequest = require('../index.js').createRequest;
const createMockRequest = require('./mocks/mock-index.js').createMockRequest;
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
    // Requests to the Twitter API
    const requests = [
      {
        name: 'id not supplied',
        testData: { data: { username: 'TwitterDev', signature: '0x' } },
      },
      {
        name: 'regular username',
        testData: {
          id: jobID,
          data: { username: 'TwitterDev', signature: '0x' },
        },
      },
    ];

    // Requests to the mock data to test the signature verification
    const mockRequests = [
      {
        name: 'correct signature',
        testData: {
          id: jobID,
          data: { username: 'TwitterDev', signature: CORRECT_SIGNATURE },
        },
      },
      {
        name: 'incorrect signature',
        testData: {
          id: jobID,
          data: { username: 'TwitterDev', signature: INCORRECT_SIGNATURE },
        },
      },
    ];

    requests.forEach((req) => {
      it(`${req.name}`, (done) => {
        createRequest(req.testData, (statusCode, data) => {
          assert.equal(statusCode, 200);
          assert.equal(data.jobRunID, jobID);
          assert.isNotEmpty(data.data);
          assert.typeOf(data.data.result, 'boolean');
          assert.isNotEmpty(data.data.username);
          assert.isNotEmpty(data.data.userId);
          assert.isNotEmpty(data.data.name);
          done();
        });
      });
    });

    mockRequests.forEach((req) => {
      it(`${req.name}`, (done) => {
        createMockRequest(req.testData, (statusCode, data) => {
          assert.equal(statusCode, 200);
          assert.equal(data.jobRunID, jobID);
          assert.isNotEmpty(data.data);
          assert.equal(data.data.result, req.name === 'correct signature');
          assert.isNotEmpty(data.data.username);
          assert.isNotEmpty(data.data.userId);
          assert.isNotEmpty(data.data.name);
          done();
        });
      });
    });

    // An empty ID should work
    it('empty id', (done) => {
      createRequest(
        { id: '', data: { username: 'TwitterDev', signature: '0x' } },
        (statusCode, data) => {
          assert.equal(statusCode, 200);
          assert.equal(data.jobRunID, '');
          assert.typeOf(data.data.result, 'boolean');
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
      },
      {
        name: 'username not supplied',
        testData: { id: jobID, data: { signature: '0x' } },
      },
      {
        name: 'signature not supplied',
        testData: { id: jobID, data: { username: 'TwitterDev' } },
      },
      {
        name: 'username empty',
        testData: { id: jobID, data: { username: '', signature: '0x' } },
      },
      {
        name: 'signature empty',
        testData: {
          id: jobID,
          data: { username: 'TwitterDev', signature: '' },
        },
      },
      {
        name: 'username not a string',
        testData: { id: jobID, data: { username: 12345 } },
      },
      {
        name: 'username with spaces',
        testData: { id: jobID, data: { username: 'Twitter Dev' } },
      },
      {
        name: 'username with special characters',
        testData: { id: jobID, data: { username: 'TwitterDev!' } },
      },
    ];

    requests.forEach((req) => {
      it(`${req.name}`, (done) => {
        createRequest(req.testData, (statusCode, data) => {
          assert.equal(statusCode, 500);
          assert.equal(data.jobRunID, jobID);
          assert.equal(data.status, 'errored');
          assert.isNotEmpty(data.error);
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
        assert.equal(
          data.error,
          'AdapterError: Error: Request failed with code 400 - Invalid Request: One or more parameters to your request was invalid. (see https://api.twitter.com/2/problems/invalid-request)',
        );
        done();
      });
    });
  });
});
