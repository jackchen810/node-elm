'use strict';

class Mytest {
    constructor() {

    }

    //做饭
    async cook() {
        console.log('开始做饭。');
        var p = new Promise(function (resolve, reject) {        //做一些异步操作
            setTimeout(function () {
                console.log('做饭完毕！');
                resolve('鸡蛋炒饭');
            }, 1000);
        });

        console.log('----------。');
        return p;
    }

    //吃饭
    async eat(data) {
        console.log('开始吃饭：' + data);
        var p = new Promise(function (resolve, reject) {        //做一些异步操作
            setTimeout(function () {
                console.log('吃饭完毕!');
                resolve('一块碗和一双筷子');
            }, 2000);
        });
        return p;
    }

    async wash(data) {
        console.log('开始洗碗：' + data);
        var p = new Promise(function (resolve, reject) {        //做一些异步操作
            setTimeout(function () {
                console.log('洗碗完毕!');
                resolve('干净的碗筷');
            }, 2000);
        });
        return p;
    }

    async test(){
        await this.cook();
        await this.eat();
        await this.wash();
        console.log('test end...');
    }

}

module.exports = new Mytest();