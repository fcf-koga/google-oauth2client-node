const http = require('http')
const url = require('url')

function start (route, handle) {
  function onRequest (request, response) {
    let postData = ''
    const pathname = url.parse(request.url).pathname
    console.log('Request for ' + pathname + ' received.')

    request.setEncoding('utf8')
    request.addListener('data', function (postDataChunk) {
      postData += postDataChunk
      console.log("Received POST data chunk '" +
            postDataChunk + "'.")
    })

    request.addListener('end', function () {
      route(handle, pathname, request,response, postData)
    })
  }

  http.createServer(onRequest).listen(8080)
  console.log('Server has started.')
}

exports.start = start
