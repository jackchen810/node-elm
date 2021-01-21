'use strict';
const TaskTable = require('../../models/task/task');
const TaskHandle = require("../../mqttclient/publish/mqtt_task.js");
const logger = require( '../../logs/logs.js');
const schedule = require('node-schedule');
logger.info('enter here mangehndle');

class ManageTimerHnd {
    constructor(){
    }

    async mode3_callback(){
        logger.info('start run mode3_callback');
        var task = await TaskTable.find({$or:[{'cmd_item':'apps'},{'cmd_item':'remote_cmd'}]});
        for(var i=0; i < task.length; i++){
            if(task[i].additions.mode == 3 && task[i].pubsub_status == 'request'){
                var stop_time = new Date(task[i].task_stop_at).getTime();
                if(Date.now() < stop_time){
                    var now = new Date();
                    await TaskHandle.createBatchPublish(task[i].uuid, now.getHours());
                }else{
                    await TaskTable.findOneAndUpdate({uuid: task[i].uuid},{$set: {'pubsub_status':'response_fail'}});
                }
            }
        }
    }
    async timeout_callback() {
//	logger.info('start run timeout_callback');
        var task = await TaskTable.find({$or:[{'cmd_item':'remote_cmd'},{'cmd_item':'apps'}]});
        for(var i=0;i < task.length;i++){
            if((task[i].pubsub_status == 'request') && (task[i].additions.mode ==2 || task[i].additions.mode ==3)){
                var stop_time = new Date(task[i].task_stop_at).getTime();
                if(Date.now() > stop_time){
                    await TaskTable.findOneAndUpdate({'uuid': task[i].uuid,'pubsub_status':'request'},{$set: {'pubsub_status':'response_fail'}});
                }
            }
        }
    }
}
const ManageHandle = new ManageTimerHnd();


schedule.scheduleJob('0 0 * * * *', ManageHandle.mode3_callback);
schedule.scheduleJob('0 0 * * * *', ManageHandle.timeout_callback);
