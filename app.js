const Koa = require('koa'); // 导入koa
const app = new Koa(); // 创建服务端实例对象
const views = require('koa-views'); // 导入了处理动态资源包
const json = require('koa-json'); // 导入了输出json格式的包
const onerror = require('koa-onerror'); // 导入了处理错误的包
const bodyparser = require('koa-bodyparser'); // 导入了处理post请求参数包
const fs = require('fs');
const path = require('path');
const logger = require('koa-morgan');
require('./db/sync');
const session = require('koa-generic-session'); // 导入保存登录状态的包
const redisStore = require('koa-redis');
const {REDIS_CONFIG} = require('./config/db');
/*
1.Nginx安装和使用
1.1安装
下载解压即可
http://nginx.org/en/download.html
1.2使用
修改配置文件
worker_processes 4; // CPU核数
location / {  // 请求根路径代理的地址
	proxy_pass http://192.168.0.107:3001;
}
location /api { // 请求/api代理的地址
	proxy_pass http://127.0.0.1:3000;
	proxy_set_header Host $host;
}
* */
const user = require('./routes/user'); // 导入了封装好的路由

// error handler
onerror(app); // 告诉系统需要捕获哪一个程序的错误

// 注册了解析post请求参数的中间件
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}));
app.use(json());
// 注册了记录日志的中间件
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log/access.log'), { flags: 'a' });
app.use(logger('combined', {
  stream: accessLogStream
}));
// 注册了处理静态资源的中间件
app.use(require('koa-static')(__dirname + '/public'));
// 注册了处理动态资源的中间件
app.use(views(__dirname + '/views', {
  extension: 'pug'
}));

// 记录日志
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
});
// 配置保存登录状态的中间件
app.keys = ['COM.it666.*?']; // 用于生成无关紧要的userId的
app.use(session({
  cookie:{
    path: '/',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  },
  store: redisStore({
    all: `${REDIS_CONFIG.host}:${REDIS_CONFIG.port}`
  })
}));

// 注册启用了路由
app.use(user.routes(), user.allowedMethods());

// 处理错误
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app;
