const router = require('koa-router')()
const {registerUser, loginCheck} = require('../controller/userController');

router.prefix('/api/user')
router.post('/login',async (ctx, next)=>{
    // 处理登录
    let result = await loginCheck(ctx.request.body);
    // 存储登录状态
    if(result.code === 200){
        ctx.session.username = result.data.username;
        ctx.session.password = result.data.password;
        ctx.session.gender = result.data.gender;
    }
    return ctx.body = result;
});
router.post('/register',async (ctx, next)=>{
    // 注册用户
    let result = await registerUser(ctx.request.body);
    // 返回注册结果
    return ctx.body = result;
});
router.get('/test', (ctx, next)=>{
    console.log(ctx.session);
    if(ctx.session.username){
        ctx.body = '已经登录'
    }else{
        ctx.body = '没有登录'
    }
});

module.exports = router;