/**
 * For the successful tests to pass, the tweet results must be mocked
 * in the development environment.
 * @dev A variable `DEVELOPMENT` must be set to true in the .env file
 */

const assert = require('chai').assert;
const createRequest = require('../index.js').createRequest;

const { CORRECT_ADDRESS, INCORRECT_ADDRESS } = require('./mocks/mock-data.js');

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
            username: 'TwitterDev',
            address: CORRECT_ADDRESS,
          },
        },
      },
      {
        name: 'empty id',
        testData: {
          id: '',
          data: {
            username: 'TwitterDev',
            address: CORRECT_ADDRESS,
          },
        },
      },
      {
        name: 'address empty',
        testData: {
          id: jobID,
          data: {
            username: 'TwitterDev',
            address: '',
          },
        },
      },
      {
        name: 'regular username and address',
        testData: {
          id: jobID,
          data: {
            username: 'TwitterDev',
            address: CORRECT_ADDRESS,
          },
        },
      },
    ];

    requests.forEach((req) => {
      it(`${req.name}`, (done) => {
        createRequest(req.testData, (statusCode, data) => {
          console.log(data);
          assert.equal(statusCode, 200);
          assert.equal(data.jobRunID, req.name === 'empty id' ? '' : jobID);
          assert.isNotEmpty(data.data);
          assert.equal(typeof data.data.result, 'boolean');
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
          data: {
            username: '',
            address: INCORRECT_ADDRESS,
          },
        },
        (statusCode, data) => {
          assert.equal(statusCode, 200);
          assert.equal(data.jobRunID, jobID);
          assert.equal(typeof data.data.result, 'boolean');
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
        name: 'username and address not supplied',
        testData: { id: jobID, data: {} },
        expectedError: 'Required parameter not supplied: username',
      },
      {
        name: 'username not supplied',
        testData: {
          id: jobID,
          data: { address: INCORRECT_ADDRESS },
        },
        expectedError: 'Required parameter not supplied: username',
      },
      {
        name: 'address not supplied',
        testData: {
          id: jobID,
          data: { username: 'TwitterDev' },
        },
        expectedError: 'Required parameter not supplied: address',
      },
      {
        name: 'username with spaces',
        testData: {
          id: jobID,
          data: {
            username: 'Twitter Dev',
            address: INCORRECT_ADDRESS,
          },
        },
        expectedError:
          'Invalid Request: One or more parameters to your request was invalid.',
      },
      {
        name: 'username with special characters',
        testData: {
          id: jobID,
          data: {
            username: 'TwitterDev!',
            address: INCORRECT_ADDRESS,
          },
        },
        expectedError:
          'Invalid Request: One or more parameters to your request was invalid.',
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
        // This is a bit of a hack, but it works
        data: { username: 'cald02d238Aes08', address: INCORRECT_ADDRESS },
      };
      createRequest(req, (statusCode, data) => {
        assert.equal(statusCode, 200);
        assert.equal(data.jobRunID, jobID);
        assert.equal(data.data.result, false);
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
          address: INCORRECT_ADDRESS,
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
