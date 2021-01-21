# About


__注：此项目纯属个人瞎搞，不用于任何商业用途。__


# 说明


>  如果对您对此项目有兴趣，可以点 "Star" 支持一下 谢谢！ ^_^

>  或者您可以 "follow" 一下，我会不断开源更多的有趣的项目

>  开发环境 macOS 10.12.4  nodejs 6.10.0  Mongodb 3.4.2

>  部署环境 阿里云 CentOS 7.2 64位

>  如有问题请直接在 Issues 中提，或者您发现问题并有非常好的解决方案，欢迎 PR 👍


## 技术栈

nodejs + express + mongodb + mongoose + es6/7 + vue + element-ui


## 项目运行

```
项目运行之前，请确保系统已经安装以下应用
1、node (6.0 及以上版本)
2、mongodb (开启状态)
3、python3.x 环境;使用 Anaconda安装python包;
4、windows主要有三个环境的配置:
  ①anaconda安装路径（为了Python检查正常）:
  ②安装路径\Scripts（为了conda检查正常）:
  ③另一个路径：安装路径\Library\bin
5、安装tushare； pip install tushare


```
conda 导出依赖包并批量安装
conda list -e > requirements.txt #Save all the info about packages to your folder
conda install --yes --file requirements.txt

更改镜像源
conda config --add channels https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/free/
conda config --set show_channel_urls yes

修改后可以在~/.condarc配置文件中可以看到相应信息

```
git clone https://github.com/bailicangdu/node-elm  

cd node-elm

npm install

npm run dev

访问: http://localhost:8100（如果已启动前台程序，则不需打开此地址）

```




# 项目布局

```
.
├── config                          运行配置
│   ├── default.js                  默认配置
│   └── development.js              开发环境
├── controller                      处理中心，负责路由及数据库的具体操作
│   ├── admin
│   │   └── acount.js                管理员
│   ├── payapi
├── logs                            日志文件
├── middlewares                     中间价
│   ├── check.js                    权限验证    
│   └── statistic.js                API数据统计
├── models                          模型(数据库)
│   ├── admin
│   │   └── acount.js                管理员模型
├── mongodb                         连接数据库
│   └── db.js
├── prototype                       基础功能Class
│   ├── addressComponent.js         与腾讯、百度地图API相关的Class
│   └── baseComponent.js            底层类
├── public                          静态资源目录
├── views   
├── .babelrc 
├── .gitignore
├── API.md                          接口文档
├── app.js                          基础配置
├── COPYING                         GPL协议
├── index.js                        入口文件
├── package.json
├── README.md                  
.

47 directories, 197 files

```




# License



