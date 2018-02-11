'use strict';

module.exports = {
    local_ip:'192.168.99.30',
    amount_every_task: '2',
    interval_every_task: '30000',  //单位：ms
    port:80,    //监听端口
    ssl:{
        port: 443,
        key:'./ssl/214497547410545.key',
        cert:'./ssl/214497547410545.pem',
    },
    mqtt: {
        username: 'kunteng-iotks',
        protocol:'mqtt',
        rejectUnauthorized: false,  //false
        port: 8883,
        host: 'safe.kunteng.org',
        ca_path: './mqttclient/files',
        key_file : 'apfree.key',
        cert_file : 'apfree.crt',
        trusted_ca_list : 'apfree.ca',
        node_topic: '$SYS/brokers/aisino@127.0.0.1/',
    }	
}