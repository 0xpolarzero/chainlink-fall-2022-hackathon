const assert = require('chai').assert;
const createRequest = require('../index.js').createRequest;

describe('createRequest', () => {
  const jobID = '1';

  context('Successful calls', () => {
    const requests = [
      {
        name: 'id not supplied',
        testData: { data: { username: 'TwitterDev' } },
      },
      {
        name: 'regular username',
        testData: { id: jobID, data: { username: 'TwitterDev' } },
      },
    ];

    requests.forEach((req) => {
      it(`${req.name}`, (done) => {
        createRequest(req.testData, (statusCode, data) => {
          assert.equal(statusCode, 200);
          assert.equal(data.jobRunID, jobID);
          assert.isNotEmpty(data.data);
          assert.isNotEmpty(data.data.result);
          assert.isNotEmpty(data.data.username);
          assert.isNotEmpty(data.data.userId);
          assert.isNotEmpty(data.data.name);
          assert.isArray(data.data.result);
          done();
        });
      });
    });

    // An empty data object should return the default username (TwitterDev)
    it('empty data', (done) => {
      createRequest({ data: {} }, (statusCode, data) => {
        assert.equal(statusCode, 200);
        assert.equal(data.jobRunID, jobID);
        assert.equal(data.data.result.length, 10);
        assert.equal(data.data.username, 'TwitterDev');
        assert.equal(data.data.userId, '2244994945');
        assert.equal(data.data.name, 'Twitter Dev');
        done();
      });
    });
  });

  context('error calls', () => {
    const requests = [
      { name: 'empty body', testData: {} },
      // {
      //   name: 'username not supplied',
      //   testData: { id: jobID, data: {} },
      // },
      // {
      //   name: 'username empty',
      //   testData: { id: jobID, data: { username: '' } },
      // },
      // {
      //   name: 'username not a string',
      //   testData: { id: jobID, data: { username: 123 } },
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
  });
});
