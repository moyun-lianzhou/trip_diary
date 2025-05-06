# 旅游日记平台开发文档

## 1. 项目概述

旅游日记平台是一个包含移动端用户系统和PC端审核管理系统的完整解决方案。微信小程序客户端允许用户发布、查看和分享旅游游记，PC端则提供内容审核和管理功能。

## 2. 功能模块

### 2.1 用户系统（微信小程序端）

#### 2.1.1 游记列表（首页）

- 瀑布流式展示所有审核通过的游记卡片
- 分页加载功能
- 搜索功能（按标题/作者昵称）
- 卡片元素：首张图片、标题、作者头像、作者昵称
- 点击卡片跳转至游记详情页

#### 2.1.2 我的游记

- 展示当前用户的所有游记（待审核/已通过/未通过）
- 显示未通过游记的拒绝原因
- 游记编辑功能（仅限待审核和未通过状态）
- 游记删除功能（所有状态）
- 游记发布入口

#### 2.1.3 游记发布

- 编辑表单包含：标题（必填）、内容（必填）、多张图片（必填）、单个视频（可选）
- 表单验证
- 发布功能（新增或更新）
- 图片压缩处理
- 视频上传支持

#### 2.1.4 游记详情

- 完整展示游记内容
- 图片轮播查看
- 视频全屏播放（位于图片列表首位）
- 分享功能（如微信分享）
- 可选高级功能：视频封面、自动播放等

#### 2.1.5 用户登录/注册

- 用户名/密码登录注册
- 昵称唯一性校验
- 头像上传（默认头像）

### 2.2 审核管理系统（PC端）

#### 2.2.1 审核列表

- 展示所有游记（待审核/已通过/未通过）
- 状态筛选功能
- 审核操作：
  - 通过（状态置为"已通过"）
  - 拒绝（状态置为"未通过"，需填写原因）
  - 删除（逻辑删除）
- 角色权限：
  - 审核人员：通过/拒绝
  - 管理员：通过/拒绝/删除

## 3. 技术栈

### 前端

- 移动端：原生微信小程序
- PC端：React + Ant Design

### 后端

- Node.js

### 数据库

- MongoDB

## 4. 数据库设计

### 4.1 用户表(user)

```
{
  _id: ObjectId,
  openId: number, // 微信用户唯一标识，从微信官方获取
  username: String, // 用户的应用名称
  nickname: String, // 用户微信昵称
  avatarUrl: String, // 用户头像URL
  gender: number, // 用户性别
  tip: string, // 用户个性签名
  phone: String, // 用户手机号码
  createdAt: Date, // 创建用户时间
  updatedAt: Date // 用户上一次更新信息时间
}
```

### 4.2 系统人员表(staff)

```
{
  _id: ObjectId,
  username: String, // 管理员用户名
  password: String, // 加密存储
  name: String, // 管理员名字
  avatarUrl: String, // 头像URL
  role: String, // 管理员身份-reviewer/admin（0-审核员，1-管理员）
  createdAt: Date, // 创建管理员时间
  updatedAt: Date // 管理员上一次更新信息时间
}
```

### 4.3 游记表(diary)

```
{
  _id: ObjectId,
  title: String, // 游记标题
  content: String, // 游记内容
  images: [String], // 图片URL数组
  video: String, // 视频URL
  authorId: ObjectId, // 关联用户
  status: String, // 审核状态-待审核 0 pending/通过 1 approved/拒绝 2 rejected 默认为0 
  checkedName: String, // 审核员名字 
  checkedAt: Date, // 审核时间
  rejectReason: String, // 拒绝原因
  isDeleted: Boolean, // 逻辑删除标志
  createdAt: Date, // 创建时间
  updatedAt: Date // 更新时间
}
```

## 5. API设计

### 5.1 用户相关

- POST /api/auth/register - 用户注册
- POST /api/auth/login - 用户登录
- GET /api/user/me - 获取当前用户信息
- PUT /api/user/me - 更新用户信息
- DELETE /api/user/:id - 注销用户（管理员所有）

### 5.2 系统人员相关

- POST /api/staff/login/:role - 系统人员登录
- POST /api/staff/register/:role - 系统人员注册
- GET /api/staff/me - 获取当前系统人员信息
- PUT /api/staff/me - 更新系统人员信息

### 5.3 游记相关

- GET /api/diary - 获取所有人**审核通过**的游记列表（可分页、搜索）
- GET /api/diary/:id - 获取游记详情
- GET /api/diary/me - 获取当前用户的游记
- POST /api/diary- 创建游记
- PUT /api/diary/:id - 更新游记
- DELETE /api/diary/:id - 删除游记

### 5.4 审核相关

- GET /api/check/diary- 获取所有游记（包括待审核、通过、未通过）
- GET /api/check/diary/:status- 获取不同状态的游记（包括待审核、通过、未通过其中的一到两种）
- PUT /api/check/diary/:id/approve - 通过游记
- PUT /api/check/diary/:id/reject - 拒绝游记
- DELETE /api/check/diary/:id - 逻辑删除游记

## 6. 开发流程

1. **项目初始化**
   - 创建Git仓库
   - 搭建基础项目结构
   - 配置开发环境

2. **核心功能开发**
   - 用户认证系统
   - 游记发布与展示
   - 审核管理系统

3. **优化与测试**
   - 性能优化（图片懒加载、分页等）
   - 用户体验优化
   - 兼容性测试
   - 安全测试

4. **部署上线**

## 7. 注意事项

1. **安全性**
   - 用户密码加密存储
   - API接口鉴权
   - 防止XSS/SQL注入

2. **性能优化**
   - 图片压缩与懒加载
   - 分页查询
   - 缓存策略

3. **代码规范**
   - 遵循团队代码风格
   - 组件化开发
   - 完善的注释

4. **Git提交规范**
   - 小步提交，每次提交有明确目的
   - 清晰的提交信息
   - 分支管理策略

## 8. 扩展功能展望

1. 游记分类/标签系统
2. 用户关注/粉丝系统
3. 游记评论功能
4. 游记收藏功能
5. 数据分析看板（热门游记统计等）
6. 多平台分享深度集成
7. 离线阅读功能
8. 游记地理位置标记