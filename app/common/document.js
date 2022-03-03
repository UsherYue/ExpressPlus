/**
 * ExpressPlus
 * document.js Created by usher.yue.
 * User: usher.yue
 * Date: 2022/3/3
 * Time: 13:42
 * 自动化文档
 */
module.exports = {
    projectName: 'ExpressPlus',
    summary: {
        'OAuth认证相关': {
            UserLogin:{
                headers:[
                    'Token xxxxxxxxx  false',
                ],
                parameters:[
                    'username 账号  true',
                    'password 密码   true'
                ],
                result:`
                 {
                    ret: 0,
                    msg: "",
                    uid: "1000********1341268",
                    username: "lcq***",
                    password: "96e79218965eb72c92**************",
                    realname: "刘*强",
                }
                 `,
            },
        },
        '用户交易相关': {

        },
        '身份信息修改': {

        }
    }
};