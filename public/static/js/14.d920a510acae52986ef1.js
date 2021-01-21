webpackJsonp([14],{525:function(t,e,a){a(910);var l=a(200)(a(912),a(913),null,null);t.exports=l.exports},910:function(t,e,a){var l=a(911);"string"==typeof l&&(l=[[t.i,l,""]]),l.locals&&(t.exports=l.locals);a(199)("c68778a2",l,!0)},911:function(t,e,a){e=t.exports=a(88)(!1),e.push([t.i,".demo-table-expand{font-size:0}.demo-table-expand label{width:90px;color:#99a9bf}.demo-table-expand .el-form-item{margin-right:0;margin-bottom:0;width:33%}.rad-group{margin-bottom:20px}.handle-input{width:300px;display:inline-block}.handle-box2{display:inline-block;float:right}.pagecont{margin-top:30px}",""])},912:function(t,e,a){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.default={data:function(){return{multipleTable:[],dialogFormVisible:!1,fullscreenLoading:!1,loading:!0,form:{task_id:"",task_status:"",strategy_name:"",stock_ktype:"",monitor_obj_list:[]},rules0:{start_time:[{required:!0,message:"请输入开始时间",trigger:"blur"}],end_time:[{required:!0,message:"请输入结束时间",trigger:"blur"}]},monitor_code_list_str:"",result_list:[],strategy_file_list:[],pageTotal:1,currentPage:1,page_size:10}},created:function(){this.getPickstockResultList(1,this.page_size),this.getStrategyList()},methods:{getPickstockResultList:function(t,e){var a=this,l={filter:{task_id:a.getTaskId},page_size:e,current_page:t};a.loading=!0,a.$axios.post("/api/pick/stock/result",l).then(function(t){a.loading=!1,0==t.data.ret_code?(a.result_list=t.data.extra.slice(0,10),a.pageTotal=t.data.total):a.result_list=[]})},getStrategyList:function(){var t=this;t.loading=!0,t.$axios.post("/api/strategy/list").then(function(e){t.loading=!1,0==e.data.ret_code?t.strategy_file_list=e.data.extra:console.log("resp:",e.data)})},saveAdd:function(t){var e=this,a={task_type:"monitor",strategy_type:"1",monitor_obj_list:e.form.monitor_obj_list,strategy_name:e.form.strategy_name,stock_ktype:e.form.stock_ktype};e.loading=!0,e.$axios.post("/api/task/add/simulate",a).then(function(t){e.loading=!1,0==t.data.ret_code?e.$message("添加成功"):e.$message("添加失败:"+t.data.extra)},function(t){e.$message("添加失败"),e.loading=!1,console.log(t)})},add_object_2monitor:function(t){var e=this;e.dialogFormVisible=!0,e.$refs.multipleTable.clearSelection(),e.$refs.multipleTable.toggleRowSelection(t)},page_forward_monitor:function(){this.$router.push({name:"TradeTaskManage",params:{task_type:"monitor"}})},handleSelectionChange:function(t){var e=this;e.form.monitor_obj_list=t,e.monitor_code_list_str="";for(var a=0;a<t.length;a++)e.monitor_code_list_str+=t[a].stock_symbol,e.monitor_code_list_str+=";"},handleCurrentChange:function(t){this.currentPage=t,this.getPickstockResultList(this.currentPage,this.page_size)}},computed:{getTaskId:function(){var t=this.$route.params.task_id;return void 0===t?t=localStorage.getItem("select_task_id"):localStorage.setItem("select_task_id",t),t}}}},913:function(t,e){t.exports={render:function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{staticClass:"table"},[a("div",{staticClass:"crumbs"},[a("el-breadcrumb",{attrs:{separator:"/"}},[a("el-breadcrumb-item",[a("i",{staticClass:"el-icon-upload"}),t._v(" 选股任务管理")]),t._v(" "),a("el-breadcrumb-item",[t._v("选股结果")])],1)],1),t._v(" "),a("div",{staticClass:"handle-box rad-group"},[a("el-button",{staticClass:"handle-del mr10",attrs:{type:"primary"},on:{click:t.page_forward_monitor}},[t._v("查看监控任务")]),t._v(" "),a("el-form",{staticClass:"handle-box2",attrs:{inline:!0}},[a("el-form-item",[a("el-button",{staticClass:"handle-del mr10",attrs:{type:"primary",icon:"el-icon-plus"},on:{click:function(e){t.dialogFormVisible=!0}}},[t._v("批量加入任务监控")])],1)],1)],1),t._v(" "),a("el-table",{directives:[{name:"loading",rawName:"v-loading",value:t.loading,expression:"loading"}],ref:"multipleTable",staticStyle:{width:"100%"},attrs:{data:t.result_list,border:""},on:{"selection-change":t.handleSelectionChange}},[a("el-table-column",{attrs:{type:"selection",width:"55"}}),t._v(" "),a("el-table-column",{attrs:{prop:"stock_symbol",label:"股票代码"}}),t._v(" "),a("el-table-column",{attrs:{prop:"symbol_name",label:"股票名称"}}),t._v(" "),a("el-table-column",{attrs:{prop:"stock_ktype",label:"K线类型"}}),t._v(" "),a("el-table-column",{attrs:{prop:"strategy_name",label:"选股策略",width:"240"}}),t._v(" "),a("el-table-column",{attrs:{label:"操作",width:"260"},scopedSlots:t._u([{key:"default",fn:function(e){return[a("el-button",{staticClass:"btn1",attrs:{type:"text",size:"small"},on:{click:function(a){t.add_object_2monitor(e.row)}}},[t._v("加入任务监控")])]}}])})],1),t._v(" "),a("div",{staticClass:"pagination"},[a("el-pagination",{attrs:{"current-page":t.currentPage,layout:"prev, pager, next",total:t.pageTotal},on:{"current-change":t.handleCurrentChange}})],1),t._v(" "),a("el-dialog",{staticClass:"digcont",attrs:{title:"批量加入任务监控",visible:t.dialogFormVisible},on:{"update:visible":function(e){t.dialogFormVisible=e}}},[a("el-form",{ref:"form",attrs:{model:t.form,rules:t.rules0,"label-width":"150px"}},[a("el-form-item",{attrs:{label:"绑定K 线周期"}},[a("el-select",{staticClass:"inp180",attrs:{placeholder:"请选择K线周期"},model:{value:t.form.stock_ktype,callback:function(e){t.$set(t.form,"stock_ktype",e)},expression:"form.stock_ktype"}},[a("el-option",{attrs:{label:"1分钟",value:"1"}}),t._v(" "),a("el-option",{attrs:{label:"5分钟",value:"5"}}),t._v(" "),a("el-option",{attrs:{label:"15分钟",value:"15"}}),t._v(" "),a("el-option",{attrs:{label:"30分钟",value:"30"}}),t._v(" "),a("el-option",{attrs:{label:"60分钟",value:"60"}}),t._v(" "),a("el-option",{attrs:{label:"120分钟",value:"120"}}),t._v(" "),a("el-option",{attrs:{label:"日线",value:"day"}}),t._v(" "),a("el-option",{attrs:{label:"周线",value:"week"}}),t._v(" "),a("el-option",{attrs:{label:"月线",value:"month"}})],1)],1),t._v(" "),a("el-form-item",{attrs:{label:"绑定交易策略",prop:"strategy_name"}},[a("el-select",{staticClass:"inp180",attrs:{placeholder:"请选择对应策略"},model:{value:t.form.strategy_name,callback:function(e){t.$set(t.form,"strategy_name",e)},expression:"form.strategy_name"}},t._l(t.strategy_file_list,function(t){return a("el-option",{key:t,attrs:{label:t,value:t}})}))],1),t._v(" "),a("el-form-item",{attrs:{label:"监控股票列表",prop:"strategy_name"}},[a("el-input",{staticClass:"inp200",attrs:{type:"textarea","auto-complete":"off",disabled:!0},model:{value:t.monitor_code_list_str,callback:function(e){t.monitor_code_list_str=e},expression:"monitor_code_list_str"}})],1),t._v(" "),a("el-form-item",[a("el-button",{on:{click:function(e){t.dialogFormVisible=!1}}},[t._v("退 出")]),t._v(" "),a("el-button",{attrs:{type:"primary"},on:{click:function(e){t.saveAdd("form")}}},[t._v("确 定")])],1)],1)],1)],1)},staticRenderFns:[]}}});