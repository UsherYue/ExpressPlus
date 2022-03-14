const { contextBridge } = require('electron')


/**
 * Electron每个窗口独立一个主进程,然后渲染进程也是分开的 渲染进程和preload在同一个进程下 通向window对象
 */
window.addEventListener('DOMContentLoaded', () => {
    // const { shell } = require("electron");
    // shell.openExternal('http://www.5nd.com');

});


/**
 * 通过上下文隔离环境暴露方法 属性 给 Render渲染进程,通过IPC可以对主进程进行操作交互
 */
contextBridge.exposeInMainWorld('UI', {
    desktop: true,
    func1:()=>{

    }
})