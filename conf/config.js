/**
 * PHPProject
 * Helper.php Created by usher.yue.
 * User: usher.yue
 * Date: 17/1/8
 * Time: 下午5:27
 * 心怀教育梦－烟台网格软件技术有限公司
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
        port: 3001
    },
    redisConfig:{
        host:'172.16.200.202',
        port:6380,
        db:0,
        password:''
    }
};