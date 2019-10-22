/**
 * @namespace PodBasicService
 */

// Native Modules
const querystring = require('querystring');

// External Modules
const axios = require('axios');
const qs = require('qs');

// POD Modules
const util = require('pod-utilities');

// Project Modules
const config = require('./config');
const schema = require('./schema');
const generalUrls = require('./urls');

// Variable Initialization
const errors = config.errors;

/**
 * PodBasicService
 * @memberOf PodBasicService
 */
class PodBasicService {
  constructor (interfaceSchemas, interfaceApiUrls, confObj, moduleName, isProduction) {
    // Config Validation
    let validateResult = util.validate(interfaceSchemas.moduleConfig || {}, confObj);
    if (!validateResult.status) {
      throw new util.PodError(errors.invalidConfig.code, errors.invalidConfig.message + ' moduleName:' + moduleName + ' ' + JSON.stringify(validateResult.errors), validateResult.errors);
    }

    // SERVER_TYPE Validation
    let serverType;
    if (isProduction) {
      serverType = 'production';
    }
    else {
      serverType = process.env.SERVER_TYPE;
    }

    if (serverType) {
      serverType = serverType.toLowerCase();
    }
    if (!serverType || (serverType !== config.serverType.production && serverType !== config.serverType.sandbox)) {
      throw new util.PodError(errors.invalidConfig.code, errors.envVarMessage);
    }
    else {
      this.urls = config.defaultUrls[serverType];
    }

    this.apiUrls = Object.assign(generalUrls, interfaceApiUrls);
    this.schemas = Object.assign(schema, interfaceSchemas);
    this.errors = errors;
  }

  // #1
  /**
  * @description This function sends the request to the server
  * @param {string} baseUrl - This is the base url of your service
  * @param {string} apiPath - This is the API path
  * @param {string} method - This is the HTTP method
  * @param {object} headers - This is the request headers
  * @param {object} data - This is the request data
  * @param {boolean} [isUrlEncoded] - This determines if we have to change data to a querystring format
  * @param {string} [urlTrail] - This will be cancated to url
  * @returns {Promise}
  */
  request (baseUrl, apiPath, method, headers, data, hasBrackets, isUrlEncoded, urlTrail) {
    let options = {
      url: this.appendUrls(baseUrl, apiPath, urlTrail),
      method: method
    };
    let isPodStandard = false;

    this.addHeaders(options, headers);
    this.addBody(options, method, headers, data, hasBrackets, isUrlEncoded);

    return axios(options)
      .then((result) => {
        result = result.data;
        if (this.isPodStandard(result)) { // Pod service standard response is returned (result has to be an object with hasError property)
          isPodStandard = true;
          if (!result.hasError) { // No error occured (hasError considered to be a boolean)
            return result; // Maybe we need to check for other properties in result before returning it
          }
          else {
            // Uses errorCode (considered to be a number) & message (considered to be a string) in the response
            // Or unknowCode and unknownPhrase if these properties does not exists
            throw this.createErrorFromPodReponse(result);
          }
        }
        else {
          return result;
        }
      })
      .catch((error) => {
        if (isPodStandard) { // Our standard error object {code: considered to be a number, message: considered to be a stringّ}
          throw error;
        }
        else {
          if (error.hasOwnProperty('response') && error.response) { // Checks Restful Errors
            let code = error.response.status || errors.unexpected.code;
            let message = error.response.data || error.response.statusText || errors.unexpected.message;
            throw new util.PodError(code, message, null);
          }
          else if (error.hasOwnProperty('code')) { // Checks for connection error
            throw new util.PodError(errors.connection.code, errors.connection.message, null);
          }
          else {
            throw new util.PodError(errors.unexpected.code, errors.unexpected.message, null);
          }
        }
      });
  }

  // #2
  /**
   * @description This function checks if headers is an object then adds the headers object to options
   * @param {object} options
   * @param {object} headers
   */
  addHeaders (options, headers) {
    if (typeof headers === 'object') {
      options.headers = headers;
    }
  }

  // #3
  /**
   * @description This function checks the method and headers to add data to options correctly
   * @param {object} options
   * @param {string} method
   * @param {object} headers
   * @param {object} data
   * @param {boolean} [isUrlEncoded] - determines if we have to change data to a querystring format
   */
  addBody (options, method, headers, data, hasBrackets, isUrlEncoded) {
    if (!hasBrackets) {
      if (typeof method === 'string' && typeof data === 'object') {
        if (method.toLowerCase() === 'get') {
          options.params = data;
        }
        else if (this.isUrlencoded(headers)) {
          options.data = (qs.stringify(data)).replace(/%5B\d+%5D/g, '%5B%5D');
        }
        else if (isUrlEncoded) {
          options.data = options.data = (qs.stringify(data)).replace(/%5B\d+%5D/g, '%5B%5D');
        }
        else {
          options.data = data;
        }
      }
    }
    else {
      if (typeof method === 'string' && typeof data === 'object') {
        let brackets = this.splitDataBasedBracket(data, hasBrackets);
        if (method.toLowerCase() === 'get') {
          options.url += '?' + this.createQueryParam(brackets);
        }
        else if (this.isUrlencoded(headers)) {
          options.data = this.createQueryParam(brackets);
        }
        else if (isUrlEncoded) {
          options.data = this.createQueryParam(brackets);
        }
        else {
          options.data = data;
        }
      }
    }
  }

  // #4
  /**
   * @description This function checks the header object for application/x-www-form-urlencoded property
   * @param {object} headers
   * @returns {boolean}
   */
  isUrlencoded (headers) {
    let isEncoded = false;
    if (typeof headers === 'object' && headers.hasOwnProperty('Content-Type') && typeof headers['Content-Type'] === 'string') {
      if (headers['Content-Type'].toLowerCase() === 'application/x-www-form-urlencoded') {
        isEncoded = true;
      }
    }
    return isEncoded;
  }

  // #5
  /**
   * @description This function checks if the input param is in Pod service standard formatِ
   * @param {object} inpParam
   * @returns {boolean}
   */
  isPodStandard (inpParam) {
    let isStandard = false;
    if (typeof inpParam === 'object' && (inpParam.hasOwnProperty('hasError') || inpParam.hasOwnProperty('HasError'))) {
      isStandard = true;
    }
    return isStandard;
  }

  // #6
  /**
   * @description This function creates our standard error object from the standard service reponse
   * @param {object} PodStandardObj
   * @returns {object}
   */
  createErrorFromPodReponse (podStandardObj) {
    let code = podStandardObj.hasOwnProperty('ErrorCode') ? podStandardObj.ErrorCode : errors.unexpected.code;
    code = podStandardObj.hasOwnProperty('errorCode') ? podStandardObj.errorCode : code;

    let message = podStandardObj.hasOwnProperty('errorDescription') ? podStandardObj.errorDescription : errors.unexpected.message;
    message = podStandardObj.hasOwnProperty('Message') ? podStandardObj.Message : message;
    message = podStandardObj.hasOwnProperty('message') ? podStandardObj.message : message;

    return new util.PodError(code, message, podStandardObj);
  }

  // #7
  /**
   * @description This function create the final url for the request
   * @param {string} baseUrl
   * @param {string} apiPath
   * @param {string} [urlTrail]
   * @returns {string}
   */
  appendUrls (baseUrl, apiPath, urlTrail) { // Use an external module
    let finalUrl;
    finalUrl = this.checkAndAppend(baseUrl, apiPath);
    if (urlTrail) {
      finalUrl = this.checkAndAppend(finalUrl, urlTrail);
    }
    return finalUrl;
  }

  // #8
  /**
   * @description This function adds a path to a url to form the complete url
   * @param {string} firstpart
   * @param {string} secondPart
   * @returns {string}
   */
  checkAndAppend (firstpart, secondPart) {
    let fullUrl;
    if (firstpart[firstpart.length - 1] !== '/' && secondPart[0] !== '/') {
      fullUrl = firstpart + '/' + secondPart;
    }
    else if (firstpart[firstpart.length - 1] === '/' && secondPart[0] === '/') {
      fullUrl = firstpart.substr(0, firstpart.length - 1) + secondPart;
    }
    else {
      fullUrl = firstpart + secondPart;
    }
    return fullUrl;
  }

  // #9
  /**
   * @description This function sends an http request
   * @param {string} apiName
   * @param {object} data
   * @param {object} headers
   * @param {boolean} isUrlEncoded - This determines if we have to change data to a querystring format
   * @param {string} [urlTrail] - Will be added to the end of url
   * @returns {Promise}
   */
  callService (apiName, headers, data, hasBrackets, isUrlEncoded, urlTrail) {
    return this.request(this.urls[this.apiUrls[apiName].baseUrl], this.apiUrls[apiName].subUrl, this.apiUrls[apiName].method,
      headers, data, hasBrackets, isUrlEncoded, urlTrail);
  }

  // #10
  /**
   * @description This function validates the body of api request
   * @param {string} apiName
   * @param {object} data
   */
  validateBody (apiName, data) {
    let validateResult = util.validate(this.schemas[apiName].body, data);
    if (!validateResult.status) {
      throw new util.PodError(errors.invalidParams.code, JSON.stringify(validateResult.errors), validateResult.errors);
    }
  }

  // #11
  /**
   * @description This function validates the header of api request
   * @param {string} apiName
   * @param {object} header
   */
  validateHeaders (apiName, header) {
    let validateResult = util.validate(this.schemas[apiName].header, header);
    if (!validateResult.status) {
      throw new util.PodError(errors.invalidParams.code, JSON.stringify(validateResult.errors), validateResult.errors);
    }
  }

  // #12
  /**
   * @description This function checks the body of the request, checks headers of the request & sends the http request
   * @param {string} apiName
   * @param {object} data
   * @param {object} headers
   * @param {boolean} [isUrlEncoded] - This determines if we have to change data to a querystring format
   * @param {string} [urlTrail]
   */
  validateAndCall (apiName, headers, data, hasBrackets, isUrlEncoded, urlTrail) {
    if (!data) {
      data = {};
    }
    if (!headers) {
      headers = {};
    }
    try {
      this.validateBody(apiName, data);
      this.validateHeaders(apiName, headers);
    }
    catch (e) {
      return Promise.reject(e);
    }
    return this.callService(apiName, headers, data, hasBrackets, isUrlEncoded, urlTrail);
  }

  // #13
  /**
  * @description This function trims the objects, checks the body of the request, checks headers of the request & sends the http request
  * @param {string} apiName
  * @param {object} data
  * @param {object} headers
  * @param {boolean} [isUrlEncoded] - This determines if we have to change data to a querystring format
  * @param {string} [urlTrail]
  * @param {object} [trimOptions]
  */
  trimValidateAndCall (apiName, headers, data, hasBrackets, isUrlEncoded, urlTrail, trimOptions) {
    if (!data) {
      data = {};
    }
    if (!headers) {
      headers = {};
    }

    if (trimOptions && trimOptions.hasOwnProperty('headers') && !trimOptions.headers) {
      headers = util.trimNestedObject(headers);
    }
    else {
      headers = util.trimNestedObject(headers);
    }

    if (trimOptions && trimOptions.hasOwnProperty('body') && !trimOptions.body) {
      data = util.trimNestedObject(data);
    }
    else {
      data = util.trimNestedObject(data);
    }

    try {
      this.validateBody(apiName, data);
      this.validateHeaders(apiName, headers);
    }
    catch (e) {
      return Promise.reject(e);
    }
    return this.callService(apiName, headers, data, hasBrackets, isUrlEncoded, urlTrail);
  }

  // #14
  /**
   * @description This function checks the body of the request & sends the http request
   * @param {string} apiName
   * @param {object} data
   * @param {object} headers
   * @param {boolean} [isUrlEncoded] - This determines if we have to change data to a querystring format
   * @param {string} [urlTrail]
   */
  validateBodyAndCall (apiName, headers, data, hasBrackets, isUrlEncoded, urlTrail) {
    if (!data) {
      data = {};
    }
    if (!headers) {
      headers = {};
    }
    try {
      this.validateBody(apiName, data);
    }
    catch (e) {
      return Promise.reject(e);
    }
    return this.callService(apiName, headers, data, hasBrackets, isUrlEncoded, urlTrail);
  }

  // #15
  /**
     * @description This function trims & checks the body of the request & sends the http request
     * @param {string} apiName
     * @param {object} data
     * @param {object} headers
     * @param {boolean} [isUrlEncoded] - This determines if we have to change data to a querystring format
     * @param {string} [urlTrail]
     * @param {object} [trimOptions]
     */
  trimValidateBodyAndCall (apiName, headers, data, hasBrackets, isUrlEncoded, urlTrail, trimOptions) {
    if (!data) {
      data = {};
    }
    if (!headers) {
      headers = {};
    }

    if (trimOptions && trimOptions.hasOwnProperty('headers') && !trimOptions.headers) {
      headers = util.trimNestedObject(headers);
    }
    else {
      headers = util.trimNestedObject(headers);
    }

    if (trimOptions && trimOptions.hasOwnProperty('body') && !trimOptions.body) {
      data = util.trimNestedObject(data);
    }
    else {
      data = util.trimNestedObject(data);
    }

    try {
      this.validateBody(apiName, data);
    }
    catch (e) {
      return Promise.reject(e);
    }
    return this.callService(apiName, headers, data, hasBrackets, isUrlEncoded, urlTrail);
  }

  // #16
  /**
   * @description This function adds the _token_issuer_ to headers with value of 1
   * @param {object} headers
   */
  addDefaultTokenIssuer (headers) {
    if (!headers.hasOwnProperty('_token_issuer_')) {
      headers._token_issuer_ = config.defaultTokenIssuer;
    }
  }

  // #17
  /**
   * @description This function returns the default token issuer which is 1
   * @param {object} headers
   */
  getDefaultTokenIssuer () {
    return parseInt(process.env.TOKEN_ISSUER) || config.defaultTokenIssuer;
  }

  // #18
  /**
   * @description This function returns an ott
   * @param {object} data
   * @returns {Promise}
   */
  /* getOtt (data) {
    let apiName = 'getOtt';
    let headers = {};

    if (typeof data !== 'object') {
      data = {};
    }
    else {
      data = util.clone(data);
    }

    try {
      this.validateBody(apiName, data);
    }
    catch (e) {
      return Promise.reject(e);
    }

    headers._token_ = data._token_;
    headers._token_issuer_ = data._token_issuer_ || this.getDefaultTokenIssuer();
    delete data._token_;
    delete data._token_issuer_;

    return this.callService(apiName, headers, data);
  } */

  // #19
  /**
   * @description This function returns an ott
   * @param {object} data
   * @returns {Promise}
   */
  /* getGuildList (data) {
    let apiName = 'getGuildList';
    let headers = {};

    if (typeof data !== 'object') {
      data = {};
    }
    else {
      data = util.clone(data);
    }

    try {
      this.validateBody(apiName, data);
    }
    catch (e) {
      return Promise.reject(e);
    }

    headers._token_ = data._token_;
    headers._token_issuer_ = data._token_issuer_ || this.getDefaultTokenIssuer();
    delete data._token_;
    delete data._token_issuer_;

    return this.callService(apiName, headers, data);
  } */

  // #20
  /**
   * @description This function returns an ott
   * @param {object} data
   * @returns {Promise}
   */
  /* getCurrencyList (data) {
    let apiName = 'getCurrencyList';
    let headers = {};

    if (typeof data !== 'object') {
      data = {};
    }
    else {
      data = util.clone(data);
    }

    try {
      this.validateBody(apiName, data);
    }
    catch (e) {
      return Promise.reject(e);
    }

    headers._token_ = data._token_;
    headers._token_issuer_ = data._token_issuer_ || this.getDefaultTokenIssuer();
    delete data._token_;
    delete data._token_issuer_;

    return this.callService(apiName, headers, data);
  } */

  // #21
  /**
   * @description This function returns an ott
   * @param {object} data
   * @returns {Promise}
   */
  splitDataBasedBracket (data, hasBrackets) {
    let brackets = { with: {}, without: {} };
    for (let x in data) {
      if (data.hasOwnProperty(x)) {
        if (hasBrackets.hasOwnProperty(x)) {
          brackets.with[x] = data[x];
        }
        else {
          brackets.without[x] = data[x];
        }
      }
    }
    return brackets;
  }

  // #22
  /**
   * @description This function returns an ott
   * @param {object} data
   * @returns {Promise}
   */
  createQueryParam (brackets) {
    let queryParam = querystring.stringify(brackets.without) + '&' + qs.stringify(brackets.with).replace(/%5B\d+%5D/g, '%5B%5D');
    if (queryParam[0] === '&') {
      queryParam = queryParam.substr(1);
    }
    if (queryParam[queryParam.length - 1] === '&') {
      queryParam = queryParam.substr(0, queryParam.length - 1);
    }
    return queryParam;
  }
}

module.exports = PodBasicService;
