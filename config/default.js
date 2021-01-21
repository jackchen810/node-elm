'use strict';

module.exports = {
	firmware_dir:'./public',
    pick_strategy_dir:'./process-pick/pick-strategy',
    strategy_dir:'./process-trade/trade-strategy',

    riskctrl_dir:'./process-gateway/trade-riskctrl',
    order_channel_dir:'./process-gateway/order-channel',

    market_channel_dir:'./process-market/market-channel',
    history_dl_dir:'./process-market/dl_channel',


    port:8000,    //监听端口
	url: 'mongodb://localhost:27017/nodequant',

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
};