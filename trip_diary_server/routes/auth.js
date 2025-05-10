const express = require('express');
const router = express.Router();
const axios = require('axios');
const jwt = require('jsonwebtoken');
const User = require('../db/mongodb/models/User');

// 微信登录接口参数（需要替换为实际值）
const WX_APPID = 'wxa2f8e492f2b7646b';
const WX_SECRET = 'ca0b9b95cfba80d819729a5ca4d00254';

// 用户登录（微信小程序）
router.post('/login', async (req, res) => {
    try {
        const { data, code } = req.body;
        console.log('1', code)
        console.log('2', data)

        // 调用微信接口
        const wxResponse = await axios.get(`https://api.weixin.qq.com/sns/jscode2session`, {
            params: {
                appid: WX_APPID,
                secret: WX_SECRET,
                js_code: code,
                grant_type: 'authorization_code'
            }
        });

        // 处理微信响应
        if (wxResponse.data.errcode) {
            return res.status(401).send({
                code: wxResponse.data.errcode,
                message: wxResponse.data.errmsg
            });
        }

        const { openid } = wxResponse.data;

        // 查找或创建用户
        let user = await User.findOne({ openid });
        
        if (!user) {
            user = new User({
                openid: openid,
                username: data.username,
                password: data.password,
            });
            await user.save();
        }else{
            if(user.username !== data.username){
                return res.status(401).send({
                    code: 401,
                    message: '用户名错误'
                });
            }else if(user.password !== data.password){
                return res.status(401).send({
                    code: 401,
                    message: '密码错误'
                });
            }
        }
        // 生成 JWT Token
        const token = jwt.sign({ userId: user._id, username: user.username }, process.env.SECRET_KEY, { expiresIn: '1h' });

        res.send({
            code: 200,
            data: {
                auth_token: token,
                userInfo: {
                    _id: user._id,
                    username: user.username,
                    avatarUrl: `http://${process.env.HOST}:${3000}/${user.avatarUrl}`,
                    nickname: user.nickname, 
                    gender: user.gender, 
                    tip: user.tip,
                }
            }
        });

    } catch (error) {
        console.error('登录失败:', error);
        res.status(500).send({
            code: 500,
            message: '服务器内部错误'
        });
    }
});


module.exports = router;