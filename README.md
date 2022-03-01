## ExpressPlus
Author:USher.Yue  
Email:4223665@qq.com  
Node Version:10.0+  
基于Node.js Express等二次封装的开发框架用于快速构建API 应用

## 目录结构  
├── app                         // 应用代码  
│   ├── cert                    //ssl证书目录  
│   ├── config.js                //配置文件   
│   ├── common                   // 开发环境    
│   ├── lang                      // 国际化  
│   ├── middleware                // 中间件  
│   ├── modules                // 模型  
│   ├── routers               //  路由   
│   └── views                 // 模板引擎    
├── core                      // 框架代码   
├── test                      //单元测试    
├── upload                    //文件上传目录    
├── .gitignore          
├── package.json  
├── README.md                    
└── www            //启动入口
## 核心对象(函数)  
```
global.db               全局Sequlize对象
global.redis            全局Redis客户端对象
global.models           全局模型列表对象
global.VModel           全局数据库虚拟模型类
global.newRouer()       全局路由构造方法
global.newSqlBuilder()  全局SQL构造器方法
global.M()              全局模型加载函数
global.L()              全局i18n加载函数
``` 

## 启动方法
```  
  npm install    //安装依赖
  npm start      //运行框架
```
## 模板引擎   
art-template   https://ejs.bootcss.com/#docs  
EJS   https://ejs.bootcss.com/#docs  

## 服务调用协议     
http(s)  



## ExpressPluss封装思想 
*  域名绑定自定义路由  
*  前后端分离开发  
*  数据库读写分离  
*  MVC+MVVM   
*  极少的代码开发  
*  SQL Builder&ORM  
*  基于注解路由的开发



