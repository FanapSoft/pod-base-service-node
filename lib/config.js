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
    }
  },
  defaultTokenIssuer: 1
};
