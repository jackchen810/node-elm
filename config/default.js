'use strict';

module.exports = {
	firmware_dir:'./public/firmware',
	device_dir:'./public/device',
	pkg_dir:'./public/packages',
	script_dir:'./public/scripts',
	url: 'mongodb://localhost:27017/iotks',
	amount_every_task: '500',
	interval_every_task: '600000',  //单位：ms
	ssl:{
		port: 443,
		key:'./ssl/214497547410545.key',
		cert:'./ssl/214497547410545.pem',
	},
	session: {
		name: 'SID',
		secret: 'SID',
		cookie: {
			httpOnly: true,
			secure:   false,
			maxAge:   2 * 60 * 60 * 1000,
		}
	},
	mqtt: {
		username: 'kunteng-iotks',
		protocol:'mqtt',
		rejectUnauthorized: false,  //false
		port: 8883,
		//host: 'safe.kunteng.org',
		host: 'emqtt.kunteng.org',
		ca_path: './mqttclient/files',
		key_file : 'apfree.key',
		cert_file : 'apfree.crt',
		trusted_ca_list : 'apfree.ca',
		node_topic: '$SYS/brokers/aisino@127.0.0.1/',
	}
}