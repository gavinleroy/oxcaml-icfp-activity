var Telemetry2 = (function(exports) {
  "use strict";
  function getDefaultExportFromCjs(x) {
    return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
  }
  var axios$2 = { exports: {} };
  var bind;
  var hasRequiredBind;
  function requireBind() {
    if (hasRequiredBind) return bind;
    hasRequiredBind = 1;
    bind = function bind2(fn, thisArg) {
      return function wrap() {
        var args = new Array(arguments.length);
        for (var i2 = 0; i2 < args.length; i2++) {
          args[i2] = arguments[i2];
        }
        return fn.apply(thisArg, args);
      };
    };
    return bind;
  }
  var utils;
  var hasRequiredUtils;
  function requireUtils() {
    if (hasRequiredUtils) return utils;
    hasRequiredUtils = 1;
    var bind2 = requireBind();
    var toString = Object.prototype.toString;
    var kindOf = /* @__PURE__ */ (function(cache) {
      return function(thing) {
        var str = toString.call(thing);
        return cache[str] || (cache[str] = str.slice(8, -1).toLowerCase());
      };
    })(/* @__PURE__ */ Object.create(null));
    function kindOfTest(type) {
      type = type.toLowerCase();
      return function isKindOf(thing) {
        return kindOf(thing) === type;
      };
    }
    function isArray(val) {
      return Array.isArray(val);
    }
    function isUndefined(val) {
      return typeof val === "undefined";
    }
    function isBuffer(val) {
      return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor) && typeof val.constructor.isBuffer === "function" && val.constructor.isBuffer(val);
    }
    var isArrayBuffer = kindOfTest("ArrayBuffer");
    function isArrayBufferView(val) {
      var result;
      if (typeof ArrayBuffer !== "undefined" && ArrayBuffer.isView) {
        result = ArrayBuffer.isView(val);
      } else {
        result = val && val.buffer && isArrayBuffer(val.buffer);
      }
      return result;
    }
    function isString(val) {
      return typeof val === "string";
    }
    function isNumber(val) {
      return typeof val === "number";
    }
    function isObject(val) {
      return val !== null && typeof val === "object";
    }
    function isPlainObject(val) {
      if (kindOf(val) !== "object") {
        return false;
      }
      var prototype = Object.getPrototypeOf(val);
      return prototype === null || prototype === Object.prototype;
    }
    var isDate = kindOfTest("Date");
    var isFile = kindOfTest("File");
    var isBlob = kindOfTest("Blob");
    var isFileList = kindOfTest("FileList");
    function isFunction(val) {
      return toString.call(val) === "[object Function]";
    }
    function isStream(val) {
      return isObject(val) && isFunction(val.pipe);
    }
    function isFormData(thing) {
      var pattern = "[object FormData]";
      return thing && (typeof FormData === "function" && thing instanceof FormData || toString.call(thing) === pattern || isFunction(thing.toString) && thing.toString() === pattern);
    }
    var isURLSearchParams = kindOfTest("URLSearchParams");
    function trim(str) {
      return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, "");
    }
    function isStandardBrowserEnv() {
      if (typeof navigator !== "undefined" && (navigator.product === "ReactNative" || navigator.product === "NativeScript" || navigator.product === "NS")) {
        return false;
      }
      return typeof window !== "undefined" && typeof document !== "undefined";
    }
    function forEach(obj, fn) {
      if (obj === null || typeof obj === "undefined") {
        return;
      }
      if (typeof obj !== "object") {
        obj = [obj];
      }
      if (isArray(obj)) {
        for (var i2 = 0, l = obj.length; i2 < l; i2++) {
          fn.call(null, obj[i2], i2, obj);
        }
      } else {
        for (var key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            fn.call(null, obj[key], key, obj);
          }
        }
      }
    }
    function merge() {
      var result = {};
      function assignValue(val, key) {
        if (isPlainObject(result[key]) && isPlainObject(val)) {
          result[key] = merge(result[key], val);
        } else if (isPlainObject(val)) {
          result[key] = merge({}, val);
        } else if (isArray(val)) {
          result[key] = val.slice();
        } else {
          result[key] = val;
        }
      }
      for (var i2 = 0, l = arguments.length; i2 < l; i2++) {
        forEach(arguments[i2], assignValue);
      }
      return result;
    }
    function extend(a, b, thisArg) {
      forEach(b, function assignValue(val, key) {
        if (thisArg && typeof val === "function") {
          a[key] = bind2(val, thisArg);
        } else {
          a[key] = val;
        }
      });
      return a;
    }
    function stripBOM(content) {
      if (content.charCodeAt(0) === 65279) {
        content = content.slice(1);
      }
      return content;
    }
    function inherits(constructor, superConstructor, props, descriptors) {
      constructor.prototype = Object.create(superConstructor.prototype, descriptors);
      constructor.prototype.constructor = constructor;
      props && Object.assign(constructor.prototype, props);
    }
    function toFlatObject(sourceObj, destObj, filter) {
      var props;
      var i2;
      var prop;
      var merged = {};
      destObj = destObj || {};
      do {
        props = Object.getOwnPropertyNames(sourceObj);
        i2 = props.length;
        while (i2-- > 0) {
          prop = props[i2];
          if (!merged[prop]) {
            destObj[prop] = sourceObj[prop];
            merged[prop] = true;
          }
        }
        sourceObj = Object.getPrototypeOf(sourceObj);
      } while (sourceObj && (!filter || filter(sourceObj, destObj)) && sourceObj !== Object.prototype);
      return destObj;
    }
    function endsWith(str, searchString, position) {
      str = String(str);
      if (position === void 0 || position > str.length) {
        position = str.length;
      }
      position -= searchString.length;
      var lastIndex = str.indexOf(searchString, position);
      return lastIndex !== -1 && lastIndex === position;
    }
    function toArray(thing) {
      if (!thing) return null;
      var i2 = thing.length;
      if (isUndefined(i2)) return null;
      var arr = new Array(i2);
      while (i2-- > 0) {
        arr[i2] = thing[i2];
      }
      return arr;
    }
    var isTypedArray = /* @__PURE__ */ (function(TypedArray) {
      return function(thing) {
        return TypedArray && thing instanceof TypedArray;
      };
    })(typeof Uint8Array !== "undefined" && Object.getPrototypeOf(Uint8Array));
    utils = {
      isArray,
      isArrayBuffer,
      isBuffer,
      isFormData,
      isArrayBufferView,
      isString,
      isNumber,
      isObject,
      isPlainObject,
      isUndefined,
      isDate,
      isFile,
      isBlob,
      isFunction,
      isStream,
      isURLSearchParams,
      isStandardBrowserEnv,
      forEach,
      merge,
      extend,
      trim,
      stripBOM,
      inherits,
      toFlatObject,
      kindOf,
      kindOfTest,
      endsWith,
      toArray,
      isTypedArray,
      isFileList
    };
    return utils;
  }
  var buildURL;
  var hasRequiredBuildURL;
  function requireBuildURL() {
    if (hasRequiredBuildURL) return buildURL;
    hasRequiredBuildURL = 1;
    var utils2 = requireUtils();
    function encode(val) {
      return encodeURIComponent(val).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+").replace(/%5B/gi, "[").replace(/%5D/gi, "]");
    }
    buildURL = function buildURL2(url, params, paramsSerializer) {
      if (!params) {
        return url;
      }
      var serializedParams;
      if (paramsSerializer) {
        serializedParams = paramsSerializer(params);
      } else if (utils2.isURLSearchParams(params)) {
        serializedParams = params.toString();
      } else {
        var parts = [];
        utils2.forEach(params, function serialize(val, key) {
          if (val === null || typeof val === "undefined") {
            return;
          }
          if (utils2.isArray(val)) {
            key = key + "[]";
          } else {
            val = [val];
          }
          utils2.forEach(val, function parseValue(v) {
            if (utils2.isDate(v)) {
              v = v.toISOString();
            } else if (utils2.isObject(v)) {
              v = JSON.stringify(v);
            }
            parts.push(encode(key) + "=" + encode(v));
          });
        });
        serializedParams = parts.join("&");
      }
      if (serializedParams) {
        var hashmarkIndex = url.indexOf("#");
        if (hashmarkIndex !== -1) {
          url = url.slice(0, hashmarkIndex);
        }
        url += (url.indexOf("?") === -1 ? "?" : "&") + serializedParams;
      }
      return url;
    };
    return buildURL;
  }
  var InterceptorManager_1;
  var hasRequiredInterceptorManager;
  function requireInterceptorManager() {
    if (hasRequiredInterceptorManager) return InterceptorManager_1;
    hasRequiredInterceptorManager = 1;
    var utils2 = requireUtils();
    function InterceptorManager() {
      this.handlers = [];
    }
    InterceptorManager.prototype.use = function use(fulfilled, rejected, options) {
      this.handlers.push({
        fulfilled,
        rejected,
        synchronous: options ? options.synchronous : false,
        runWhen: options ? options.runWhen : null
      });
      return this.handlers.length - 1;
    };
    InterceptorManager.prototype.eject = function eject(id) {
      if (this.handlers[id]) {
        this.handlers[id] = null;
      }
    };
    InterceptorManager.prototype.forEach = function forEach(fn) {
      utils2.forEach(this.handlers, function forEachHandler(h) {
        if (h !== null) {
          fn(h);
        }
      });
    };
    InterceptorManager_1 = InterceptorManager;
    return InterceptorManager_1;
  }
  var normalizeHeaderName;
  var hasRequiredNormalizeHeaderName;
  function requireNormalizeHeaderName() {
    if (hasRequiredNormalizeHeaderName) return normalizeHeaderName;
    hasRequiredNormalizeHeaderName = 1;
    var utils2 = requireUtils();
    normalizeHeaderName = function normalizeHeaderName2(headers, normalizedName) {
      utils2.forEach(headers, function processHeader(value, name) {
        if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
          headers[normalizedName] = value;
          delete headers[name];
        }
      });
    };
    return normalizeHeaderName;
  }
  var AxiosError_1;
  var hasRequiredAxiosError;
  function requireAxiosError() {
    if (hasRequiredAxiosError) return AxiosError_1;
    hasRequiredAxiosError = 1;
    var utils2 = requireUtils();
    function AxiosError(message, code, config, request, response) {
      Error.call(this);
      this.message = message;
      this.name = "AxiosError";
      code && (this.code = code);
      config && (this.config = config);
      request && (this.request = request);
      response && (this.response = response);
    }
    utils2.inherits(AxiosError, Error, {
      toJSON: function toJSON() {
        return {
          // Standard
          message: this.message,
          name: this.name,
          // Microsoft
          description: this.description,
          number: this.number,
          // Mozilla
          fileName: this.fileName,
          lineNumber: this.lineNumber,
          columnNumber: this.columnNumber,
          stack: this.stack,
          // Axios
          config: this.config,
          code: this.code,
          status: this.response && this.response.status ? this.response.status : null
        };
      }
    });
    var prototype = AxiosError.prototype;
    var descriptors = {};
    [
      "ERR_BAD_OPTION_VALUE",
      "ERR_BAD_OPTION",
      "ECONNABORTED",
      "ETIMEDOUT",
      "ERR_NETWORK",
      "ERR_FR_TOO_MANY_REDIRECTS",
      "ERR_DEPRECATED",
      "ERR_BAD_RESPONSE",
      "ERR_BAD_REQUEST",
      "ERR_CANCELED"
      // eslint-disable-next-line func-names
    ].forEach(function(code) {
      descriptors[code] = { value: code };
    });
    Object.defineProperties(AxiosError, descriptors);
    Object.defineProperty(prototype, "isAxiosError", { value: true });
    AxiosError.from = function(error, code, config, request, response, customProps) {
      var axiosError = Object.create(prototype);
      utils2.toFlatObject(error, axiosError, function filter(obj) {
        return obj !== Error.prototype;
      });
      AxiosError.call(axiosError, error.message, code, config, request, response);
      axiosError.name = error.name;
      customProps && Object.assign(axiosError, customProps);
      return axiosError;
    };
    AxiosError_1 = AxiosError;
    return AxiosError_1;
  }
  var transitional;
  var hasRequiredTransitional;
  function requireTransitional() {
    if (hasRequiredTransitional) return transitional;
    hasRequiredTransitional = 1;
    transitional = {
      silentJSONParsing: true,
      forcedJSONParsing: true,
      clarifyTimeoutError: false
    };
    return transitional;
  }
  var toFormData_1;
  var hasRequiredToFormData;
  function requireToFormData() {
    if (hasRequiredToFormData) return toFormData_1;
    hasRequiredToFormData = 1;
    var utils2 = requireUtils();
    function toFormData(obj, formData) {
      formData = formData || new FormData();
      var stack = [];
      function convertValue(value) {
        if (value === null) return "";
        if (utils2.isDate(value)) {
          return value.toISOString();
        }
        if (utils2.isArrayBuffer(value) || utils2.isTypedArray(value)) {
          return typeof Blob === "function" ? new Blob([value]) : Buffer.from(value);
        }
        return value;
      }
      function build(data2, parentKey) {
        if (utils2.isPlainObject(data2) || utils2.isArray(data2)) {
          if (stack.indexOf(data2) !== -1) {
            throw Error("Circular reference detected in " + parentKey);
          }
          stack.push(data2);
          utils2.forEach(data2, function each(value, key) {
            if (utils2.isUndefined(value)) return;
            var fullKey = parentKey ? parentKey + "." + key : key;
            var arr;
            if (value && !parentKey && typeof value === "object") {
              if (utils2.endsWith(key, "{}")) {
                value = JSON.stringify(value);
              } else if (utils2.endsWith(key, "[]") && (arr = utils2.toArray(value))) {
                arr.forEach(function(el) {
                  !utils2.isUndefined(el) && formData.append(fullKey, convertValue(el));
                });
                return;
              }
            }
            build(value, fullKey);
          });
          stack.pop();
        } else {
          formData.append(parentKey, convertValue(data2));
        }
      }
      build(obj);
      return formData;
    }
    toFormData_1 = toFormData;
    return toFormData_1;
  }
  var settle;
  var hasRequiredSettle;
  function requireSettle() {
    if (hasRequiredSettle) return settle;
    hasRequiredSettle = 1;
    var AxiosError = requireAxiosError();
    settle = function settle2(resolve, reject, response) {
      var validateStatus = response.config.validateStatus;
      if (!response.status || !validateStatus || validateStatus(response.status)) {
        resolve(response);
      } else {
        reject(new AxiosError(
          "Request failed with status code " + response.status,
          [AxiosError.ERR_BAD_REQUEST, AxiosError.ERR_BAD_RESPONSE][Math.floor(response.status / 100) - 4],
          response.config,
          response.request,
          response
        ));
      }
    };
    return settle;
  }
  var cookies;
  var hasRequiredCookies;
  function requireCookies() {
    if (hasRequiredCookies) return cookies;
    hasRequiredCookies = 1;
    var utils2 = requireUtils();
    cookies = utils2.isStandardBrowserEnv() ? (
      // Standard browser envs support document.cookie
      /* @__PURE__ */ (function standardBrowserEnv() {
        return {
          write: function write(name, value, expires, path, domain, secure) {
            var cookie = [];
            cookie.push(name + "=" + encodeURIComponent(value));
            if (utils2.isNumber(expires)) {
              cookie.push("expires=" + new Date(expires).toGMTString());
            }
            if (utils2.isString(path)) {
              cookie.push("path=" + path);
            }
            if (utils2.isString(domain)) {
              cookie.push("domain=" + domain);
            }
            if (secure === true) {
              cookie.push("secure");
            }
            document.cookie = cookie.join("; ");
          },
          read: function read(name) {
            var match = document.cookie.match(new RegExp("(^|;\\s*)(" + name + ")=([^;]*)"));
            return match ? decodeURIComponent(match[3]) : null;
          },
          remove: function remove(name) {
            this.write(name, "", Date.now() - 864e5);
          }
        };
      })()
    ) : (
      // Non standard browser env (web workers, react-native) lack needed support.
      /* @__PURE__ */ (function nonStandardBrowserEnv() {
        return {
          write: function write() {
          },
          read: function read() {
            return null;
          },
          remove: function remove() {
          }
        };
      })()
    );
    return cookies;
  }
  var isAbsoluteURL;
  var hasRequiredIsAbsoluteURL;
  function requireIsAbsoluteURL() {
    if (hasRequiredIsAbsoluteURL) return isAbsoluteURL;
    hasRequiredIsAbsoluteURL = 1;
    isAbsoluteURL = function isAbsoluteURL2(url) {
      return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
    };
    return isAbsoluteURL;
  }
  var combineURLs;
  var hasRequiredCombineURLs;
  function requireCombineURLs() {
    if (hasRequiredCombineURLs) return combineURLs;
    hasRequiredCombineURLs = 1;
    combineURLs = function combineURLs2(baseURL, relativeURL) {
      return relativeURL ? baseURL.replace(/\/+$/, "") + "/" + relativeURL.replace(/^\/+/, "") : baseURL;
    };
    return combineURLs;
  }
  var buildFullPath;
  var hasRequiredBuildFullPath;
  function requireBuildFullPath() {
    if (hasRequiredBuildFullPath) return buildFullPath;
    hasRequiredBuildFullPath = 1;
    var isAbsoluteURL2 = requireIsAbsoluteURL();
    var combineURLs2 = requireCombineURLs();
    buildFullPath = function buildFullPath2(baseURL, requestedURL) {
      if (baseURL && !isAbsoluteURL2(requestedURL)) {
        return combineURLs2(baseURL, requestedURL);
      }
      return requestedURL;
    };
    return buildFullPath;
  }
  var parseHeaders;
  var hasRequiredParseHeaders;
  function requireParseHeaders() {
    if (hasRequiredParseHeaders) return parseHeaders;
    hasRequiredParseHeaders = 1;
    var utils2 = requireUtils();
    var ignoreDuplicateOf = [
      "age",
      "authorization",
      "content-length",
      "content-type",
      "etag",
      "expires",
      "from",
      "host",
      "if-modified-since",
      "if-unmodified-since",
      "last-modified",
      "location",
      "max-forwards",
      "proxy-authorization",
      "referer",
      "retry-after",
      "user-agent"
    ];
    parseHeaders = function parseHeaders2(headers) {
      var parsed = {};
      var key;
      var val;
      var i2;
      if (!headers) {
        return parsed;
      }
      utils2.forEach(headers.split("\n"), function parser(line) {
        i2 = line.indexOf(":");
        key = utils2.trim(line.substr(0, i2)).toLowerCase();
        val = utils2.trim(line.substr(i2 + 1));
        if (key) {
          if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
            return;
          }
          if (key === "set-cookie") {
            parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
          } else {
            parsed[key] = parsed[key] ? parsed[key] + ", " + val : val;
          }
        }
      });
      return parsed;
    };
    return parseHeaders;
  }
  var isURLSameOrigin;
  var hasRequiredIsURLSameOrigin;
  function requireIsURLSameOrigin() {
    if (hasRequiredIsURLSameOrigin) return isURLSameOrigin;
    hasRequiredIsURLSameOrigin = 1;
    var utils2 = requireUtils();
    isURLSameOrigin = utils2.isStandardBrowserEnv() ? (
      // Standard browser envs have full support of the APIs needed to test
      // whether the request URL is of the same origin as current location.
      (function standardBrowserEnv() {
        var msie = /(msie|trident)/i.test(navigator.userAgent);
        var urlParsingNode = document.createElement("a");
        var originURL;
        function resolveURL(url) {
          var href = url;
          if (msie) {
            urlParsingNode.setAttribute("href", href);
            href = urlParsingNode.href;
          }
          urlParsingNode.setAttribute("href", href);
          return {
            href: urlParsingNode.href,
            protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, "") : "",
            host: urlParsingNode.host,
            search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, "") : "",
            hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, "") : "",
            hostname: urlParsingNode.hostname,
            port: urlParsingNode.port,
            pathname: urlParsingNode.pathname.charAt(0) === "/" ? urlParsingNode.pathname : "/" + urlParsingNode.pathname
          };
        }
        originURL = resolveURL(window.location.href);
        return function isURLSameOrigin2(requestURL) {
          var parsed = utils2.isString(requestURL) ? resolveURL(requestURL) : requestURL;
          return parsed.protocol === originURL.protocol && parsed.host === originURL.host;
        };
      })()
    ) : (
      // Non standard browser envs (web workers, react-native) lack needed support.
      /* @__PURE__ */ (function nonStandardBrowserEnv() {
        return function isURLSameOrigin2() {
          return true;
        };
      })()
    );
    return isURLSameOrigin;
  }
  var CanceledError_1;
  var hasRequiredCanceledError;
  function requireCanceledError() {
    if (hasRequiredCanceledError) return CanceledError_1;
    hasRequiredCanceledError = 1;
    var AxiosError = requireAxiosError();
    var utils2 = requireUtils();
    function CanceledError(message) {
      AxiosError.call(this, message == null ? "canceled" : message, AxiosError.ERR_CANCELED);
      this.name = "CanceledError";
    }
    utils2.inherits(CanceledError, AxiosError, {
      __CANCEL__: true
    });
    CanceledError_1 = CanceledError;
    return CanceledError_1;
  }
  var parseProtocol;
  var hasRequiredParseProtocol;
  function requireParseProtocol() {
    if (hasRequiredParseProtocol) return parseProtocol;
    hasRequiredParseProtocol = 1;
    parseProtocol = function parseProtocol2(url) {
      var match = /^([-+\w]{1,25})(:?\/\/|:)/.exec(url);
      return match && match[1] || "";
    };
    return parseProtocol;
  }
  var xhr;
  var hasRequiredXhr;
  function requireXhr() {
    if (hasRequiredXhr) return xhr;
    hasRequiredXhr = 1;
    var utils2 = requireUtils();
    var settle2 = requireSettle();
    var cookies2 = requireCookies();
    var buildURL2 = requireBuildURL();
    var buildFullPath2 = requireBuildFullPath();
    var parseHeaders2 = requireParseHeaders();
    var isURLSameOrigin2 = requireIsURLSameOrigin();
    var transitionalDefaults = requireTransitional();
    var AxiosError = requireAxiosError();
    var CanceledError = requireCanceledError();
    var parseProtocol2 = requireParseProtocol();
    xhr = function xhrAdapter(config) {
      return new Promise(function dispatchXhrRequest(resolve, reject) {
        var requestData = config.data;
        var requestHeaders = config.headers;
        var responseType = config.responseType;
        var onCanceled;
        function done() {
          if (config.cancelToken) {
            config.cancelToken.unsubscribe(onCanceled);
          }
          if (config.signal) {
            config.signal.removeEventListener("abort", onCanceled);
          }
        }
        if (utils2.isFormData(requestData) && utils2.isStandardBrowserEnv()) {
          delete requestHeaders["Content-Type"];
        }
        var request = new XMLHttpRequest();
        if (config.auth) {
          var username = config.auth.username || "";
          var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : "";
          requestHeaders.Authorization = "Basic " + btoa(username + ":" + password);
        }
        var fullPath = buildFullPath2(config.baseURL, config.url);
        request.open(config.method.toUpperCase(), buildURL2(fullPath, config.params, config.paramsSerializer), true);
        request.timeout = config.timeout;
        function onloadend() {
          if (!request) {
            return;
          }
          var responseHeaders = "getAllResponseHeaders" in request ? parseHeaders2(request.getAllResponseHeaders()) : null;
          var responseData = !responseType || responseType === "text" || responseType === "json" ? request.responseText : request.response;
          var response = {
            data: responseData,
            status: request.status,
            statusText: request.statusText,
            headers: responseHeaders,
            config,
            request
          };
          settle2(function _resolve(value) {
            resolve(value);
            done();
          }, function _reject(err) {
            reject(err);
            done();
          }, response);
          request = null;
        }
        if ("onloadend" in request) {
          request.onloadend = onloadend;
        } else {
          request.onreadystatechange = function handleLoad() {
            if (!request || request.readyState !== 4) {
              return;
            }
            if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf("file:") === 0)) {
              return;
            }
            setTimeout(onloadend);
          };
        }
        request.onabort = function handleAbort() {
          if (!request) {
            return;
          }
          reject(new AxiosError("Request aborted", AxiosError.ECONNABORTED, config, request));
          request = null;
        };
        request.onerror = function handleError() {
          reject(new AxiosError("Network Error", AxiosError.ERR_NETWORK, config, request, request));
          request = null;
        };
        request.ontimeout = function handleTimeout() {
          var timeoutErrorMessage = config.timeout ? "timeout of " + config.timeout + "ms exceeded" : "timeout exceeded";
          var transitional2 = config.transitional || transitionalDefaults;
          if (config.timeoutErrorMessage) {
            timeoutErrorMessage = config.timeoutErrorMessage;
          }
          reject(new AxiosError(
            timeoutErrorMessage,
            transitional2.clarifyTimeoutError ? AxiosError.ETIMEDOUT : AxiosError.ECONNABORTED,
            config,
            request
          ));
          request = null;
        };
        if (utils2.isStandardBrowserEnv()) {
          var xsrfValue = (config.withCredentials || isURLSameOrigin2(fullPath)) && config.xsrfCookieName ? cookies2.read(config.xsrfCookieName) : void 0;
          if (xsrfValue) {
            requestHeaders[config.xsrfHeaderName] = xsrfValue;
          }
        }
        if ("setRequestHeader" in request) {
          utils2.forEach(requestHeaders, function setRequestHeader(val, key) {
            if (typeof requestData === "undefined" && key.toLowerCase() === "content-type") {
              delete requestHeaders[key];
            } else {
              request.setRequestHeader(key, val);
            }
          });
        }
        if (!utils2.isUndefined(config.withCredentials)) {
          request.withCredentials = !!config.withCredentials;
        }
        if (responseType && responseType !== "json") {
          request.responseType = config.responseType;
        }
        if (typeof config.onDownloadProgress === "function") {
          request.addEventListener("progress", config.onDownloadProgress);
        }
        if (typeof config.onUploadProgress === "function" && request.upload) {
          request.upload.addEventListener("progress", config.onUploadProgress);
        }
        if (config.cancelToken || config.signal) {
          onCanceled = function(cancel) {
            if (!request) {
              return;
            }
            reject(!cancel || cancel && cancel.type ? new CanceledError() : cancel);
            request.abort();
            request = null;
          };
          config.cancelToken && config.cancelToken.subscribe(onCanceled);
          if (config.signal) {
            config.signal.aborted ? onCanceled() : config.signal.addEventListener("abort", onCanceled);
          }
        }
        if (!requestData) {
          requestData = null;
        }
        var protocol = parseProtocol2(fullPath);
        if (protocol && ["http", "https", "file"].indexOf(protocol) === -1) {
          reject(new AxiosError("Unsupported protocol " + protocol + ":", AxiosError.ERR_BAD_REQUEST, config));
          return;
        }
        request.send(requestData);
      });
    };
    return xhr;
  }
  var _null;
  var hasRequired_null;
  function require_null() {
    if (hasRequired_null) return _null;
    hasRequired_null = 1;
    _null = null;
    return _null;
  }
  var defaults_1;
  var hasRequiredDefaults;
  function requireDefaults() {
    if (hasRequiredDefaults) return defaults_1;
    hasRequiredDefaults = 1;
    var utils2 = requireUtils();
    var normalizeHeaderName2 = requireNormalizeHeaderName();
    var AxiosError = requireAxiosError();
    var transitionalDefaults = requireTransitional();
    var toFormData = requireToFormData();
    var DEFAULT_CONTENT_TYPE = {
      "Content-Type": "application/x-www-form-urlencoded"
    };
    function setContentTypeIfUnset(headers, value) {
      if (!utils2.isUndefined(headers) && utils2.isUndefined(headers["Content-Type"])) {
        headers["Content-Type"] = value;
      }
    }
    function getDefaultAdapter() {
      var adapter;
      if (typeof XMLHttpRequest !== "undefined") {
        adapter = requireXhr();
      } else if (typeof process !== "undefined" && Object.prototype.toString.call(process) === "[object process]") {
        adapter = requireXhr();
      }
      return adapter;
    }
    function stringifySafely(rawValue, parser, encoder) {
      if (utils2.isString(rawValue)) {
        try {
          (parser || JSON.parse)(rawValue);
          return utils2.trim(rawValue);
        } catch (e) {
          if (e.name !== "SyntaxError") {
            throw e;
          }
        }
      }
      return (encoder || JSON.stringify)(rawValue);
    }
    var defaults = {
      transitional: transitionalDefaults,
      adapter: getDefaultAdapter(),
      transformRequest: [function transformRequest(data2, headers) {
        normalizeHeaderName2(headers, "Accept");
        normalizeHeaderName2(headers, "Content-Type");
        if (utils2.isFormData(data2) || utils2.isArrayBuffer(data2) || utils2.isBuffer(data2) || utils2.isStream(data2) || utils2.isFile(data2) || utils2.isBlob(data2)) {
          return data2;
        }
        if (utils2.isArrayBufferView(data2)) {
          return data2.buffer;
        }
        if (utils2.isURLSearchParams(data2)) {
          setContentTypeIfUnset(headers, "application/x-www-form-urlencoded;charset=utf-8");
          return data2.toString();
        }
        var isObjectPayload = utils2.isObject(data2);
        var contentType = headers && headers["Content-Type"];
        var isFileList;
        if ((isFileList = utils2.isFileList(data2)) || isObjectPayload && contentType === "multipart/form-data") {
          var _FormData = this.env && this.env.FormData;
          return toFormData(isFileList ? { "files[]": data2 } : data2, _FormData && new _FormData());
        } else if (isObjectPayload || contentType === "application/json") {
          setContentTypeIfUnset(headers, "application/json");
          return stringifySafely(data2);
        }
        return data2;
      }],
      transformResponse: [function transformResponse(data2) {
        var transitional2 = this.transitional || defaults.transitional;
        var silentJSONParsing = transitional2 && transitional2.silentJSONParsing;
        var forcedJSONParsing = transitional2 && transitional2.forcedJSONParsing;
        var strictJSONParsing = !silentJSONParsing && this.responseType === "json";
        if (strictJSONParsing || forcedJSONParsing && utils2.isString(data2) && data2.length) {
          try {
            return JSON.parse(data2);
          } catch (e) {
            if (strictJSONParsing) {
              if (e.name === "SyntaxError") {
                throw AxiosError.from(e, AxiosError.ERR_BAD_RESPONSE, this, null, this.response);
              }
              throw e;
            }
          }
        }
        return data2;
      }],
      /**
       * A timeout in milliseconds to abort a request. If set to 0 (default) a
       * timeout is not created.
       */
      timeout: 0,
      xsrfCookieName: "XSRF-TOKEN",
      xsrfHeaderName: "X-XSRF-TOKEN",
      maxContentLength: -1,
      maxBodyLength: -1,
      env: {
        FormData: require_null()
      },
      validateStatus: function validateStatus(status) {
        return status >= 200 && status < 300;
      },
      headers: {
        common: {
          "Accept": "application/json, text/plain, */*"
        }
      }
    };
    utils2.forEach(["delete", "get", "head"], function forEachMethodNoData(method) {
      defaults.headers[method] = {};
    });
    utils2.forEach(["post", "put", "patch"], function forEachMethodWithData(method) {
      defaults.headers[method] = utils2.merge(DEFAULT_CONTENT_TYPE);
    });
    defaults_1 = defaults;
    return defaults_1;
  }
  var transformData;
  var hasRequiredTransformData;
  function requireTransformData() {
    if (hasRequiredTransformData) return transformData;
    hasRequiredTransformData = 1;
    var utils2 = requireUtils();
    var defaults = requireDefaults();
    transformData = function transformData2(data2, headers, fns) {
      var context = this || defaults;
      utils2.forEach(fns, function transform(fn) {
        data2 = fn.call(context, data2, headers);
      });
      return data2;
    };
    return transformData;
  }
  var isCancel;
  var hasRequiredIsCancel;
  function requireIsCancel() {
    if (hasRequiredIsCancel) return isCancel;
    hasRequiredIsCancel = 1;
    isCancel = function isCancel2(value) {
      return !!(value && value.__CANCEL__);
    };
    return isCancel;
  }
  var dispatchRequest;
  var hasRequiredDispatchRequest;
  function requireDispatchRequest() {
    if (hasRequiredDispatchRequest) return dispatchRequest;
    hasRequiredDispatchRequest = 1;
    var utils2 = requireUtils();
    var transformData2 = requireTransformData();
    var isCancel2 = requireIsCancel();
    var defaults = requireDefaults();
    var CanceledError = requireCanceledError();
    function throwIfCancellationRequested(config) {
      if (config.cancelToken) {
        config.cancelToken.throwIfRequested();
      }
      if (config.signal && config.signal.aborted) {
        throw new CanceledError();
      }
    }
    dispatchRequest = function dispatchRequest2(config) {
      throwIfCancellationRequested(config);
      config.headers = config.headers || {};
      config.data = transformData2.call(
        config,
        config.data,
        config.headers,
        config.transformRequest
      );
      config.headers = utils2.merge(
        config.headers.common || {},
        config.headers[config.method] || {},
        config.headers
      );
      utils2.forEach(
        ["delete", "get", "head", "post", "put", "patch", "common"],
        function cleanHeaderConfig(method) {
          delete config.headers[method];
        }
      );
      var adapter = config.adapter || defaults.adapter;
      return adapter(config).then(function onAdapterResolution(response) {
        throwIfCancellationRequested(config);
        response.data = transformData2.call(
          config,
          response.data,
          response.headers,
          config.transformResponse
        );
        return response;
      }, function onAdapterRejection(reason) {
        if (!isCancel2(reason)) {
          throwIfCancellationRequested(config);
          if (reason && reason.response) {
            reason.response.data = transformData2.call(
              config,
              reason.response.data,
              reason.response.headers,
              config.transformResponse
            );
          }
        }
        return Promise.reject(reason);
      });
    };
    return dispatchRequest;
  }
  var mergeConfig;
  var hasRequiredMergeConfig;
  function requireMergeConfig() {
    if (hasRequiredMergeConfig) return mergeConfig;
    hasRequiredMergeConfig = 1;
    var utils2 = requireUtils();
    mergeConfig = function mergeConfig2(config1, config2) {
      config2 = config2 || {};
      var config = {};
      function getMergedValue(target, source) {
        if (utils2.isPlainObject(target) && utils2.isPlainObject(source)) {
          return utils2.merge(target, source);
        } else if (utils2.isPlainObject(source)) {
          return utils2.merge({}, source);
        } else if (utils2.isArray(source)) {
          return source.slice();
        }
        return source;
      }
      function mergeDeepProperties(prop) {
        if (!utils2.isUndefined(config2[prop])) {
          return getMergedValue(config1[prop], config2[prop]);
        } else if (!utils2.isUndefined(config1[prop])) {
          return getMergedValue(void 0, config1[prop]);
        }
      }
      function valueFromConfig2(prop) {
        if (!utils2.isUndefined(config2[prop])) {
          return getMergedValue(void 0, config2[prop]);
        }
      }
      function defaultToConfig2(prop) {
        if (!utils2.isUndefined(config2[prop])) {
          return getMergedValue(void 0, config2[prop]);
        } else if (!utils2.isUndefined(config1[prop])) {
          return getMergedValue(void 0, config1[prop]);
        }
      }
      function mergeDirectKeys(prop) {
        if (prop in config2) {
          return getMergedValue(config1[prop], config2[prop]);
        } else if (prop in config1) {
          return getMergedValue(void 0, config1[prop]);
        }
      }
      var mergeMap = {
        "url": valueFromConfig2,
        "method": valueFromConfig2,
        "data": valueFromConfig2,
        "baseURL": defaultToConfig2,
        "transformRequest": defaultToConfig2,
        "transformResponse": defaultToConfig2,
        "paramsSerializer": defaultToConfig2,
        "timeout": defaultToConfig2,
        "timeoutMessage": defaultToConfig2,
        "withCredentials": defaultToConfig2,
        "adapter": defaultToConfig2,
        "responseType": defaultToConfig2,
        "xsrfCookieName": defaultToConfig2,
        "xsrfHeaderName": defaultToConfig2,
        "onUploadProgress": defaultToConfig2,
        "onDownloadProgress": defaultToConfig2,
        "decompress": defaultToConfig2,
        "maxContentLength": defaultToConfig2,
        "maxBodyLength": defaultToConfig2,
        "beforeRedirect": defaultToConfig2,
        "transport": defaultToConfig2,
        "httpAgent": defaultToConfig2,
        "httpsAgent": defaultToConfig2,
        "cancelToken": defaultToConfig2,
        "socketPath": defaultToConfig2,
        "responseEncoding": defaultToConfig2,
        "validateStatus": mergeDirectKeys
      };
      utils2.forEach(Object.keys(config1).concat(Object.keys(config2)), function computeConfigValue(prop) {
        var merge = mergeMap[prop] || mergeDeepProperties;
        var configValue = merge(prop);
        utils2.isUndefined(configValue) && merge !== mergeDirectKeys || (config[prop] = configValue);
      });
      return config;
    };
    return mergeConfig;
  }
  var data;
  var hasRequiredData;
  function requireData() {
    if (hasRequiredData) return data;
    hasRequiredData = 1;
    data = {
      "version": "0.27.2"
    };
    return data;
  }
  var validator;
  var hasRequiredValidator;
  function requireValidator() {
    if (hasRequiredValidator) return validator;
    hasRequiredValidator = 1;
    var VERSION = requireData().version;
    var AxiosError = requireAxiosError();
    var validators = {};
    ["object", "boolean", "number", "function", "string", "symbol"].forEach(function(type, i2) {
      validators[type] = function validator2(thing) {
        return typeof thing === type || "a" + (i2 < 1 ? "n " : " ") + type;
      };
    });
    var deprecatedWarnings = {};
    validators.transitional = function transitional2(validator2, version, message) {
      function formatMessage(opt, desc) {
        return "[Axios v" + VERSION + "] Transitional option '" + opt + "'" + desc + (message ? ". " + message : "");
      }
      return function(value, opt, opts) {
        if (validator2 === false) {
          throw new AxiosError(
            formatMessage(opt, " has been removed" + (version ? " in " + version : "")),
            AxiosError.ERR_DEPRECATED
          );
        }
        if (version && !deprecatedWarnings[opt]) {
          deprecatedWarnings[opt] = true;
          console.warn(
            formatMessage(
              opt,
              " has been deprecated since v" + version + " and will be removed in the near future"
            )
          );
        }
        return validator2 ? validator2(value, opt, opts) : true;
      };
    };
    function assertOptions(options, schema, allowUnknown) {
      if (typeof options !== "object") {
        throw new AxiosError("options must be an object", AxiosError.ERR_BAD_OPTION_VALUE);
      }
      var keys = Object.keys(options);
      var i2 = keys.length;
      while (i2-- > 0) {
        var opt = keys[i2];
        var validator2 = schema[opt];
        if (validator2) {
          var value = options[opt];
          var result = value === void 0 || validator2(value, opt, options);
          if (result !== true) {
            throw new AxiosError("option " + opt + " must be " + result, AxiosError.ERR_BAD_OPTION_VALUE);
          }
          continue;
        }
        if (allowUnknown !== true) {
          throw new AxiosError("Unknown option " + opt, AxiosError.ERR_BAD_OPTION);
        }
      }
    }
    validator = {
      assertOptions,
      validators
    };
    return validator;
  }
  var Axios_1;
  var hasRequiredAxios$2;
  function requireAxios$2() {
    if (hasRequiredAxios$2) return Axios_1;
    hasRequiredAxios$2 = 1;
    var utils2 = requireUtils();
    var buildURL2 = requireBuildURL();
    var InterceptorManager = requireInterceptorManager();
    var dispatchRequest2 = requireDispatchRequest();
    var mergeConfig2 = requireMergeConfig();
    var buildFullPath2 = requireBuildFullPath();
    var validator2 = requireValidator();
    var validators = validator2.validators;
    function Axios(instanceConfig) {
      this.defaults = instanceConfig;
      this.interceptors = {
        request: new InterceptorManager(),
        response: new InterceptorManager()
      };
    }
    Axios.prototype.request = function request(configOrUrl, config) {
      if (typeof configOrUrl === "string") {
        config = config || {};
        config.url = configOrUrl;
      } else {
        config = configOrUrl || {};
      }
      config = mergeConfig2(this.defaults, config);
      if (config.method) {
        config.method = config.method.toLowerCase();
      } else if (this.defaults.method) {
        config.method = this.defaults.method.toLowerCase();
      } else {
        config.method = "get";
      }
      var transitional2 = config.transitional;
      if (transitional2 !== void 0) {
        validator2.assertOptions(transitional2, {
          silentJSONParsing: validators.transitional(validators.boolean),
          forcedJSONParsing: validators.transitional(validators.boolean),
          clarifyTimeoutError: validators.transitional(validators.boolean)
        }, false);
      }
      var requestInterceptorChain = [];
      var synchronousRequestInterceptors = true;
      this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
        if (typeof interceptor.runWhen === "function" && interceptor.runWhen(config) === false) {
          return;
        }
        synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;
        requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
      });
      var responseInterceptorChain = [];
      this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
        responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
      });
      var promise;
      if (!synchronousRequestInterceptors) {
        var chain = [dispatchRequest2, void 0];
        Array.prototype.unshift.apply(chain, requestInterceptorChain);
        chain = chain.concat(responseInterceptorChain);
        promise = Promise.resolve(config);
        while (chain.length) {
          promise = promise.then(chain.shift(), chain.shift());
        }
        return promise;
      }
      var newConfig = config;
      while (requestInterceptorChain.length) {
        var onFulfilled = requestInterceptorChain.shift();
        var onRejected = requestInterceptorChain.shift();
        try {
          newConfig = onFulfilled(newConfig);
        } catch (error) {
          onRejected(error);
          break;
        }
      }
      try {
        promise = dispatchRequest2(newConfig);
      } catch (error) {
        return Promise.reject(error);
      }
      while (responseInterceptorChain.length) {
        promise = promise.then(responseInterceptorChain.shift(), responseInterceptorChain.shift());
      }
      return promise;
    };
    Axios.prototype.getUri = function getUri(config) {
      config = mergeConfig2(this.defaults, config);
      var fullPath = buildFullPath2(config.baseURL, config.url);
      return buildURL2(fullPath, config.params, config.paramsSerializer);
    };
    utils2.forEach(["delete", "get", "head", "options"], function forEachMethodNoData(method) {
      Axios.prototype[method] = function(url, config) {
        return this.request(mergeConfig2(config || {}, {
          method,
          url,
          data: (config || {}).data
        }));
      };
    });
    utils2.forEach(["post", "put", "patch"], function forEachMethodWithData(method) {
      function generateHTTPMethod(isForm) {
        return function httpMethod(url, data2, config) {
          return this.request(mergeConfig2(config || {}, {
            method,
            headers: isForm ? {
              "Content-Type": "multipart/form-data"
            } : {},
            url,
            data: data2
          }));
        };
      }
      Axios.prototype[method] = generateHTTPMethod();
      Axios.prototype[method + "Form"] = generateHTTPMethod(true);
    });
    Axios_1 = Axios;
    return Axios_1;
  }
  var CancelToken_1;
  var hasRequiredCancelToken;
  function requireCancelToken() {
    if (hasRequiredCancelToken) return CancelToken_1;
    hasRequiredCancelToken = 1;
    var CanceledError = requireCanceledError();
    function CancelToken(executor) {
      if (typeof executor !== "function") {
        throw new TypeError("executor must be a function.");
      }
      var resolvePromise;
      this.promise = new Promise(function promiseExecutor(resolve) {
        resolvePromise = resolve;
      });
      var token = this;
      this.promise.then(function(cancel) {
        if (!token._listeners) return;
        var i2;
        var l = token._listeners.length;
        for (i2 = 0; i2 < l; i2++) {
          token._listeners[i2](cancel);
        }
        token._listeners = null;
      });
      this.promise.then = function(onfulfilled) {
        var _resolve;
        var promise = new Promise(function(resolve) {
          token.subscribe(resolve);
          _resolve = resolve;
        }).then(onfulfilled);
        promise.cancel = function reject() {
          token.unsubscribe(_resolve);
        };
        return promise;
      };
      executor(function cancel(message) {
        if (token.reason) {
          return;
        }
        token.reason = new CanceledError(message);
        resolvePromise(token.reason);
      });
    }
    CancelToken.prototype.throwIfRequested = function throwIfRequested() {
      if (this.reason) {
        throw this.reason;
      }
    };
    CancelToken.prototype.subscribe = function subscribe(listener) {
      if (this.reason) {
        listener(this.reason);
        return;
      }
      if (this._listeners) {
        this._listeners.push(listener);
      } else {
        this._listeners = [listener];
      }
    };
    CancelToken.prototype.unsubscribe = function unsubscribe(listener) {
      if (!this._listeners) {
        return;
      }
      var index = this._listeners.indexOf(listener);
      if (index !== -1) {
        this._listeners.splice(index, 1);
      }
    };
    CancelToken.source = function source() {
      var cancel;
      var token = new CancelToken(function executor(c) {
        cancel = c;
      });
      return {
        token,
        cancel
      };
    };
    CancelToken_1 = CancelToken;
    return CancelToken_1;
  }
  var spread;
  var hasRequiredSpread;
  function requireSpread() {
    if (hasRequiredSpread) return spread;
    hasRequiredSpread = 1;
    spread = function spread2(callback) {
      return function wrap(arr) {
        return callback.apply(null, arr);
      };
    };
    return spread;
  }
  var isAxiosError;
  var hasRequiredIsAxiosError;
  function requireIsAxiosError() {
    if (hasRequiredIsAxiosError) return isAxiosError;
    hasRequiredIsAxiosError = 1;
    var utils2 = requireUtils();
    isAxiosError = function isAxiosError2(payload) {
      return utils2.isObject(payload) && payload.isAxiosError === true;
    };
    return isAxiosError;
  }
  var hasRequiredAxios$1;
  function requireAxios$1() {
    if (hasRequiredAxios$1) return axios$2.exports;
    hasRequiredAxios$1 = 1;
    var utils2 = requireUtils();
    var bind2 = requireBind();
    var Axios = requireAxios$2();
    var mergeConfig2 = requireMergeConfig();
    var defaults = requireDefaults();
    function createInstance(defaultConfig) {
      var context = new Axios(defaultConfig);
      var instance = bind2(Axios.prototype.request, context);
      utils2.extend(instance, Axios.prototype, context);
      utils2.extend(instance, context);
      instance.create = function create(instanceConfig) {
        return createInstance(mergeConfig2(defaultConfig, instanceConfig));
      };
      return instance;
    }
    var axios2 = createInstance(defaults);
    axios2.Axios = Axios;
    axios2.CanceledError = requireCanceledError();
    axios2.CancelToken = requireCancelToken();
    axios2.isCancel = requireIsCancel();
    axios2.VERSION = requireData().version;
    axios2.toFormData = requireToFormData();
    axios2.AxiosError = requireAxiosError();
    axios2.Cancel = axios2.CanceledError;
    axios2.all = function all(promises) {
      return Promise.all(promises);
    };
    axios2.spread = requireSpread();
    axios2.isAxiosError = requireIsAxiosError();
    axios$2.exports = axios2;
    axios$2.exports.default = axios2;
    return axios$2.exports;
  }
  var axios$1;
  var hasRequiredAxios;
  function requireAxios() {
    if (hasRequiredAxios) return axios$1;
    hasRequiredAxios = 1;
    axios$1 = requireAxios$1();
    return axios$1;
  }
  var axiosExports = requireAxios();
  const axios = /* @__PURE__ */ getDefaultExportFromCjs(axiosExports);
  var getRandomValues;
  var rnds8 = new Uint8Array(16);
  function rng() {
    if (!getRandomValues) {
      getRandomValues = typeof crypto !== "undefined" && crypto.getRandomValues && crypto.getRandomValues.bind(crypto) || typeof msCrypto !== "undefined" && typeof msCrypto.getRandomValues === "function" && msCrypto.getRandomValues.bind(msCrypto);
      if (!getRandomValues) {
        throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");
      }
    }
    return getRandomValues(rnds8);
  }
  const REGEX = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;
  function validate(uuid) {
    return typeof uuid === "string" && REGEX.test(uuid);
  }
  var byteToHex = [];
  for (var i = 0; i < 256; ++i) {
    byteToHex.push((i + 256).toString(16).substr(1));
  }
  function stringify(arr) {
    var offset = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
    var uuid = (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
    if (!validate(uuid)) {
      throw TypeError("Stringified UUID is invalid");
    }
    return uuid;
  }
  function v4(options, buf, offset) {
    options = options || {};
    var rnds = options.random || (options.rng || rng)();
    rnds[6] = rnds[6] & 15 | 64;
    rnds[8] = rnds[8] & 63 | 128;
    return stringify(rnds);
  }
  function getSessionId() {
    const SESSION_STORAGE_KEY = "__telemetry_session";
    if (localStorage.getItem(SESSION_STORAGE_KEY) === null) {
      localStorage.setItem(SESSION_STORAGE_KEY, v4());
    }
    return localStorage.getItem(SESSION_STORAGE_KEY);
  }
  class Telemetry {
    constructor(url, commitHash, branch) {
      this.url = url;
      this.commitHash = commitHash;
      this.branch = branch;
      this.sessionId = getSessionId();
    }
    sessionId;
    log(endpoint, payload) {
      if (!(this.branch === "main" || this.branch === "master")) {
        return;
      }
      let log = {
        sessionId: this.sessionId,
        commitHash: this.commitHash,
        timestamp: Date.now(),
        payload
      };
      let fullUrl = `${this.url}/${endpoint}`;
      console.debug(`Logging to ${fullUrl}:`, log);
      axios.post(fullUrl, log);
    }
  }
  if (typeof window !== "undefined") {
    window.telemetry = new Telemetry("https://oxcaml-tutorial.gavinleroy.com", "dca112bebdbd121bb2545c47304ccefa74dd83d1", "main");
  }
  exports.Telemetry = Telemetry;
  Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
  return exports;
})({});
//# sourceMappingURL=telemetry.iife.js.map
