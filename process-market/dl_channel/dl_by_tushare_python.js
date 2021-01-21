'use strict';
const config = require("config-lite");
const fs = require("fs");
const path = require("path");
const exec = require('child_process').exec;
const http = require('http');

module.exports = class PythonDownloadClass {
    constructor(){
        //ktype
        this.script_name = 'dl_by_tushare_python.py';
        this.script_fullname = path.join(__dirname, '../../', config.history_dl_dir, this.script_name);
        this.script_cmd = 'C:\\ProgramData\\Anaconda3\\python ' + this.script_fullname;
        this.running = false;
        this.timer_callback = this.timer_callback.bind(this);
    }

    async timer_callback(){
        console.log('timer_callback by python:', this.script_name);

        if (this.running == true){
            console.log('timer_callback already run, quit');
            return;
        }

        this.running = true;  //正在运行
        var self = this;  //正在运行
        console.log('python cmdstr:', this.script_cmd);
        exec(this.script_cmd, function(error,stdout,stderr){
            if(stdout.length >1){
                console.log('python finish:',stdout);
            }

            if(error) {
                console.info('stderr : '+stderr);
            }

            self.running = false;
        });
        console.log('timer_callback by python end');
    }

};

