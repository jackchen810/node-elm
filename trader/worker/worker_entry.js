require("./worker_main");
require("./worker_rxtx");


process.on('SIGHUP', function() {
    process.exit();//收到kill信息，进程退出
});


process.on('unhandledRejection', (reason, p) => {
    console.info("Unhandled Rejection:", p);
    // application specific logging, throwing an error, or other logic here
});


console.log('create worker process, pid:', process.pid);