const express = require('express');
const router = express.Router();
const axios = require('axios');
const jwt = require('jsonwebtoken');
const User = require('../db/mongodb/models/User');
const md5 = require('md5');
const { v4: uuidv4 } = require('uuid');
// 模拟微信openid生成函数
const getOpenId = () => uuidv4().slice(0, 8);

// 微信登录接口参数（需要替换为实际值）
const WX_APPID = 'wxa2f8e492f2b7646b';
const WX_SECRET = 'ca0b9b95cfba80d819729a5ca4d00254';

// 用户注册接口
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body.formInfo;

        console.log(req.body)

        // 检查用户名是否已存在
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).send({
                code: 400,
                message: '用户名已存在'
            });
        }

        // 创建新用户（MD5加密密码，openid模拟唯一）
        const newUser = new User({
            openid: getOpenId(), // 生成唯一标识
            username,
            password: md5(password),
            avatarUrl: '/images/default_avatar.png',
            gender: 0,
            tip: '用户太懒，暂无介绍'
        });

        await newUser.save();

        // 生成JWT Token
        const token = jwt.sign({ userId: newUser._id }, process.env.SECRET_KEY, { expiresIn: '1h' });

        res.status(201).send({
            code: 201,
            data: {
                auth_token: token,
                userInfo: {
                    _id: newUser._id,
                    username: newUser.username,
                    avatarUrl: `http://${process.env.HOST}:${3000}/${newUser.avatarUrl}`,
                    nickname: newUser.nickname,
                    gender: newUser.gender,
                    tip: newUser.tip
                }
            }
        });

    } catch (error) {
        console.error('注册失败:', error);
        res.status(500).send({
            code: 500,
            message: '服务器内部错误'
        });
    }
});


// 用户登录（账号密码）
router.post('/login', async (req, res) => {
    try {
        console.log(req.body)
        const { username, password } = req.body.formInfo;

        console.log(username, password);

        // 查找用户
        const user = await User.findOne({ username });
        
        // 用户不存在
        if (!user) {
            return res.status(401).send({
                code: 401,
                message: '用户名不存在'
            });
        }

        // 验证密码（MD5加密后比对）
        if (user.password !== md5(password)) {
            return res.status(401).send({
                code: 401,
                message: '密码错误'
            });
        }

        // 生成 JWT Token
        const token = jwt.sign({ 
            userId: user._id, 
            username: user.username 
        }, process.env.SECRET_KEY, { expiresIn: '1h' });

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


// 用户登录（微信小程序）
router.post('/loginForWX', async (req, res) => {
    try {
        const { data, code } = req.body;

        // // 调用微信接口
        // const wxResponse = await axios.get(`https://api.weixin.qq.com/sns/jscode2session`, {
        //     params: {
        //         appid: WX_APPID,
        //         secret: WX_SECRET,
        //         js_code: code,
        //         grant_type: 'authorization_code'
        //     }
        // });

        // // 处理微信响应
        // if (wxResponse.data.errcode) {
        //     return res.status(401).send({
        //         code: wxResponse.data.errcode,
        //         message: wxResponse.data.errmsg
        //     });
        // }

        // const { openid } = wxResponse.data;

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