var utils = require('../../utils')
  , request = require('request')

exports.HttpClientHandler = HttpClientHandler

function HttpClientHandler() {
  if(arguments.length == 1) {
    this._options = arguments[0];
  }
}

function jsonConcat(o1, o2) {
 for (var key in o2) {
  o1[key] = o2[key];
 }
 return o1;
}

HttpClientHandler.prototype.send = function(ctx, callback) {
  var options = { url: ctx.url,
                  body: ctx.request,
                  headers: { "SOAPAction": ctx.action,
                            "Content-Type": ctx.contentType,
                            "MIME-Version": "1.0"
                          },
                  encoding: null,
                  rejectUnauthorized: false,
                  agentOptions: ctx.agentOptions,
                };

  if(this._options !== 'undefined') {
      options = jsonConcat(options, this._options);
  }

  request.post(options,
               function (error, response, body) {
    ctx.response = body
      if (response) {
        ctx.resp_headers = response.headers
        ctx.resp_contentType = response.headers["content-type"]
      }
      if (error) ctx.error = error
      else ctx.statusCode = response.statusCode
      callback(ctx)
    })
}
