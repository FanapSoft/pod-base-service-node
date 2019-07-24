const PodBasicService = require('../lib/main');
const expect = require('chai').expect;

const InterfaceApiUrls = {
  guildCode: {
    baseUrl: 'platformAddress',
    subUrl: '/nzh/guildList',
    method: 'GET'
  }
};

const InterfaceSchemas = {
  guildCode: {
    header: {
      type: 'object',
      properties: {
        _token_: {
          type: 'string'
        },
        _token_issuer_: {
          type: 'string'
        }
      },
      required: ['_token_', '_token_issuer_'],
      additionalProperties: false
    },
    body: {
      type: 'object',
      properties: {
        name: {
          type: 'string'
        },
        offset: {
          type: 'string'
        },
        size: {
          type: 'string'
        }
      },
      required: [],
      additionalProperties: false
    }
  }
};
const podBasicService = new PodBasicService(InterfaceSchemas, InterfaceApiUrls);

describe('Just Call A POD API', function () {
  this.timeout(5000);
  it('validateAndCall -> correct request', function (done) {
    podBasicService.validateAndCall('guildCode', { _token_: '2ffa86c3775e4883b4033269a5d18166', _token_issuer_: '1' },
      { offset: '0', size: '10' })
      .then(function (result) {
        // console.log(JSON.stringify(result, null, 2));
        expect(result).to.have.property('hasError', false);
        expect(result).to.have.property('result');
        done();
      })
      .catch(function (error) {
        console.log(error);
        done(new Error());
      });
  });
});

describe('Just Call A POD API with trim', function () {
  this.timeout(5000);
  it('validateAndCall -> correct request', function (done) {
    podBasicService.trimValidateAndCall('guildCode', { _token_: '  2ffa86c3775e4883b4033269a5d18166  ', _token_issuer_: '1' },
      { offset: '0', size: '  10   ' })
      .then(function (result) {
        // console.log(JSON.stringify(result, null, 2));
        expect(result).to.have.property('hasError', false);
        expect(result).to.have.property('result');
        done();
      })
      .catch(function (error) {
        console.log(error);
        done(new Error());
      });
  });
});

describe('Just Call A POD API with callService function', function () {
  this.timeout(5000);
  it('validateAndCall -> correct request', function (done) {
    podBasicService.callService('guildCode', { _token_: '2ffa86c3775e4883b4033269a5d18166', _token_issuer_: '1' },
      { offset: '0', size: '10' })
      .then(function (result) {
        // console.log(JSON.stringify(result, null, 2));
        expect(result).to.have.property('hasError', false);
        expect(result).to.have.property('result');
        done();
      })
      .catch(function (error) {
        console.log(error);
        done(new Error());
      });
  });
});
