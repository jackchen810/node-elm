'use strict';
const exec = require('child_process').exec;

module.exports = class PythonDownloadClass {
    constructor(script_name){
        //ktype
        this.script_name = script_name;
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
        exec('python ' + this.script_name, function(error,stdout,stderr){
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

}

