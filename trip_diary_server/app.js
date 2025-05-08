const express = require('express');
const app = express(); // 创建Express应用
const path = require('path'); // 引入path模块
const logger = require('morgan'); // 引入日志中间件
const cors = require('cors'); // 引入CORS中间件
require('dotenv').config()

// 引入 MongoDB 连接函数
const connectDB = require('./db/mongodb/mongoose');
// 连接数据库
connectDB();

// 中间件
app.use(logger('dev')); // 日志中间件
app.use(cors()); // 使用CORS中间件
app.use(express.json()); // 解析JSON请求体
app.use(express.urlencoded({ extended: true })); // 解析URL编码的请求体
app.use(express.static('public')); // 提供静态文件服务
app.use(express.static(path.join(__dirname, 'public'))); // 静态资源路径中间件

// 引入路由模块
const authRouter = require('./routes/auth');
const userRouter = require('./routes/user');
const staffRouter = require('./routes/staff');
const diaryRouter = require('./routes/diary');
const checkRouter = require('./routes/check');

// 设置路由前缀
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/staff', staffRouter);
app.use('/api/diary', diaryRouter);
app.use('/api/check', checkRouter);

// 处理404错误
app.use((req, res, next) => {
  res.status(404).send('404 Not Found');
});

// 启动服务器
const port = process.env.PORT; // 监听端口
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});