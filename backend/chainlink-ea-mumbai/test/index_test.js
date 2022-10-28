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

  context.only('Successful calls', () => {
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

    requests.forEach((req) => {
      it(`${req.name}`, (done) => {
        createRequest(req.testData, (statusCode, data) => {
          console.log(data);
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
  });

  /**
   * ERROR CALLS
   */

  context('error calls', () => {
    const requests = [
      {
        name: 'username not supplied',
        testData: { id: jobID, data: {} },
      },
      // {
      //   name: 'username empty',
      //   testData: { id: jobID, data: { username: '' } },
      // },
      // {
      //   name: 'username not a string',
      //   testData: { id: jobID, data: { username: 12345 } },
      // },
      // {
      //   name: 'username with spaces',
      //   testData: { id: jobID, data: { username: 'Twitter Dev' } },
      // },
      // {
      //   name: 'username with special characters',
      //   testData: { id: jobID, data: { username: 'TwitterDev!' } },
      // },
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
        data: { username: 'notarealuser' },
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

  context('validation error calls', () => {
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
        data: { username: 'TwitterDevTwitterDevTwitterDevTwitterDev' },
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

  /**
   * SPECIAL CASES: SUCCESSFUL CALLS
   */

  context('special cases', () => {
    // An empty ID should work
    it('empty id', (done) => {
      createRequest(
        { id: '', data: { username: 'TwitterDev' } },
        (statusCode, data) => {
          assert.equal(statusCode, 200);
          assert.equal(data.jobRunID, '');
          assert.equal(data.data.result.length, 10);
          assert.equal(data.data.username, 'TwitterDev');
          assert.equal(data.data.userId, '2244994945');
          assert.equal(data.data.name, 'Twitter Dev');
          done();
        },
      );
    });

    // A username with less than 10 tweets should return the correct number of tweets
    // This test is a bit flaky, as it depends on the user's activity
    // We can assume @NoTweets is inactive since they haven't tweeted in 10 years
    it('username with less than 10 tweets', (done) => {
      createRequest(
        { id: jobID, data: { username: 'NoTweets' } },
        (statusCode, data) => {
          assert.equal(statusCode, 200);
          assert.equal(data.jobRunID, jobID);
          assert.equal(data.data.result.length, 1);
          assert.equal(data.data.username, 'NoTweets');
          assert.equal(data.data.userId, '350442910');
          assert.equal(data.data.name, 'no');
          // We can use this one to check the tweet text
          assert.equal(data.data.result[0], '108 characters left... what for?');
          done();
        },
      );
    });
  });
});
