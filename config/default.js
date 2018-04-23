'use strict';

module.exports = {
	firmware_dir:'./public',
    pick_strategy_dir:'./picker/pick-strategy',
    strategy_dir:'./trader/trade-strategy',
    riskctrl_dir:'./trader/trade-riskctrl',
    order_gateway_dir:'./gateway/gateway-order',
    market_gateway_dir:'./gateway/gateway-market',
    history_dl_dir:'./downloader/dl_way',


    port:8000,    //监听端口

	url: 'mongodb://localhost:27017/nodequant',
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
			maxAge:   60 * 60 * 1000,   //单位：ms
		}
	},
}