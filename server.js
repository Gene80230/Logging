var http = require('http')
var fs = require('fs')
var url = require('url')
var port = process.argv[2]

if(!port){
  console.log('请指定端口号好不啦？\nnode server.js 8888 这样不会吗？')
  process.exit(1)
}

var server = http.createServer(function(request, response){
  var parsedUrl = url.parse(request.url, true)
  var pathWithQuery = request.url 
  var queryString = ''
  if(pathWithQuery.indexOf('?') >= 0){ queryString = pathWithQuery.substring(pathWithQuery.indexOf('?')) }
  var path = parsedUrl.pathname
  var query = parsedUrl.query
  var method = request.method

  /******** 从这里开始看，上面不要看 ************/

  console.log('方方说：含查询字符串的路径\n' + pathWithQuery)

  if(path === '/'){
    let string = fs.readFileSync('./index.html','utf8')
    let cookies = request.headers.cookie.split('; ')    //['email=1@G...,a=1']
    let hash = {}
    for(let i=0; i<cookies.length; i++){
      let parts = cookies[i].split('=')
      let key = parts[0]
      let value = parts[1]
      hash[key] = value
    }
    let email = hash.sign_in_email
    let users = fs.readFileSync('./db/users','utf8')
    users = JSON.parse(users)
    let foundUse
    for(let i=0; i<users.length; i++){
      if(users[i].email === email){
        foundUse = users[i]
        break;
      }
    }
    if(foundUse){
      string = string.replace('__email__',`登陆成功，${foundUse.email}`)
    }else{
      string = string.replace('__email__','你好，你还没有登陆')
    }
    response.statusCode = 200
    response.setHeader('Content-Type', 'text/html;charset=utf-8')
    response.write(string)
    response.end()
  }else if(path === '/sign_up' && method === 'GET'){
    let string = fs.readFileSync('./sign_up.html','utf8')
    response.statusCode = 200
    response.setHeader('Content-Type', 'text/html;charset=utf-8')
    response.write(string)
    response.end()
  }else if(path === '/sign_up' && method === 'POST'){
      readBody(request).then((body)=>{
        let hash = {}
        let strings = body.split('&')
        strings.forEach((string)=>{
          let parts = string.split('=')
          let key = parts[0]
          let value = parts[1]
          hash[key] = decodeURIComponent(value)    //把%40翻译成@
        })
        let {email,password,password_confirmation} = hash
        if(email.indexOf('@') === -1){
          response.statusCode = 400
          response.setHeader('Content-Type', 'application/json;charset=utf-8')
          response.write(`{
            "errors":{
              "email": "invalid"
            }
          }`)
        }else if(password !==password_confirmation){
          response.statusCode = 400
          response.write('password not match')
        }else{
          var users = fs.readFileSync('./db/users', 'utf8')
          try{
            users = JSON.parse(users)           //如果不符合JSON语法就执行下面那句
          }catch(exception){
            users = []                          //重置数据库
          }  
          let inUse = false
          for(let i=0; i<users.length; i++){
            let user = users[i]
            if(user.email === email ){          //如果用户存在则返回inUse
              inUse = true
              break;
            }
          }
          if(inUse){
            response.statusCode = 400
            response.setHeader('Content-Type', 'application/json;charset=utf-8')
            response.write(`{
              "errors":{
                "email": "inUse"
              }
            }`)
          }else{
            users.push({email: email, password: password})        //放进数据库
            var usersString = JSON.stringify(users)             //把对象转化为字符串
            fs.writeFileSync('./db/users', usersString)         //保存进...
            response.statusCode = 200 
          }                        
        }
        response.end()
      })
  }else if(path === '/sign_in' && method === 'GET'){
    let string = fs.readFileSync('./sign_in.html','utf8')
    response.statusCode = 200
    response.setHeader('Content-Type', 'text/html;charset=utf-8')
    response.write(string)
    response.end()
  }else if(path === '/sign_in' && method === 'POST'){
    readBody(request).then((body)=>{
      let hash = {}
      let strings = body.split('&')
      strings.forEach((string)=>{
        let parts = string.split('=')
        let key = parts[0]
        let value = parts[1]
        hash[key] = decodeURIComponent(value)    //把%40转换成@
      })
      let {email, password} = hash

      var users = fs.readFileSync('./db/users','utf8')
      try{
        users = JSON.parse(users)           //如果不符合JSON语法就执行下面那句
      }catch(exception){
        users = []                          //重置数据库
      }  
      let found
      for(let i=0; i<users.length; i++){
        if(users[i].email === email && users[i].password === password){
          found = true
          break;
        }
      }
      
      if(found){
        //Set-Cookie: <cookie-name>=<cookie-value>
        response.setHeader('Set-Cookie', `sign_in_email=${email}`)
        response.statusCode = 200
      }else{
        response.statusCode = 401
      }
      response.end()
    }) 
  }else if(path === '/main.js'){
    let string = fs.readFileSync('./main.js','utf8')
    response.statusCode = 200
    response.setHeader('Content-Type', 'text/javascript;charset=utf-8')
    response.write(string)
    response.end()
  }else if(path === '/xxx'){
    response.statusCode = 200
    response.setHeader('Content-Type', 'text/json;charset=utf-8')
    response.setHeader('Access-Control-Allow-Origin', 'http://gene0.com:8001')
    response.write(`
      {
        "note":{
          "to": "PQY",
          "from": "Gene",
          "heading": "Say Hi",
          "content": " Hi "
        }
      }
    `)
    response.end()
  }else{
    response.statusCode = 404
    response.setHeader('Content-Type', 'text/html;charset=utf-8')
    response.write(`
      {
        "error":"not found"
      }  
    `)
    response.end()
  }

  /******** 代码结束，下面不要看 ************/
})

function readBody(request){
  return new Promise((resolve,reject)=>{
    let body = [];  //请求体
    request.on('data', (chunk) => {
      body.push(chunk);
    }).on('end', () => {
      body = Buffer.concat(body).toString();
      resolve(body)
    });
  })
}

server.listen(port)
console.log('监听 ' + port + ' 成功\n请在空中转体720度然后用电饭煲打开 http://localhost:' + port)


