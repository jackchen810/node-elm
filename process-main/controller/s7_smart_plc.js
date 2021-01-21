'use strict';

const AdminModel = require('../../models/admin/admin');
const logger = require( '../../logs/logs.js');
const schedule = require('node-schedule');

class adminTimerHnd {
	constructor() {

	}
	async update_admin_device(){

	}
}

const AdminTimerHandle = new adminTimerHnd();
schedule.scheduleJob('0 0 * * * *', AdminTimerHandle.update_admin_device);
