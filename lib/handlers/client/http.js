var utils = require('../../utils')
  , request = require('request')

exports.HttpClientHandler = HttpClientHandler

function HttpClientHandler() {}

HttpClientHandler.prototype.send = function(ctx, callback) {
  request.post({ url: ctx.url
               , body: ctx.request
               , headers: { "SOAPAction": ctx.action
                          , "Content-Type": ctx.contentType
                          , "Authorization": ctx.authorization
                          , "MIME-Version": "1.0"
                          }
               , encoding: null
                , rejectUnauthorized: false
                , agentOptions: ctx.agentOptions
                , cert: ctx.cert
                , key: ctx.key
               },
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