window.jQuery = function(nodeOrSelector){
    let nodes = {}
    nodes.addClass = function(){}
    nodes.html = function(){}
    return nodes
}

window.$ = window.jQuery

window.jQuery.ajax = function({url, method, body, successFn, failFn, headers}){

    let request = new XMLHttpRequest()
    request.open(method,url)     //配置这个对象 第一部分
    for(let key in headers) {
        let value = headers[key]
        request.setRequestHeader(key, value)
    }
    request.onreadystatechange = ()=>{                //监听对象  readyState 的变化
        if(request.readyState === 4){
            
            if(request.status >=200 && request.status <300){
                successFn.call(undefined, request.responseText)
               }else if(request.status >=400){
                failFn.call(undefined, request)
            }
        }
    }
    request.send(body)     //第四部分                               //发送这个对象
}

function f1(responseText){}
function f2(responseText){}

myButton.addEventListener('click', (e)=>{
    window.jQuery.ajax({
        url: '/xxx',
        method: 'get',
        headers: {
            'content-type':'application/x-www-form-url-urlencoded',
            'gene':'18'
        },
        successFn: (x)=>{
            f1.call(undefined,x)
            f2.call(undefined,x)
        },
        failFn: (x)=>{
            console.log(x)
            console.log(x.status)
            console.log(x.responseText)
        }
    })
})



















// myButton.addEventListener('click', (e)=>{
//     let request = new XMLHttpRequest()
//     request.open('post','/xxx')     //配置这个对象 第一部分
//     request.send('这是我设置的第4部分')     //第四部分                               //发送这个对象
//     request.onreadystatechange = ()=>{                //监听对象  readyState 的变化
//         if(request.readyState === 4){
//             console.log('请求响应都已经完成了')
//             console.log(request.status)
//             console.log(request.statusText)
//             if(request.status >=200 && request.status <300){
//                 console.log('请求成功')
//                 console.log(request.getAllResponseHeaders())
//                 console.log(request.responseText)
//                 let string = request.responseText           //第四部分      
//                 let object = window.JSON.parse(string)    //把响应内容转换成JS格式
//             }else if(request.status >=400){
//                 console.log('请求失败')
//             }
//         }
//     }
    
// })



