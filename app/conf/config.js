/**
 * PHPProject
 * Helper.php Created by usher.yue.
 * User: usher.yue
 * Date: 17/1/8
 * Time: 下午5:27
 */

module.exports = {
    dbConfig: {
        dbtype: 'mysql',
        dbname: 'openapi_v3',
        dialectOptions: {
            supportBigNumbers: true
        },
        write: {
            host: '172.16.205.122',
            port: 3306,
            username: 'root',
            password: '26e64a66112a8579'
        },
        read: [
            {
                host: '172.16.205.122',
                port: 3306,
                username: 'root',
                password: '26e64a66112a8579'
            }
        ]
    },
    httpConfig: {
        httpPort: 3002,
        //httpsPort:443,
        cert:{
            key:'key.pem',
            cert:'cert.pem'
        }
    },
    redisConfig:{
        host:'172.16.200.202',
        port:6379,
        db:0,
        password:''
    },
    //静态目录配置
    staticConfig:[
        {
            router:'/',
            path:'static_server_root',
            index:'index.html'
        }
    ],
    //session配置 session共享需要 redis mysql 集群支持
    sessionConfig:{
        driver:'memory',
        options:{}
    },
    middleWare:[
        // 'jwt'
    ],
    ///vue mvvm jwt
    jwt:{
        secret:'test secret',
    },
    //mvc模板引擎配置
    templateConfig:{
        viewsPath:'views',
        useCache:false,
        viewEngine:'ejs',
        extName:'.tplx',
    }
};