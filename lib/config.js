module.exports = {
  defaultUrls: {
    sandbox: {
      platformAddress: 'http://sandbox.pod.land/srv/basic-platform/',
      ssoAddress: 'https://accounts.pod.land/',
      privateCallAddress: 'https://sandbox.pod.land:1033/',
      fileServerAddress: 'http://sandbox.pod.land:8080/'
    },
    production: {
      platformAddress: 'https://api.pod.land/srv/core/',
      ssoAddress: 'https://accounts.pod.land/',
      privateCallAddress: 'https://pay.pod.land/',
      fileServerAddress: 'https://core.pod.land/'
    }
  },
  errors: {
    invalidParams: {
      code: 887,
      message: 'Invalid parameter(s).'
    },
    invalidConfig: {
      code: 890,
      message: 'Invalid Config Parameter(s).'
    },
    connection: {
      code: 889,
      message: 'Connection Error Occurred.'
    },
    unexpected: {
      code: 888,
      message: 'Unexpected Error Occurred.'
    }
  },
  serverType: {
    sandbox: 'sandbox',
    production: 'production'
  },
  defaultTokenIssuer: 1,
  envVarMessage: 'Environmental variable SERVER_TYPE is not set! or is not set to proper value! Please set it to "Sandbox" or "Production" and try again.'
};
