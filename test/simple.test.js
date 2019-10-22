const expect = require('chai').expect;

const PodBasicService = require('../lib/main');

const InterfaceApiUrls = {
  guildCode: {
    baseUrl: 'platformAddress',
    subUrl: '/nzh/guildList',
    method: 'POST'
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
          type: 'integer'
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
          type: 'integer'
        },
        size: {
          type: 'integer'
        }
      },
      required: [],
      additionalProperties: false
    }
  }
};

process.env.SERVER_TYPE = 'production';
const podBasicService = new PodBasicService(InterfaceSchemas, InterfaceApiUrls);
const token = 'b8d2fe63ab4e486ebc481d1ff0fbde7f';
const tokenIssuer = 1;

describe('Call guildCode API with callService function', function () {
  this.timeout(5000);
  it('validateAndCall -> correct request', function (done) {
    podBasicService.callService('guildCode', { _token_: token, _token_issuer_: tokenIssuer }, { offset: 0, size: 10 })
      .then(function (result) {
        console.log(JSON.stringify(result, null, 2));
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

describe('Call issueInvoice API with callService function', function () {
  this.timeout(5000);
  it('validateAndCall -> correct request', function (done) {
    podBasicService.callService('guildCode', { _token_: token, _token_issuer_: tokenIssuer }, { offset: 0, size: 10 })
      .then(function (result) {
        console.log(JSON.stringify(result, null, 2));
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

describe('getOtt', function () {
  this.timeout(5000);
  it('validateAndCall -> correct request', function (done) {
    podBasicService.getOtt({ _token_: token, _token_issuer_: tokenIssuer })
      .then(function (result) {
        console.log(JSON.stringify(result, null, 2));
        expect(result).to.have.property('hasError', false);
        expect(result).to.have.property('ott');
        done();
      })
      .catch(function (error) {
        console.log(error);
        done(new Error());
      });
  });
});

describe('getGuildList', function () {
  this.timeout(5000);
  it('validateAndCall -> correct request', function (done) {
    podBasicService.getGuildList({ _token_: token, _token_issuer_: tokenIssuer })
      .then(function (result) {
        console.log(JSON.stringify(result, null, 2));
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

describe('getCurrencyList', function () {
  this.timeout(5000);
  it('validateAndCall -> correct request', function (done) {
    podBasicService.getCurrencyList({ _token_: token })
      .then(function (result) {
        console.log(JSON.stringify(result, null, 2));
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
