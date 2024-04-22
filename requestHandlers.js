const querystring = require('querystring')
const url = require('url')

const DISCOVERY_URL = "https://accounts.google.com/"
const DISCOVERY_ENDPOINT = DISCOVERY_URL + ".well-known/openid-configuration"
const REDIRECT_URI = "http://localhost:8080/callback"
const CLIENT_ID = "クライアントID"
const CLIENT_SECRET = "シークレットID"

function start (request,response, postData) {
  console.log("Request handler 'start' was called.")
  const contents = '<html>' +
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
  response.write(contents)
  response.end()
}

async function oauth2 (request,response, postData) {
  console.log("Request handler 'oauth2' was called.")
  // ディスカバリドキュメントからベース URI（認証エンドポイント）を取得する。
  const resp = await fetch(DISCOVERY_ENDPOINT);
  const provider_cfg = await resp.json();
  const authorization_endpoint = provider_cfg['authorization_endpoint']

  // 認証リクエスト用のパラメータの設定
  const params = {
    client_id: CLIENT_ID,
    response_type: "code",
    scope: ["openid email profile"],
    redirect_uri: REDIRECT_URI,
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
  const resp = await fetch(DISCOVERY_ENDPOINT);
  const provider_cfg = await resp.json();
  const authorization_endpoint = provider_cfg['token_endpoint']

  // アクセストークンリクエストボディの設定
  const body = new URLSearchParams({
    "code": code,
    "client_id": CLIENT_ID,
    "client_secret": CLIENT_SECRET,
    "redirect_uri": REDIRECT_URI,
    "grant_type": "authorization_code",
  });

  const resp_token = await fetch(authorization_endpoint, {
    method: "POST",
    headers:{
      "Content-Type":"application/x-www-form-urlencoded",
    },
    body,
  })
  const token = await resp_token.json();

  const contents = '<html>' +
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
  response.write(contents)
  response.end()
}

exports.start = start
exports.oauth2 = oauth2
exports.callback = callback

