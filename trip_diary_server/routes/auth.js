const express = require('express');
const router = express.Router();
const axios = require('axios');
const User = require('../db/mongodb/models/User');

// 微信登录接口参数（需要替换为实际值）
const WX_APPID = 'wxa2f8e492f2b7646b';
const WX_SECRET = 'ca0b9b95cfba80d819729a5ca4d00254';

// 用户登录（微信小程序）
router.post('/login', async (req, res) => {
    try {
        console.log('sb', req.body)
        const { code } = req.body;
        
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

        const { openid, session_key } = wxResponse.data;
        console.log('openid', openid)
        
        // 查找或创建用户
        let user = await User.findOne({ openid });
        console.log(user)
        if (!user) {
            // user = new User({ openid });
            user = new User({
                openid: openid,
                username: '默认用户名',
                nickname: '默认昵称',
                avatarUrl: '1',
                tip: '暂无介绍',
                phone: '1'
            });
            await user.save();
        }

        res.send({
            code: 200,
            data: {
                openid,
                session_key,
                userInfo: user
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