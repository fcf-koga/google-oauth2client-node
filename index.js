const server = require('./server')
const router = require('./router')
const requestHandelers = require('./requestHandlers')

const handle = {}
handle['/'] = requestHandelers.start
handle['/oauth2'] = requestHandelers.oauth2
handle['/callback'] = requestHandelers.callback
handle['/decode'] = requestHandelers.decode


server.start(router.route, handle)
