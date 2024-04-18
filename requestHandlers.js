const querystring = require('querystring')
const url = require('url')

const GOOGLE_DISCOVERY_URL = 'https://accounts.google.com/.well-known/openid-configuration'
const redirect_uri = "http://localhost:8080/callback"
const client_id = "クライアントID"
const client_secret = "シークレットID"

function start (request,response, postData) {
  console.log("Request handler 'start' was called.")
  const body = '<html>' +
    '<head>' +
    '<meta http-equiv="Content-Type" content="text/html; ' +
    'charset=UTF-8" />' +
    '</head>' +
    '<body>' +
    '<p>' +
    '<button onclick="location.href=\'/oauth2\'">アクセストークン取得</button>' +
    '</p>' +
    '</body>' +
    '</html>'

  response.writeHead(200, { 'Content-Type': 'text/html' })
  response.write(body)
  response.end()
}

async function oauth2 (request,response, postData) {
  console.log("Request handler 'oauth2' was called.")
  // ディスカバリドキュメントからベース URI（認証エンドポイント）を取得する。
  const resp = await fetch(GOOGLE_DISCOVERY_URL);
  const google_provider_cfg = await resp.json();
  const authorization_endpoint = google_provider_cfg['authorization_endpoint']

  // 認証リクエスト用のパラメータの設定
  const params = {
    client_id: client_id,
    response_type: "code",
    scope: ["openid email profile"],
    redirect_uri: redirect_uri,
    prompt: "select_account",
  };
  const query = new URLSearchParams(params);
  const request_url = authorization_endpoint + `?${query}`

  // ブラウザにリダイレクトを返す
  response.writeHead(302, { 'Location': request_url })
  response.end()

}
async function callback (request,response, postData) {

  const query = url.parse(request.url).query;
  const code = querystring.parse(query).code;

  // ディスカバリドキュメントからトークンエンドポイントを取得する。
  const res_discovery = await fetch(GOOGLE_DISCOVERY_URL);
  const google_provider_cfg = await res_discovery.json();
  const authorization_endpoint = google_provider_cfg['token_endpoint']

  // アクセストークンリクエストボディの設定
  const formData = new FormData()
  formData.append("code", code)
  formData.append("client_id", client_id)
  formData.append("client_secret", client_secret)
  formData.append("redirect_uri", redirect_uri)
  formData.append("grant_type", "authorization_code")

  const resp_token = await fetch(authorization_endpoint, {
    method: "POST",
    body: formData,
  })
  const token = await resp_token.json();

  const body = '<html>' +
  '<head>' +
  '<meta http-equiv="Content-Type" content="text/html; ' +
  'charset=UTF-8" />' +
  '</head>' +
  '<body>' +
  '<p>' +
  '<table border="2" style="table-layout:fixed;width:100%;">' +
  '<thead>' +
  '<tr>' +
  '<th>Key</th>' +
  '<th>Value</th>' +
  '</tr>' +
  '</thead>' +
  '<colgroup>' +
  '<col style="width:10%;">' +
  '<col style="width:90%;">' +
  '</colgroup>' +
  '<tbody>' +
  '<tr>' +
  '<th>access_token</th>' +
  '<td style="word-wrap:break-word;">' + token.access_token + '</td>' +
  '</tr>' +
  '<tr>' +
  '<th>expires_in</th>' +
  '<td style="word-wrap:break-word;">' + token.expires_in + '</td>' +
  '</tr>' +
  '<tr>' +
  '<th>scope</th>' +
  '<td style="word-wrap:break-word;">' + token.scope + '</td>' +
  '</tr>' +
  '<tr>' +
  '<th>token_type</th>' +
  '<td style="word-wrap:break-word;">' + token.token_type + '</td>' +
  '</tr>' +
  '<tr>' +
  '<th>id_token</th>' +
  '<td style="word-wrap:break-word;">' + token.id_token + '</td>' +
  '</tr>' +
  '</tbody>' +
  '</table>' +
  '</p>' +
  '<button onclick="location.href=\'/\'">戻る</button>' +
  '</body>' +
  '</html>'

  response.writeHead(200, { 'Content-Type': 'text/html' })
  response.write(body)
  response.end()
}

exports.start = start
exports.oauth2 = oauth2
exports.callback = callback

