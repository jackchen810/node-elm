webpackJsonp([22],{205:function(t,n,e){e(139),t.exports=e(407)},407:function(t,n,e){"use strict";function o(t){return t&&t.__esModule?t:{default:t}}var a=e(20),i=o(a),r=e(410),c=o(r),l=e(417),p=o(l),u=e(201),h=o(u),s=e(202),f=o(s);e(514),e(139),i.default.use(f.default),h.default.defaults.withCredentials=!0,i.default.prototype.$axios=h.default,new i.default({router:p.default,render:function(t){return t(c.default)}}).$mount("#app")},410:function(t,n,e){e(411);var o=e(200)(null,e(416),null,null);t.exports=o.exports},411:function(t,n,e){var o=e(412);"string"==typeof o&&(o=[[t.i,o,""]]),o.locals&&(t.exports=o.locals);e(199)("47ef3a56",o,!0)},412:function(t,n,e){n=t.exports=e(87)(!1),n.i(e(413),""),n.i(e(414),""),n.push([t.i,"",""])},413:function(t,n,e){n=t.exports=e(87)(!1),n.push([t.i,"*{margin:0;padding:0}#app,.wrapper,body,html{width:100%;height:100%;overflow:hidden}body{font-family:Helvetica Neue,Helvetica,microsoft yahei,arial,STHeiTi,sans-serif}a{text-decoration:none}.content{background:none repeat scroll 0 0 #fff;position:absolute;left:250px;right:0;top:70px;bottom:0;width:auto;padding:40px;box-sizing:border-box;overflow-y:scroll}.crumbs{margin-bottom:20px}.pagination{margin:20px 0;text-align:right}.plugins-tips{padding:20px 10px;margin-bottom:20px}.el-button+.el-tooltip{margin-left:10px}.el-table tr:hover{background:#f6faff}.mgb20{margin-bottom:20px}.move-enter-active,.move-leave-active{transition:opacity .5s}.move-enter,.move-leave{opacity:0}.form-box{width:600px}.form-box .line{text-align:center}.el-time-panel__content:after,.el-time-panel__content:before{margin-top:-7px}.ms-doc .el-checkbox__input.is-disabled+.el-checkbox__label{color:#333;cursor:pointer}.pure-button{width:150px;height:40px;line-height:40px;text-align:center;color:#fff;border-radius:3px}.g-core-image-corp-container .info-aside{height:45px}.el-upload--text{background-color:#fff;border:1px dashed #d9d9d9;border-radius:6px;box-sizing:border-box;width:360px;height:180px;cursor:pointer;position:relative;overflow:hidden}.el-upload--text .el-icon-upload{font-size:67px;color:#97a8be;margin:40px 0 16px;line-height:50px}.el-upload--text{color:#97a8be;font-size:14px;text-align:center}.el-upload--text em{font-style:normal}.ql-container{min-height:400px}.ql-snow .ql-tooltip{transform:translateX(117.5px) translateY(10px)!important}.editor-btn{margin-top:20px}",""])},414:function(t,n,e){n=t.exports=e(87)(!1),n.push([t.i,".header{background-color:#242f42}.login-wrap{background:#324157}.plugins-tips{background:#eef1f6}.el-upload--text em,.plugins-tips a{color:#20a0ff}.pure-button{background:#20a0ff}",""])},416:function(t,n){t.exports={render:function(){var t=this,n=t.$createElement,e=t._self._c||n;return e("div",{attrs:{id:"app"}},[e("router-view")],1)},staticRenderFns:[]}},417:function(t,n,e){"use strict";function o(t){return t&&t.__esModule?t:{default:t}}Object.defineProperty(n,"__esModule",{value:!0});var a=e(20),i=o(a),r=e(418),c=o(r);i.default.use(c.default),n.default=new c.default({routes:[{path:"/",redirect:"/login"},{path:"/readme",component:function(t){return e.e(5).then(function(){var n=[e(515)];t.apply(null,n)}.bind(this)).catch(e.oe)},children:[{path:"/",component:function(t){return e.e(19).then(function(){var n=[e(516)];t.apply(null,n)}.bind(this)).catch(e.oe)}},{path:"/basetable",component:function(t){return e.e(0).then(function(){var n=[e(517)];t.apply(null,n)}.bind(this)).catch(e.oe)}},{path:"/system/setup",name:"SystemSetup",component:function(t){return e.e(3).then(function(){var n=[e(518)];t.apply(null,n)}.bind(this)).catch(e.oe)}},{path:"/select/strategy",component:function(t){return e.e(10).then(function(){var n=[e(519)];t.apply(null,n)}.bind(this)).catch(e.oe)}},{path:"/strategy/manage",component:function(t){return e.e(8).then(function(){var n=[e(520)];t.apply(null,n)}.bind(this)).catch(e.oe)}},{path:"/riskctrl/manage",component:function(t){return e.e(11).then(function(){var n=[e(521)];t.apply(null,n)}.bind(this)).catch(e.oe)}},{path:"/order/gateway",component:function(t){return e.e(12).then(function(){var n=[e(522)];t.apply(null,n)}.bind(this)).catch(e.oe)}},{path:"/market/gateway",component:function(t){return e.e(13).then(function(){var n=[e(523)];t.apply(null,n)}.bind(this)).catch(e.oe)}},{path:"/task/manage",name:"TradeTaskManage",component:function(t){return e.e(6).then(function(){var n=[e(524)];t.apply(null,n)}.bind(this)).catch(e.oe)}},{path:"/task/log",component:function(t){return e.e(2).then(function(){var n=[e(525)];t.apply(null,n)}.bind(this)).catch(e.oe)}},{path:"/task/buysell",component:function(t){return e.e(17).then(function(){var n=[e(526)];t.apply(null,n)}.bind(this)).catch(e.oe)}},{path:"/task/detail",name:"TradeTaskDetail",component:function(t){return e.e(7).then(function(){var n=[e(527)];t.apply(null,n)}.bind(this)).catch(e.oe)}},{path:"/select/manage",name:"PickstockTaskManage",component:function(t){return e.e(9).then(function(){var n=[e(528)];t.apply(null,n)}.bind(this)).catch(e.oe)}},{path:"/select/result",name:"PickstockResult",component:function(t){return e.e(18).then(function(){var n=[e(529)];t.apply(null,n)}.bind(this)).catch(e.oe)}},{path:"/backtest/manage",name:"BacktestTaskManage",component:function(t){return e.e(16).then(function(){var n=[e(530)];t.apply(null,n)}.bind(this)).catch(e.oe)}},{path:"/backtest/result",name:"BacktestResult",component:function(t){return e.e(20).then(function(){var n=[e(531)];t.apply(null,n)}.bind(this)).catch(e.oe)}},{path:"/data/manage",component:function(t){return e.e(15).then(function(){var n=[e(532)];t.apply(null,n)}.bind(this)).catch(e.oe)}},{path:"/history/data",component:function(t){return e.e(14).then(function(){var n=[e(533)];t.apply(null,n)}.bind(this)).catch(e.oe)}}]},{path:"/login",component:function(t){return e.e(4).then(function(){var n=[e(534)];t.apply(null,n)}.bind(this)).catch(e.oe)}},{path:"/register",component:function(t){return e.e(1).then(function(){var n=[e(535)];t.apply(null,n)}.bind(this)).catch(e.oe)}}]})},514:function(t,n){}},[205]);