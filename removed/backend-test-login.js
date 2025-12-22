const http = require('http')
const data = JSON.stringify({ email: 'a@b.com', password: '123456' })
const req = http.request({ hostname: 'localhost', port: 4000, path: '/api/login', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': data.length } }, res => {
  res.setEncoding('utf8')
  let body = ''
  res.on('data', d => body += d)
  res.on('end', () => console.log('STATUS', res.statusCode, 'BODY', body))
})
req.on('error', e => console.error('ERR', e.message))
req.write(data)
req.end()