#!/bin/bash

# node进程的启动文件，默认为：app.js
if [ -z "$APP" ]; then
    export APP=bin/www
fi

# pm2的启动参数，默认为：-x --no-daemon --name weibo2
if [ -z "$PM2PARAM" ]; then
    export PM2PARAM=-x --no-daemon --name weibo2
fi

# 保持容器持续执行的tail的文件，默认：/var/log/*.log
if [ -z "$TAILLOG" ]; then
    export TAILLOG=/var/log/*.log
fi

# 使用pm2启动node服务
pm2 start $APP $PM2PARAM
# 日志监听，保持容器持续运行不退出
tail -f $TAILLOG