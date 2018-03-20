const Request = require("request-promise-native");

class ErrorResponse {
  constructor(error, data) {
    this.error = error;
    this.data = data;
  }
}

class HttpRequest {
  constructor(host, port = null, json = false, headers = {}) {
    let url = host;

    // if no port, assume a full url was passed, otherwise create it from the host and port
    if (port !== null) {
      url = `${host}:${port}`;
    }
    this.base_url = url;
    this.json = (json === true);
    this.headers = headers;
  }

  async request(method, url, options = {}) {
    let payload = Object.assign({
      method: method,
      url: `${this.base_url}/${url}`,
      json: this.json
    }, options);

    // doing in a separate step because Object.assign isn't recursive
    payload.headers = Object.assign(this.headers, payload.headers);

    try {
      let response = await Request(payload);
      return response;
    } catch (httpErr) {
      return Promise.reject(new ErrorResponse(httpErr.error, httpErr.response));
    }
  }

  async get(url, options = {}) {
    return this.request(HttpRequest.METHOD_GET, url, options);
  }

  async post(url, data, options = {}) {
    options.body = data;
    return this.request(HttpRequest.METHOD_POST, url, options);
  }

  async put(url, data, options = {}) {
    options.body = data;
    return this.request(HttpRequest.METHOD_PUT, url, options);
  }

  async patch(url, data, options = {}) {
    options.body = data;
    return this.request(HttpRequest.METHOD_PATCH, url, options);
  }

  async del(url, options = {}) {
    return this.request(HttpRequest.METHOD_DELETE, url, options);
  }
}

HttpRequest.METHOD_GET = "get";
HttpRequest.METHOD_POST = "post";
HttpRequest.METHOD_PUT = "put";
HttpRequest.METHOD_PATCH = "patch";
HttpRequest.METHOD_DELETE = "delete";

module.exports = HttpRequest;