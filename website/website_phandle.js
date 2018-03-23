'use strict';



class WebsiteProcessHandle {
    constructor(worker_handle) {
        //创建一个工作进程
        //this.website = fork('./website/website_entry.js');
        this.website = worker_handle;
        //this.website.on('message', message_reactor);
        //this.message_reactor = message_reactor;
        //this.website.on('message', this.onMessage);
        console.log('create WebsiteProcessHandle');


        this.onMessage = this.onMessage.bind(this);
    }

    //进程消息处理, 接收进程内部消息，通过emitter转换成event发送
    async onMessage(message){
        //this.message_reactor(message, 'web');
        console.log('[test] website message:');
    }


}

//const WebsiteHndle= new WebsiteProcessHandle();
console.log('startup agent website ');

module.exports = WebsiteProcessHandle;
