'use strict';

module.exports = {
	firmware_dir:'./public/firmware',
    strategy_dir:'./trader/trade-strategy',
    riskctrl_dir:'./trader/trade-riskctrl',
    order_gateway_dir:'./trader/gateway-order',
    market_gateway_dir:'./trader/gateway-market',
    history_dl_dir:'./trader/history-dl',

	device_dir:'./public/device',
	pkg_dir:'./public/packages',
	script_dir:'./public/scripts',
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
			maxAge:   2 * 60 * 60 * 1000,
		}
	},
}