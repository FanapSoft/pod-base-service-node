/**
 * @namespace PodBasicService
 */

// POD Modules
const PodRequest = require('pod-request');
const utils = require('pod-utilities');

// Project Modules
const config = require('./config');

// Variable Initialization
const errors = config.errors;

/**
 * PodBasicService
 * @memberOf PodBasicService
 */
class PodBasicService extends PodRequest {
  constructor (interfaceSchemas, interfaceApiUrls, environment) {
    super();
    this.urls = (environment && environment.toLowerCase() !== 'production') ? config.defaultUrls.sandbox : config.defaultUrls.production;
    this.apiUrls = interfaceApiUrls;
    this.schemas = interfaceSchemas;
  }

  /**
   * @description This function sends an http request
   * @param {string} apiName
   * @param {object} data
   * @param {object} headers
   * @param {boolean} isUrlEncoded - This determines if we have to change data to a querystring format
   * @param {string} [urlTrail] - Will be added to the end of url
   * @returns {Promise}
   */
  callService (apiName, headers, data, isUrlEncoded, urlTrail) {
    return this.request(this.urls[this.apiUrls[apiName].baseUrl], this.apiUrls[apiName].subUrl, this.apiUrls[apiName].method,
      headers, data, isUrlEncoded, urlTrail);
  }

  /**
   * @description This function validates the body of api request
   * @param {string} apiName
   * @param {object} data
   */
  validateBody (apiName, data) {
    let validateResult = utils.validate(this.schemas[apiName].body, data);
    if (!validateResult.status) {
      throw new utils.PodError(errors.invalidParams.code, JSON.stringify(validateResult.errors));
    }
  }

  /**
   * @description This function validates the header of api request
   * @param {string} apiName
   * @param {object} header
   */
  validateHeaders (apiName, header) {
    let validateResult = utils.validate(this.schemas[apiName].header, header);
    if (!validateResult.status) {
      throw new utils.PodError(errors.invalidParams.code, JSON.stringify(validateResult.errors));
    }
  }

  /**
   * @description This function checks the body of the request, checks headers of the request & sends the http request
   * @param {string} apiName
   * @param {object} data
   * @param {object} headers
   * @param {boolean} [isUrlEncoded] - This determines if we have to change data to a querystring format
   * @param {string} [urlTrail]
   */
  validateAndCall (apiName, headers, data, isUrlEncoded, urlTrail) {
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
    return this.callService(apiName, headers, data, isUrlEncoded, urlTrail);
  }

  /**
  * @description This function trims the objects, checks the body of the request, checks headers of the request & sends the http request
  * @param {string} apiName
  * @param {object} data
  * @param {object} headers
  * @param {boolean} [isUrlEncoded] - This determines if we have to change data to a querystring format
  * @param {string} [urlTrail]
  * @param {object} [trimOptions]
  */
  trimValidateAndCall (apiName, headers, data, isUrlEncoded, urlTrail, trimOptions) {
    if (!data) {
      data = {};
    }
    if (!headers) {
      headers = {};
    }

    if (trimOptions && trimOptions.hasOwnProperty('headers') && !trimOptions.headers) {
      headers = utils.trimNestedObject(headers);
    }
    else {
      headers = utils.trimNestedObject(headers);
    }

    if (trimOptions && trimOptions.hasOwnProperty('body') && !trimOptions.body) {
      data = utils.trimNestedObject(data);
    }
    else {
      data = utils.trimNestedObject(data);
    }

    try {
      this.validateBody(apiName, data);
      this.validateHeaders(apiName, headers);
    }
    catch (e) {
      return Promise.reject(e);
    }
    return this.callService(apiName, headers, data, isUrlEncoded, urlTrail);
  }

  /**
   * @description This function checks the body of the request & sends the http request
   * @param {string} apiName
   * @param {object} data
   * @param {object} headers
   * @param {boolean} [isUrlEncoded] - This determines if we have to change data to a querystring format
   * @param {string} [urlTrail]
   */
  validateBodyAndCall (apiName, headers, data, isUrlEncoded, urlTrail) {
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
    return this.callService(apiName, headers, data, isUrlEncoded, urlTrail);
  }

  /**
     * @description This function trims & checks the body of the request & sends the http request
     * @param {string} apiName
     * @param {object} data
     * @param {object} headers
     * @param {boolean} [isUrlEncoded] - This determines if we have to change data to a querystring format
     * @param {string} [urlTrail]
     * @param {object} [trimOptions]
     */
  trimValidateBodyAndCall (apiName, headers, data, isUrlEncoded, urlTrail, trimOptions) {
    if (!data) {
      data = {};
    }
    if (!headers) {
      headers = {};
    }

    if (trimOptions && trimOptions.hasOwnProperty('headers') && !trimOptions.headers) {
      headers = utils.trimNestedObject(headers);
    }
    else {
      headers = utils.trimNestedObject(headers);
    }

    if (trimOptions && trimOptions.hasOwnProperty('body') && !trimOptions.body) {
      data = utils.trimNestedObject(data);
    }
    else {
      data = utils.trimNestedObject(data);
    }

    try {
      this.validateBody(apiName, data);
    }
    catch (e) {
      return Promise.reject(e);
    }
    return this.callService(apiName, headers, data, isUrlEncoded, urlTrail);
  }

  /**
   * @description This function adds the _token_issuer_ to headers with value of 1
   * @param {object} headers
   */
  addDefaultTokenIssuer (headers) {
    if (!headers.hasOwnProperty('_token_issuer_')) {
      headers._token_issuer_ = config.defaultTokenIssuer;
    }
  }

  /**
   * @description This function returns the default token issuer which is 1
   * @param {object} headers
   */
  getDefaultTokenIssuer () {
    return config.defaultTokenIssuer;
  }
}

module.exports = PodBasicService;
