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
        dbname: 'test',
        dialectOptions: {
            supportBigNumbers: true
        },
        write: {
            host: '172.16.200.204',
            port: 3306,
            username: 'root',
            password: 'rjgrid'
        },
        read: [
            {
                host: '172.16.200.204',
                port: 3306,
                username: 'root',
                password: 'rjgrid'
            }
        ]
    },
    httpConfig: {
        port: 3002
    },
    redisConfig:{
        host:'172.16.200.202',
        port:6380,
        db:0,
        password:''
    },
    //静态目录配置
    staticConfig:[
        {
            router:'/',
            path:'public',
            index:'index.html'
        }
    ],
    //session配置 session共享需要 redis mysql 集群支持
    sessionConfig:{
        driver:'memory',
        options:{

        }
    },
    jwt:{
        secret:'test secret',
    },
    //模板引擎配置
    templateConfig:{
        viewsPath:'views',
        useCache:false,
        viewEngine:'artTemplate',
        extName:'.tplx',
        encoding:'utf8'
    }
};