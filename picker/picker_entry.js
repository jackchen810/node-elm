require("./picker_rx");
require("./picker_tx");


process.on('SIGHUP', function() {
    process.exit();//收到kill信息，进程退出
});


process.on('unhandledRejection', (reason, p) => {
    console.info("Unhandled Rejection:", p);
    // application specific logging, throwing an error, or other logic here
});


console.log('create picker process, pid:', process.pid);