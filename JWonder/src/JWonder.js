/********* 
 * Wonder-mask standard javascript library
 * Basic support module
 * ---------------------------------------------
 * This program is free software. Redistributed by MIT License
 * ---------------------------------------------
 * Xiaodi
 * 2013-9-2
 */

//////////////////////////////////// CORE ////////////////////////////////////////////
//Global startup
_JWonder=new(function (){
    var clientinfo;
    //----------- Tools method -------------

    //To judge object is defined
    var isDef=function(obj){
        return obj!==undefined;
    }

    //To judge object is null
    var isNull=function(obj){
        return obj===null;
    }

    //To judge object is a function
    var isFunc=function(obj){
        return typeof obj=="function";
    }

    //To judge object is a list
    /* What is list?
     * The list type in wstdbase like Array. there are various implementation.
     * first, a list include many successive subitems. each of theirs have an
     * index number
     * second, a property named "length" been defined, It express number of
     * items in list
     * third, the object must be one of following condition：
     *   a) the object's prototype is Array ( instanceof Array is True)
     *   b) "canList" property is been defined，it‘s values is True
     *   c) length set zero, but "item" method is been defined(NodeList)
     *   d) both index number [0] and [length-1] has been defined */
    var isList=function(obj){
        return obj instanceof Array ||
            ((typeof obj!="string") && obj && isDef(obj.length) && (
                 obj.canList || (!obj.length && obj.item) ||
                 (isDef(obj[0]) && isDef(obj[obj.length-1]))
                 )
            );
    }

    //Convert any object to string
    var toStr=function(obj){
        return obj+""
    }

    //Throw custom exception
    var exception=function(obj){
        throw obj;
    }

    //Throw exception that iterator is at the end position 
    var excIterEnd=function(){
        exception("IterateEnd");
    }

    //Create a range object
    var range=function(begin,end){
        var idx=isDef(end) && !isNull(end) ? begin : 0;
        end=isDef(end) && !isNull(end) ? end : begin;
        return idx<end ? 
            (function(){return idx==end ? excIterEnd() : idx++;}) :
            (function(){return idx==end ? excIterEnd() : idx--;});
    }

    //Create a iterator that enumerate specify list object
    var enumL=function(list,begin,end){
        end=isDef(end) && !isNull(end) ? end : list.length;
        begin=isDef(begin) && !isNull(begin) ? begin : 0;
        var listidx=range(begin,end);
        return function(){
            var idx=listidx();
            return {"data":list[idx],"index":idx};
        }
    }

    //Create a iterator that enumerate specify object‘s item
    var enumO=function(obj){
        var el_list=[];
        for (var el_name in obj) el_list.push(el_name);
        var el_iter=enumL(el_list);
        return function(){
            var idx=el_iter().data;
            return {"data":obj[idx],"index":idx};
        }
    }

    //Loop an iterator
    var loop=function(iter,func){
        var back_item,iter_item,result=[],jump=false,brk_jump=false;
        var jumpResult=function(){return jump=true;}//Continue
        var breakLoop=function(){return brk_jump=true;}//Break
        var loopResult=function(item){
            result.push(item);
            return false;
        }
        try{
            while(true){
                iter_item=iter();
                back_item=func(iter_item,{"pass":jumpResult,"exit":breakLoop});
                jump=!jump && loopResult(back_item);
                if (brk_jump)break;
            }
        }catch (e){
            e=="IterateEnd" || exception(e);
        }
        return result;
    }

    //Enumerate object
    var eachObj=function(obj,func){
        var result=loop(enumO(obj),function(item,opt){return func(item.data,item.index,opt)});
        return result;
    }

    //Enumerate one list(High preformance than each)
    // eachLis(list,{begin:?,end:?},function)
    // eachLis(list,function)
    var eachLis=function(list){
        arguments<2 && exception("Invalid number of arguments(at least 2 argument)");
        var func=arguments[arguments.length-1];
        var agent=function(item,opt){return func(item.data,item.index,opt)}
        var looprange=function(args){ //Enumerate with a range
            var begin=args[1] && args[1].begin;
            var end=args[1] && args[1].end;
            return loop(enumL(list,begin,end),agent);
        }
        var loopall=function(){return loop(enumL(list),agent);}//Enumerate all
        return ((arguments.length>2 && looprange) || loopall)(arguments);
    };

    //Combine multi-object to a list
    var combVarious=function(args,begin,end){
        //Relist parameter
        function reList(paramlist,begin,end){
            function addSingle(obj,list) { list.push(obj); }
            function addList(listsrc,listdist){
                eachLis(listsrc,function(obj){ listdist.push(obj); });
            }
            var result=[];
            eachLis(
                paramlist,{"begin":begin,"end":end},function(arg){
                    return isList(arg) ? addList(arg,result) : addSingle(arg,result);
                }
            );
            return result;
        }
        begin=isDef(begin) && !isNull(begin) ? begin : 0;
        end=isDef(end) && !isNull(end) ? end : args.length;
        return Math.abs(begin-end)==1 && isList(args[begin]) ? args[begin] : reList(args,begin,end);
    }

    //Enumerate several list
    // each(list1,list2,...,function)
    var each=function(){
        return arguments.length && arguments.length>1?
            eachLis(combVarious(arguments,0,arguments.length-1),arguments[arguments.length-1]) :
            [];
    }

    //Compare a value is in specify value list
    var isIn=function(obj){
        var cmpr=eachLis(combVarious(arguments,1),function(perdata,idx,opt){
            return (obj==perdata && opt.exit()) || opt.pass();
        });
        return (cmpr && cmpr.length);
    }

    //Shallow copy
    var shallowCopy=function(source,template){
        template=template||{};
        eachObj(source,function(item,name){
            template[name]=item;
        });
        return template;
    }

    //Execute json from text
    var executeJson=function(text){
        function eval_ie8low(text){
            var result;
            eval("result=("+text+")");
            return result;
        }
        try{
            return clientinfo.engine=="trident" && /^[1-4]\.[0-9]*/.test(clientinfo.engine_ver)?
                eval_ie8low(text) : eval("("+text+")");
        }catch(e0){
            throw "Convert json error";
        }
    }

    //----------- Const data -------------

    var BROWSERS=[//Parse brower types
            {"name":"opera","parse":/^Opera\/([0-9]+(\.[0-9]+)*)/,"verindex":1},
            {"name":"chrome","parse":/\sChrome\/([0-9]+(\.[0-9]+)*)/,"verindex":1},
            {"name":"safari","parse":/\sSafari\/([0-9]+(\.[0-9]+)*)/,"verindex":1},
            {"name":"firefox","parse":/\sFirefox\/([0-9]+(\.[0-9]+)*)/,"verindex":1},
            {"name":"ie","parse":/\sMSIE ([0-9]+(\.[0-9]+)*)/,"verindex":1},
            {"name":"ie","parse":/\sTrident.*\srv:([0-9]+(\.[0-9]+)*)/,"verindex":1}
        ];
    var ENGINES=[//Parse brower engines
            {"name":"webkit","parse":/\sAppleWebKit\/([0-9]+(\.[0-9]+)*)/,"verindex":1},
            {"name":"gecko","parse":/\sGecko\/([0-9]+(\.[0-9]+)*)/,"verindex":1},
            {"name":"presto","parse":/\sPresto\/([0-9]+(\.[0-9]+)*)/,"verindex":1},
            {"name":"trident","parse":/\sTrident\/([0-9]+(\.[0-9]+)*)/,"verindex":1}
        ];

    //----------- Private variable -------------

    var command_types={"simple":{},"parse":[],"object":[]};//Command functions
    var onload_exec=[];//Document loaded event executes

    //----------- Core functions -------------

    //Get client information from user-agent
    clientinfo=new (function(agent){
        //
        function parseClient(agent,pars) {
            var rst=each(pars,function(per,idx,opt){
                var pinf=per.parse.exec(agent);
                return (pinf && opt.exit() && 
                    { "subjname":per.name, "vername":pinf[per.verindex] }
                    ) || opt.pass();
            });
            return rst[0] || {"subjname":"unknow","vername":"none"};
        }
        //Combine infomation
        function combClientInfo(enginfo,browinfo){
            var clientinfo;
            clientinfo=browinfo.subjname=="ie" && /^[5-7]\./.test(browinfo.vername) ?
                {"engine":"trident","engine_ver":"3.0-"} :
                {"engine":enginfo.subjname,"engine_ver":enginfo.vername};
            clientinfo.browser=browinfo.subjname;
            clientinfo.browser_ver=browinfo.vername;
            return clientinfo;
        }
        return combClientInfo(parseClient(agent,ENGINES),parseClient(agent,BROWSERS));
    })(navigator.userAgent);

    //Get client region
    clientinfo.rgn=function(){
        return {
            "height":window.innerHeight || document.documentElement.clientHeight || 0,
            "width":window.innerWidth || document.documentElement.clientWidth || 0,
            "scrollTop":document.body.scrollTop || document.documentElement.scrollTop || 0,
            "scrollLeft":document.body.scrollLeft || document.documentElement.scrollLeft || 0
        }
    }

    //Parse command from string
    var commandFilter=function (cmd_conf,owner,input,parg){
        //RegParse filter
        function parseFilt(){
            var rst=each(cmd_conf.parse,function(percmd,idx,opt){
                var perarg=percmd.parse.exec(input);
                return (perarg && opt.exit() && {"func":percmd,"args":perarg}) || opt.pass();
            });
            return rst && rst.length ? [rst[0].func,rst[0].args] : null;
        }
        //Simple text filter
        function simpFilt(){
            try{
                return cmd_conf.simple[input] ? [cmd_conf.simple[input],null] : null;
            }catch(e){
                return null;
            }
        }
        //Object filter
        function objFilt(){
            var rst=each(cmd_conf.parse,function(percmd,idx,opt){
                return (percmd.parse(input) && opt.exit() && {"func":percmd,"obj":input}) || opt.pass();
            });
            return rst && rst.length ? [rst[0].func,rst[0].obj] : null;
        }
        //All text type dispatch
        function textFilt(){
            return simpFilt() || parseFilt() || objFilt();
        }
        var filter=typeof (input.parse) == "object" ? objFilt() : textFilt();
        return filter ? filter[0](owner,filter[1],parg) : null;
    }

    //Add execute method to event "onload"
    var addEventLoad=function (method){
        onload_exec.push(method);
        return onload_exec.length;
    }

    //Add command filter object
    var addCommand=function (cmdtable,cmdparam0,cmdparam1){
        var typesfunc={
            "parse":function(cmdobj){
                cmdtable.parse.push(cmdobj);
            },
            "simple":function(cmdobj){
                cmdtable.simple[cmdobj.parse]=cmdobj;
            },
            "object":function(cmdobj){
                cmdtable.object.push(cmdobj);
            }
        };
        var addParseCmd=function(cmdobj){
            typesfunc["parse"](cmdobj);
            return cmdtable;
        }
        var addFusionCmd=function(cmdtype,cmdobj){
            typesfunc[cmdtype](cmdobj);
            return cmdtable;
        }
        return isDef(cmdparam1) ? addFusionCmd(cmdparam0,cmdparam1) : addParseCmd(cmdparam0);
    }

    //----------- Private execute -------------

    //Page loaded event
    var eventLoaded =function (){
        each(onload_exec,function(perexec){perexec();});
    }
    var windowLoader=function(func){
        var oldIELoader=function(func){
            window.attachEvent("onload",func);
        }
        var w3cLoader=function(func){
            window.addEventListener("load",func);
        }
        var loader=!window.addEventListener? oldIELoader : w3cLoader;
        loader(func);
    }
    windowLoader(eventLoaded);

    //Export command parser
    var wonder=function(input){
        arg=each(arguments,function(perarg,idx,opts){return (idx>0 && perarg) || opts.pass();});
        arg=arg.length?arg:null;
        return commandFilter(command_types,wonder,input,arg);
    }

    //Special "_command" their use for add new command method in the kernel
    addCommand(command_types,"simple",new function(){
        var cmdfunc=function(cmdparam0,cmdparam1){
            addCommand(command_types,cmdparam0,cmdparam1);
        };
        var result=function(){
            return cmdfunc;
        }
        result.parse="_command";
        return result;
    });

    //Export function and properties
    wonder.eval=executeJson;
    wonder.addLoad=addEventLoad;
    wonder.shallowCopy=shallowCopy;
    wonder.eachLis=eachLis;
    wonder.eachObj=eachObj;
    wonder.each=each;
    wonder.range=range;
    wonder.iterLis=enumL;
    wonder.iterObj=enumO;
    wonder.ERRIterEnd=excIterEnd;
    wonder.loop=loop;
    wonder.combVarious=combVarious;
    wonder.exception=exception;
    wonder.isIn=isIn;
    wonder.isDef=isDef;
    wonder.isNull=isNull;
    wonder.isList=isList;
    wonder.toStr=toStr;
    wonder.Client=clientinfo;
    wonder._addCommand_=addCommand;
    wonder._filter_=commandFilter;
    wonder.Plugins={};
    wonder.wonderTag="#JWonder";

    return wonder;
})();

//////////////////////////////////// PLUGINS ////////////////////////////////////////////
//Create DOM options command
(function(){
    var command_types={"simple":{},"parse":[],"object":[]};

    //DOM Browser object
    var DOMBrowser=function(){
        var domcount=0;//Total DOM object number
        //The object who return for DOM operations
        var result={
            //Tag
            "wonderTag":"#DOMBrowser",
            //Element count
            "length":0,
            //Execute command
            "cmd":function(in_str){
                var arg=null;
                var i;
                if (arguments.length>1){
                    arg=[];
                    if (arguments.length==2 && (arguments[1] instanceof Array || arguments[1].cmd)){
                        for (i=1;i<arguments[1].length;i++)
                            arg.push(arguments[1][i]);
                    }else{
                        for (i=1;i<arguments.length;i++)
                            arg.push(arguments[i]);
                    }
                }
                return _JWonder._filter_(command_types,result,in_str,arg);
            },
            //Set HTML DOM style
            "setStyle":function(stylename,styleval){
                for (var i=0;i<domcount;i++){
                    if (typeof eval("result[i].style."+stylename) != "undefined"){
                        styleval=styleval.replace("'","\\'");
                        eval("result[i].style."+stylename+"='"+styleval+"'");
                    }
                }
                return result;
            },
            //Set attribute
            "setAttr":function(attrname,attrval){
                if (attrval!==null){//Add or modify
                    for (var i=0;i<domcount;i++){
                        result[i].setAttribute(attrname,attrval);
                    }
                }else{//Remove
                    for (var i=0;i<domcount;i++){
                        result[i].removeAttribute(attrname);
                    }
                }
                return result;
            },
            //Set CSS class set
            "setClass":function(){
                var clist=arg2class(arguments);
                var eleclass;
                for (var i=0;i<domcount;i++){
                    eleclass=result[i].className;
                    if (eleclass!=""){;
                        eleclass=eleclass.split(" ");
                    }else eleclass=[];
                    for (var j=0;j<eleclass.length;j++){
                        if (clist[eleclass[j]]!==2) clist[eleclass[j]]=1;
                    }
                    eleclass=[];
                    for (j in clist){
                        if (clist[j]!=2)eleclass.push(j);
                    }
                    result[i].className=eleclass.join(" ");
                }
                return result;
            },
            //Set form object's value
            "setVal":function(val){
                for (var i=0;i<domcount;i++){
                    if (typeof result[i].value != "undefined"){
                        result[i].value=val;
                    }
                }
                return result;
            },
            //Set inner contents
            "setInnr":function(innerdata,ifclean,ifhtml){
                var i;
                if (typeof innerdata == "string"){//For string
                    for (i=0;i<domcount;i++){
                        if (ifclean)result[i].innerHTML="";
                        if (ifhtml)result[i].innerHTML+=innerdata;
                        else result[i].appendChild(document.createTextNode(innerdata));
                    }
                }else if (typeof innerdata == "object" && innerdata.nodeType){//DOM
                    if (domcount>1)throw "DOM can not append to multi parents";
                    if (ifclean)result[0].innerHTML="";
                    result[0].appendChild(innerdata);
                }else if (_JWonder.isList(innerdata)){//DOM packer
                    if (domcount>1)throw "DOMs can not append to multi parents";
                    if (ifclean)result[0].innerHTML="";
                    for (i=0;i<innerdata.length;i++){
                        innerdata[i].nodeType && result[0].appendChild(innerdata[i]);
                    }
                }
                return result;
            },
            //Set node to sibling
            "setSibl":function(innerdata,tofront){
                //insert method
                var sib_insert=function(refr,newnode){
                    if (tofront)
                        refr.parentNode.insertBefore(newnode,refr);
                    else if (refr != refr.parentNode.lastChild)
                        refr.parentNode.insertBefore(newnode,refr.nextSibling);
                    else
                        refr.parentNode.appendChild(newnode);
                };
                //Do change
                var i;
                if (typeof innerdata == "string"){//For string
                    for (i=0;i<domcount;i++){
                        sib_insert(result[i],document.createTextNode(innerdata));
                    }
                }else if (typeof innerdata == "object" && innerdata.nodeType){//DOM
                    if (domcount>1)throw "DOM can not append to multi parents";
                    sib_insert(result[0],innerdata);
                }else if (typeof innerdata == "object" && innerdata.cmd){//DOM packer
                    if (domcount>1)throw "DOMs can not append to multi parents";
                    for (i=0;i<innerdata.length;i++){
                        sib_insert(result[0],innerdata[i]);
                    }
                }
                return result;
            },
            //Add node
            "and":function(){
                for (var i=0;i<arguments.length;i++){
                    if (arguments[i].nodeType==1)
                        addDOMNode(arguments[i]);
                    else if (arguments[i].wonderTag=="#DOMBrowser" || arguments[i] instanceof Array){
                        var swnodes=arguments[i];
                        for (var j=0;j<swnodes.length;j++){
                            if (swnodes[j].nodeType!=1)continue;
                            addDOMNode(swnodes[j]);
                        }
                    }
                }
                return result;
            },
            //Add event listen
            "event":function(eventname,method){
                for (i=0;i<domcount;i++){
                    if (result[i].addEventListener){
                        result[i].addEventListener(eventname,method);
                    }else if (_JWonder.Client.engine=="trident"){
                        result[i].attachEvent("on"+eventname,method);
                    }
                }
                return result;
            }
        };

        //------------- private method ---------------

        //Check CSS class name list, convert there to a hash table
        var arg2class=function(arg){
            var clist={};
            var pars=/^(\+|-)[a-zA-Z][a-zA-Z0-9\-_]*$/;
            var parg;
            for (var i=0;i<arg.length;i++){
                if (parg=pars.exec(arg[i])){
                    //set "2" for delete, else for add
                    clist[arg[i].substr(1)] = parg[1]=="+" ? 1 : 2;
                }
            }
            return clist;
        }

        //Add a DOM node
        var addDOMNode=function(node){
            if (node.nodeType && (node.nodeType==1 || node.nodeType==9)){
                result[domcount++]=node;
                result.length=domcount;
                return true;
            }
            return false;
        }

        //Initialize dom list refrence arguments
        var init=function(nodes){
            for (var i in nodes){
                if (nodes[i]){
                    addDOMNode(nodes[i]);
                }
            }
        }
        if (arguments.length==1 && arguments[0] instanceof Array)init(arguments[0]);//DOM list
        else if (arguments.length>0)init(arguments);//DOM in arguments list\

        //Return public object
        return result;
    }

    //Command: DOM create
    command_types.parse.push(new function(){
        var parse=/^\+([a-zA-Z_][a-zA-Z0-9_-]*[a-zA-Z0-9_]*)$/;
        var rname="DOMCreate";
        var result=function(owner,pcmd,parg){
            var swdom,count,i,j;
            var dlist=[];
            count=parg?parg:1;
            if (owner.wonderTag == "#DOMBrowser" && owner.length>0){
                for (i=0;i<owner.length;i++){
                    for (j=0;j<count;j++){
                        swdom=document.createElement(pcmd[1]);
                        owner[i].appendChild(swdom);
                        dlist.push(swdom);
                    }
                }
            }else{
                for (j=0;j<count;j++){
                    dlist.push(document.createElement(pcmd[1]));
                }
            }
            return new DOMBrowser(dlist);
        }
        result.parse=parse;
        result.name=rname;
        return result;
    });

    //Command: DOM remove from parent
    command_types.parse.push(new function(){
        var parse=/^-$/;
        var rname="DOMRemove";
        var result=function(owner,pcmd,parg){
            if (owner.wonderTag == "#DOMBrowser" && owner.length>0){
                for (var i=0;i<owner.length;i++){
                    owner[i].parentNode.removeChild(owner[i]);
                }
            }
            return owner;
        }
        result.parse=parse;
        result.name=rname;
        return result;
    });

    //Command: DOM find by tag name
    command_types.parse.push(new function(){
        var parse=/^\?([a-zA-Z_][a-zA-Z0-9_-]*[a-zA-Z0-9_]*|\*)$/;
        var rname="DOMFindTag";
        var result=function(owner,pcmd,parg){
            var dlist=[];
            var swnodes,i,j,lmdfilter;
            if (parg && parg.length>0)lmdfilter=parg[0];
            if (owner.wonderTag == "#DOMBrowser" && owner.length>0){
                for (i=0;i<owner.length;i++){
                    swnodes=owner[i].getElementsByTagName(pcmd[1]);
                    if (!swnodes)continue;
                    for (j=0;j<swnodes.length;j++){
                        if (lmdfilter && !lmdfilter(swnodes[j]))continue;
                        dlist.push(swnodes[j]);
                    }
                }
            }else{
                swnodes=document.getElementsByTagName(pcmd[1]);
                for (j=0;j<swnodes.length;j++){
                    if (lmdfilter && !lmdfilter(swnodes[j]))continue;
                    dlist.push(swnodes[j]);
                }
            }
            return new DOMBrowser(dlist);
        }
        result.parse=parse;
        result.name=rname;
        return result;
    });

    //Command: DOM find by ID
    command_types.parse.push(new function(){
        var parse=/^\#([a-zA-Z_][a-zA-Z0-9_-]*[a-zA-Z0-9_]*)$/;
        var rname="DOMFindID";
        var result=function(owner,pcmd,parg){
            swnodes=document.getElementById(pcmd[1]);
            return new DOMBrowser(swnodes);
        }
        result.parse=parse;
        result.name=rname;
        return result;
    });

    //Copy DOM commands to root
    for (var percmd in command_types.parse){
        _JWonder("_command")("parse",command_types.parse[percmd]);
    }

    //Command: Return DOM operation type
    _JWonder("_command")(new function(){
        var parse=/^_dom$/;
        var rname="DOMBasic";
        var result=function(owner,pcmd,parg){
            return new DOMBrowser(parg);
        }
        result.parse=parse;
        result.name=rname;
        return result;
    })
    //------------- DOM private command -------------

    //Command: Get child nodes
    command_types.parse.push(new function(owner,pcmd,parg){
        var parse=/^children$/;
        var rname="DOMFindChildren";
        var result=function(owner,pcmd,parg){
            var dlist=[];
            var swnodes,i,j,lmdfilter;
            if (parg && parg.length>0)lmdfilter=parg[0];
            if (owner.wonderTag == "#DOMBrowser" && owner.length>0){
                for (i=0;i<owner.length;i++){
                    swnodes=owner[i].childNodes;
                    if (!swnodes)continue;
                    for (j=0;j<swnodes.length;j++){
                        if (lmdfilter && !lmdfilter(swnodes[j]))continue;
                        if (swnodes[j].nodeType==1)dlist.push(swnodes[j]);
                    }
                }
                return new DOMBrowser(dlist);
            }
            return null;
        }
        result.parse=parse;
        result.name=rname;
        return result;
    });

    //Command: Get parent nodes
    command_types.parse.push(new function(owner,pcmd,parg){
        var parse=/^parent$/;
        var rname="DOMFindParent";
        var result=function(owner,pcmd,parg){
            var dlist=[];
            var swnodes,i,j;
            if (owner.wonderTag == "#DOMBrowser" && owner.length>0){
                for (i=0;i<owner.length;i++){
                    swnodes=owner[i].parentNode;
                    if (!swnodes)continue;
                    if (swnodes._WDOMSelect)continue;//Ignore repeat
                    swnodes._WDOMSelect=1;
                    if (swnodes.nodeType==1)dlist.push(swnodes);
                }
                for (i in dlist){
                    try{
                        delete dlist[i]._WDOMSelect;
                    }catch(e0){//For IE 7 early
                        dlist[i]._WDOMSelect=undefined;
                    }
                }
                return new DOMBrowser(dlist);
            }
            return null;
        }
        result.parse=parse;
        result.name=rname;
        return result;
    });
})();

//Ajax operations
_JWonder.Ax=new (function(){
    //Convert XML text
    var conv_xml=function(text){
        var dom_obj=null;
        try{//For Mozilla
            dom_obj=(new DOMParser()).parseFromString(text,"text/xml");
        }catch(e0){
            try{//For IE
                dom_obj=new ActiveXObject ("MSXML2.DOMDocument");
                dom_obj.loadXML(text);
            }catch(e0){
                throw "Convert XML error";
            }
        }
        return dom_obj;
    }

    var cb_statchange=function(sender,req){
        var http_status;
        var result;
        sender.readystate=req.readyState;
        /* ------------
         * readystate reference from the W3C document:
         * 0 Uninitialized
         * 1 Loading
         * 2 Loaded
         * 3 Interactive
         * 4 Completed
         * 
         * http://www.w3.org/TR/XMLHttpRequest
         */
        if (sender.readystate<=3)return;//Not completed
        if (sender.readystate==4){//Completed
            http_status=req.status;//The status code reference RFC2616
            if (http_status==200){//code 200 success
                try{
                    switch(sender.type){
                        case "json":
                        case "jobj":
                            result=_JWonder.eval(req.responseText);
                            break;
                        case "xml":
                            result=conv_xml(req.responseText);
                            break;
                        case "text":
                        default:
                            result=req.responseText;
                    }
                }catch(e0){
                    if (sender.onload)sender.onload(e0,sender,-1);
                    return null;
                }
                if (sender.onload)sender.onload(result,sender,http_status);
            }else if (sender.onload){//HTTP get an error code
                if (sender.onload)sender.onload(null,sender,http_status);
            }
        }
    }

    //AJAX object
    var axobj=function(initobj){
        var me=this;
        if (!initobj || !initobj.url || !initobj.onload)
            throw "Initialize failed: must specify request and callback information";
        me.readystate=0;
        me.url=initobj.url;
        me.onload=initobj.onload;
        me.content=initobj.content?initobj.content:null;
        if (typeof initobj.async=="undefined")me.async=true;
        else me.async=initobj.async?true:false;
        me.method=initobj.method=="post"?"post":"get";
        me.type=initobj.type?initobj.type:"text";//Support 'text'/'xml'/'json'
        me.header=initobj.header?initobj.header:{};
        //Create XMLHttpRequest
        if (window.XMLHttpRequest){
            me.req=new XMLHttpRequest;//Mozilla & IE8 or up
        }else if (window.ActiveXObject){//IE7 early
            try{
                me.req=new ActiveXObject("Msxml2.XMLHTTP");//msxml3.dll+
            }catch(e0){
                try{
                    me.req=new ActiveXObject("Microsoft.XMLHTTP");//msxml2.6-
                }catch(e1){
                    throw "Create XMLHTTPRequest[IE] error";//failed
                }
            }
        }else{
            throw "XMLHTTPRequest generater is not found";
        }

        //Status changing callback
        me.req.onreadystatechange=function(){
            cb_statchange(me,me.req);
        }

        //Send request
        me.start=function(){
            //Form encoding
            var form_enc=function(obj){
                var splt=[];
                for (var i in obj){
                    if (splt.length)splt.push("&");
                    splt.push(encodeURIComponent(String(i)));
                    splt.push("=");
                    splt.push(encodeURIComponent(String(obj[i])));
                }
                return splt.join("");
            }
            //Convert content
            var cber=null;
            if (me.method=="get" && me.content){
                if (typeof me.content != "object")throw "Content type is not support [GET]";
                if (!/^[^\?]+(\?([a-zA-Z0-9_]+=[^&]*)(&[a-zA-Z0-9_]+=[^&]*)*)?$/.test(me.url)){
                     throw "Can not combine content string that using HTTP method 'GET'";
                }
                if (/^[^?]+$/.test(me.url))me.url+="?";
                else me.url+="&";
                me.url+=form_enc(me.content);
            }else if (me.method=="post" && me.content){
                if (typeof me.content == "object"){
                    cber=form_enc(me.content);
                    me.header["Content-type"]="application/x-www-form-urlencoded";
                }else if (typeof me.content == "string"){
                    cber=me.content;
                    me.header["Content-type"]="application/x-www-form-urlencoded";
                }else throw "Content type is not support [POST]";
            }
            //Do request
            me.req.open(me.method.toUpperCase(),me.url,me.async);
            for (var i in me.header){
                me.req.setRequestHeader(i,me.header[i]);
            }
            me.req.send(cber);
        }
    }

    //Create method
    return function(obj){
        return new axobj(obj);
    }
})();

//////////////////////////////////// FINAL ////////////////////////////////////////////
//For compatible JQurey
if (typeof $ == 'undefined'){
    $=_JWonder;
}else{
    _$=_JWonder;
}
