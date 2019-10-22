module.exports = {
  // #10
  getOtt: {
    body: {
      type: 'object',
      properties: {
        _token_: {
          notEmpty: []
        },
        _token_issuer_: {
          type: 'integer'
        }
      },
      required: ['_token_'],
      additionalProperties: false
    }
  },

  // #11
  getGuildList: {
    body: {
      type: 'object',
      properties: {
        _token_: {
          notEmpty: []
        },
        _token_issuer_: {
          type: 'integer'
        },
        offset: {
          type: 'integer',
          minimum: 0
        },
        size: {
          type: 'integer',
          minimum: 1
        }
      },
      required: ['_token_'],
      additionalProperties: false
    }
  },

  // #12
  getCurrencyList: {
    body: {
      type: 'object',
      properties: {
        _token_: {
          notEmpty: []
        },
        _token_issuer_: {
          type: 'integer'
        }
      },
      required: ['_token_'],
      additionalProperties: false
    }
  }
};
