// 2013/1/14 17:32 回放相应js
// XHR 数据 图片资源的初始化
void function(){
	var 
		parseXML=function(doc){
			var 
				root;
			root=doc.documentElement;
		},
		dataInit=function(xml,ajax){
			var 
				obj;
			obj={};
			// ajax数据的初始化
			void function(){
				var 
					data;
				data=JSON.parse((ajax));
				obj.ajax=data;
				window["__xhrObj__"]=obj.ajax;
			}();

			// xml的初始化
			void function(){
				var 
					doc,
					parse,
					str;
				str=tarData(xml).xmlStr;
				parse=new DOMParser;
				doc=parse.parseFromString(str,"application/xml");
				obj.xml=doc;
				// 简单处理下xml
				void function(){

				}();

			}();

			return obj;
		},
		// xhr的初始化
		ajaxInit=function(arr){
			var 
				old;
			old=XMLHttpRequest;
			// XHR对象属性具有写限制 所以必须重写构造器 而且是唯一可行的方法
			XMLHttpRequest=function(){
				if(this.constructor!==XMLHttpRequest){
					throw("TypeError: Illegal invocation");
				}
			};
			for(var p in old.prototype){
				typeof old.prototype[p]==="function"&&
					(XMLHttpRequest.prototype[p]=function(){});
			}
			// 防止多次send的方式即在send中对xhr对象完成初始化
			XMLHttpRequest.prototype["send"]=function(){
				var 
					that,
					_obj,
					parse,
					_x;
				that=this;

				// 2014/1/22 18:19 new 时的移植
				parse=new DOMParser;
				XMLHttpRequest.num!==undefined?XMLHttpRequest.num++:(XMLHttpRequest.num=0);
				// _obj=window["__xhrObj__"][XMLHttpRequest.num];
				_obj=arr.filter(function(e){
					return e.__num__===XMLHttpRequest.num;
				})[0];

				if(!_obj){
					return null;
				}

				for(var p in _obj){
					that[p]=_obj[p];
				}
				// 傻逼jquery 还是罕见呀
				that["readyState"]=0;
				try{
					that["responseText"]=that["response"];
					_x=parse.parseFromString(that["response"],"application/xml");
					!_x.getElementsByTagName("parsererror").length?
						(that["responseXML"]=_x):
							(that["responseXML"]=null);
				}
				catch(ex){
					that["responseXML"]=null;
				}

				// 主要针对加载成功 time如何确定 
				setTimeout(function(){
					["onload","onreadystatechange"].forEach(function(e){
						that["readyState"]=4;
						(e in that)&&that[e]&&that[e]();
					});
					that["__load__"]&&that["__load__"].forEach(function(e){
						that["readyState"]=4;
						e.call(that,null); // 传说中event
					});
					that["__readystatechange__"]&&that["__readystatechange__"].forEach(function(e){
						that["readyState"]=4;
						e.call(that,null); // 传说中event
					});
					// ... 还有十几个呢
				},that.__time__);
				
			};
			// 处理addEventListener
			XMLHttpRequest.prototype["addEventListener"]=function(type,handler){
				!this["__"+type+"__"]?
					(this["__"+type+"__"]=[],this["__"+type+"__"].push(handler)):
						this["__"+type+"__"].push(handler);
				// removeEventListener ???
			};
		},
		imageInit=function(){
			var 
				p,
				egg,
				mouse;
			obj={};
			egg=document.createElement("div");
			mouse=document.createElement("div");
			p=document.createElement("div");

			egg.id="egg";
			egg.style.cssText="position: absolute; top: 0px; left: 0px; z-index: 9999;";
			mouse.id="mouse";
			mouse.style.cssText="position: absolute; top: -30px; left: -30px; width: 60px; height: 60px; z-index: 9999; background-image: url(http://u.bangfx.com/images/highlight_large.png);";
			p.id="point";
			p.style.cssText="position: absolute; top: 0px; left: 0px; width: 60px; height: 60px; background-image: url(http://u.bangfx.com/images/cursor.gif);"

			mouse.appendChild(p);
			document.body.appendChild(egg);
			document.body.appendChild(mouse);

			return {
				"egg":egg,
				"mouse":mouse
			}
		},
		// xhr的初始化 xml的初始化(原始字符串)
		playInit=function(xml,ajax){
			
			var 
				data,
				obj;
			// 首先初始化数据
			data=dataInit(xml,ajax);
			// 初始化ajax运行环境
			ajaxInit(data.ajax);
			// 初始化视图
			obj=imageInit();
			
			return {
				"xml":data.xml,
				"ajax":data.ajax,
				"egg":obj.egg,
				"mouse":obj.mouse
			};
		};
	window["playInit"]=playInit;
}();
// 播放状态表
void function(){
	var 
		t;

	t=window["PlayRun"]=window["PlayRun"]||{};
	t.selection=document.getSelection();
	// 有关视图信息 scroll wheel move有element标记
	t.curScroll=null;	// window或其它DOM对象
	t.curOver=null; // 当前over target
	t.preOver=null; // out用途
	t.onlyOver=0; // over 之无out
	t.exeOver=0; // 是否执行over
	t.curElement=null; // 当前element标记target
	t.curFocus=null; // 当前element标记target
	t.curDown=null; // 判定buttons的状态
	t.curValue=null; // 当前存在value选中的元素
	t.curWheel=null; // 当前wheel target
	t.direct=0;
	t.time=0; // 记录累加时间
	// 缓存当前的对象
	t.elementArr=[];	//{"path":[],tag:"",obj:null}
	t.textArr=[];	//{"path":[],tag:"",obj:null}
	t.mouseView={"x":0,"y":0};	// mousemove 有关clientX/Y偏移
	t.rangeView={"start":0,"startOffset":0,"end":0,"endOffset":0};
	t.valueView={"start":0,"end":0};
	t.screenView={"screenX":0,"screenY":0};
	t.pathView=[];
	// 有关key的相关断定 +? 注意初始化的影响
	t.shift=false;
	t.capsLock=false;
	t.clear=function(){
		t.curScroll=null;	// window或其它DOM对象
		t.curOver=null; // 当前over target
		t.preOver=null; // out用途
		t.onlyOver=0; // over 之无out
		t.exeOver=0; // 是否执行over
		t.curElement=null; // 当前element标记target
		t.curFocus=null; // 当前element标记target
		t.curDown=null; // 判定buttons的状态
		t.curValue=null; // 当前存在value选中的元素
		t.curWheel=null; // 当前wheel target
		t.direct=0;
		t.time=0; // 记录累加时间
		// 缓存当前的对象
		t.elementArr=[];	//{"path":[],tag:"",obj:null}
		t.textArr=[];	//{"path":[],tag:"",obj:null}
		t.mouseView={"x":0,"y":0};	// mousemove 有关clientX/Y偏移
		t.rangeView={"start":0,"startOffset":0,"end":0,"endOffset":0};
		t.valueView={"start":0,"end":0};
		t.screenView={"screenX":0,"screenY":0};
		t.pathView=[];
	};
}();
void function(){
	var 
		// 2014/1/24 14:52
		// 1.out-over-move机制问题 2. out-over引起的:hover展现问题 3.ajax时间线加入主控队列
		play=function(xml,ajax){
			var 
				con,
				pr,
				_egg,
				_mouse;
			_egg=document.getElementById("egg");
			_egg&&_egg.parentNode.removeChild(_egg);
			_mouse=document.getElementById("mouse");
			_mouse&&_mouse.parentNode.removeChild(_mouse);
			xml=xml||(window["RunTime"]&&window["RunTime"].allStr);
			ajax=ajax||(window["RunTime"]&&JSON.stringify(window["RunTime"].ajaxArr));
			con=playInit(xml,ajax);
			pr=window["PlayRun"];
			pr.clear();

			var 
				// http://localhost:3156/bang/
				url="http://u.bangfx.com/images/",
				// doci=iframe.contentDocument,
				doci=document,
				docx=con.xml,
				// doc=document,
				// iframe中 egg 和 mouse,input,action
				egg=con.egg,
				mouse=con.mouse,
				root=docx.documentElement,
				col=root.childNodes,
				// 表示当前元素
				count=0,
				length=col.length,
				// 控制xml
				timer1,
				// <node tag=12 path=[1,1]> 加入text node 
				getElement=function(obj){
					var 
						elem,
						_obj;
					if(obj.tag){
						elem=getElementByPath(obj.path);
						_obj=(elem?(getTargetCode(elem)===obj.tag?elem:null):null);
					}
					else{
						_obj=getTextByPath(obj.path);
					}
					
					return _obj;
				},
				// 需要增加keyup的考量
				getTarget=function(obj){
					var 
						t1,
						t2,
						pre,
						len,
						arr,
						elem,
						flag,
						target;
					pre=obj.previousElementSibling;
					t1=obj.nodeName.toLowerCase();
					t2=(pre&&pre.nodeName.toLowerCase());
					arr=pr.elementArr;
					len=arr.length;
					// over move down up focusin scroll 2014/2/21 11:35+wheel +contextmenu
					if(t2==="node"){
						elem=(len&&arr[len-1].__obj__); // nodeAction 已处理

						if(t1==="mouseover"){
							elem&& delete elem.__only__; 
							if(elem&&pr.onlyOver){
								elem.__only__=pr.onlyOver;
								pr.onlyOver=0;
							}
							pr.preOver=pr.curOver;
							pr.curOver=elem;
						}
						else if(t1==="focusin"){
							pr.curFocus=elem;
						}
						else if(t1.indexOf("scroll")!==-1){
							pr.curScroll=elem;
						}
						else if(t1==="mousewheel"){
							pr.curWheel=elem;
						}
						else{

						}

						return elem;
					}
					// move scroll 
					if(t2==="element"){
						target=parseInt(pre.getAttribute("target"));
						flag=parseInt(pre.getAttribute("flag"));
						elem=(!flag?getElement(arr[target]):arr[target].__obj__);

						if(t1.indexOf("scroll")!==-1){
							pr.curScroll=elem;
						}

						return elem;
					}

					// over move down up focusin scroll
					target=parseInt(obj.getAttribute("target"));
					flag=parseInt(obj.getAttribute("flag"));

					// over move down up focusin +wheel
					if(target>=0){
						elem=(!flag?getElement(arr[target]):arr[target].__obj__);

						if(t1==="mouseover"){
							// pr.curScroll=elem; 尼玛比的 能不出错吗
							elem&& delete elem.__only__; 
							if(pr.onlyOver){
								elem.__only__=pr.onlyOver;
								pr.onlyOver=0;
							}
							pr.preOver=pr.curOver;
							pr.curOver=elem;
						}
						else if(t1==="focusin"){
							pr.curFocus=elem;
						}
						else if(t1==="mousewheel"){
							pr.curWheel=elem;
						}
						else{

						}

						return elem;
					}
					else{
						// move down up scroll focusin +wheel +contextmenu
						if(t1.indexOf("scroll")!==-1){
							elem=pr.curScroll;
						}
						else if(t1==="mousewheel"){
							elem=pr.curWheel;
						}
						else if(t1==="focusin"){
							elem=pr.curOver;
							pr.curFocus=elem;
						}
						else {
							elem=pr.curOver;
						}

						return elem;
					}

				},
				nodeAction=function(obj){
					var 
						tag,
						path,
						elem,
						_obj;
					path=JSON.parse(obj.getAttribute("path"));
					tag=parseInt(obj.getAttribute("tag"));
					tag=!isNaN(tag)?tag:path;
					_obj=getElement({
						"path":path,
						"tag":tag
					});
					// 入元素队列,path和tag为唯一性 加入text node
					(tag?pr.elementArr:pr.textArr).push({
						"path":path,
						"tag":tag,
						"__obj__":_obj
					});
					// nextElementSibling is over move down up focusin scroll
				},
				elementAction=function(obj){

					// nextElementSibling is move scroll
				},
				// scroll-->getTarget
				scrollXAction=function(obj){
					var 
						x,
						elem,
						time;
					time=parseInt(obj.getAttribute("time"));
					pr.time+=(!isNaN(time)?time:0);

					x=parseInt(obj.getAttribute("x"));
					elem=getTarget(obj);
					if(elem===document){
						// 解决部分浏览器缓动问题
						elem.body.scrollLeft+=x;
						elem.documentElement.scrollLeft+=x;
					}
					else{
						elem&&(elem.scrollLeft+=x);
					}
				},
				scrollYAction=function(obj){
					var 
						y,
						time;
					time=parseInt(obj.getAttribute("time"));
					pr.time+=(!isNaN(time)?time:0);

					y=parseInt(obj.getAttribute("y")),
					elem=getTarget(obj);
					if(elem===document){
						elem.body.scrollTop+=y;
						elem.documentElement.scrollTop+=y;
					}
					else{
						elem&&(elem.scrollTop+=y);
					}
				},
				scrollAction=function(obj){
					var 
						x,
						y,
						elem,
						time;
					time=parseInt(obj.getAttribute("time"));
					pr.time+=(!isNaN(time)?time:0);

					x=parseInt(obj.getAttribute("x"));
					y=parseInt(obj.getAttribute("y"));
					elem=getTarget(obj);
					if(elem===document){
						elem.body.scrollLeft+=x;
						elem.documentElement.scrollLeft+=x;
						elem.body.scrollTop+=y;
						elem.documentElement.scrollTop+=y;
					}
					else{
						elem&&(elem.scrollLeft+=x);
						elem&&(elem.scrollTop+=y);
					}
				},
				resizeAction=function(obj){
					
				},
				// 针对错误处理
				errorAction=function(obj){
					var 
						time,
						number,
						message,
						filename,
						evt; // 注意error信息
					time=parseInt(obj.getAttribute("time"));
					number=parseInt(obj.getAttribute("number"));
					message=decodeURIComponent(obj.getAttribute("message"));
					filename=decodeURIComponent(obj.getAttribute("filename"));
					pr.time+=(!isNaN(time)?time:0);

					console.log(pr.time+"  is error. message : "+message+" number : "+number+" filename : "+filename);

				},
				// 针对focus的操作-->getTarget
				focusInAction=function(obj){
					var 
						time,
						elem;

					time=parseInt(obj.getAttribute("time"));
					pr.time+=(!isNaN(time)?time:0);
					pre=obj.previousElementSibling;
						
					elem=getTarget(obj);
					elem&&elem.focus();
					// 针对caret操作 得焦后的操作
					elem&&getEditable(elem)&&
						function(){
							elem.__start__=elem.selectionStart;
						}();
				},
				// 不传递对象
				focusOutAction=function(obj){
					var 
						time;
					time=parseInt(obj.getAttribute("time"));
					pr.time+=(!isNaN(time)?time:0);
					pr.curFocus&&pr.curFocus.blur();

				},
				/**
					MouseEvent={
						"bubbles":true,	// Event
						"cancelable":true,
						"view":window, // UIEvent
						"detail":0,
						"screenX":0, // MouseEvent
						"screenY":0,
						"clientX":0,
						"clientY":0,
						"ctrlKey":false,
						"shiftlKey":false,
						"altKey":false,
						"metaKey":false,
						"button":0,
						"buttons":0,
						"relatedTarget":null,
						"deltaX":0, // WheelEvent
						"deltaY":0,
						"deltaZ":0,
						"deltaMode":0,
					};
					WheelEvent={}; // 继承自MouseEvent
					TouchEvent={}; // 继承UIEvent
				**/
				getMouseEvent=function(obj){
					var 
						evt;
					evt=new MouseEvent(obj.type,{
						"bubbles":true,	
						"cancelable":true,
						"view":window, 
						"detail":0,
						"screenX":obj.screenX||0, 
						"screenY":obj.screenY||0,
						"clientX":obj.x,
						"clientY":obj.y,
						"ctrlKey":false,
						"shiftlKey":false,
						"altKey":false,
						"metaKey":false,
						"button":obj.button||0, // 0|1|2
						"buttons":obj.buttons||0, // 0 1 2 4
						"relatedTarget":obj.relatedTarget||null
					});
					return evt;
				},
				getWheelEvent=function(obj){
					var 
						evt;
					evt=new WheelEvent(obj.type,{
						"bubbles":true,	
						"cancelable":true,
						"view":window, 
						"detail":0,
						"screenX":obj.screenX||0, 
						"screenY":obj.screenY||0,
						"clientX":obj.x,
						"clientY":obj.y,
						"ctrlKey":false,
						"shiftlKey":false,
						"altKey":false,
						"metaKey":false,
						"button":obj.button||0, // 0|1|2
						"buttons":obj.buttons||0, // 0 1 2 4
						"relatedTarget":obj.relatedTarget||null,
						"deltaX":0,
						"deltaY":obj.deltaY,
						"deltaZ":0,
						"deltaMode":0
					});

					// evt.delta=obj.deltaY;
					// evt.deltaY=obj.deltaY;
					// evt.wheelDelta=-120*obj.deltaY;

					return evt;
				},
				getKeyEvent=function(obj){

				},
				// move down up -->getTarget +? 图标的右下处理 避免引起scroll的变化
				mouseMoveAction=function(obj){
					// mousedown 和mouseup 确定是否下蛋
					var 
						x,
						y,
						_x,
						_y,
						body,
						html,
						top,
						left,
						x1,
						y1,
						button,
						_a,
						time;
					time=parseInt(obj.getAttribute("time"));
					pr.time+=(!isNaN(time)?time:0);
					_x=parseInt(obj.getAttribute("x"));
					_y=parseInt(obj.getAttribute("y"));
					x=pr.mouseView.x+(_x?_x:0);
					y=pr.mouseView.y+(_y?_y:0);
					body=doci.body;
					html=doci.documentElement;
					top=body.scrollTop||html.scrollTop;
					left=body.scrollLeft||html.scrollLeft;
					x1=x+left;
					y1=y+top;
					button=obj.getAttribute("button")||1; // ???
					_a={
						"1":"behind_1.png",
						"2":"behind_2.png",
						"4":"behind_4.png"
					};
					pr.mouseView.x=x;
					pr.mouseView.y=y;
					// mousemove轨迹的移动???
					obj.nodeName.toLowerCase()==="mousemove"&&function(){
						var 
							elem;
						elem=getTarget(obj);
						mouse.style.top=y1-30+"px";
						mouse.style.left=x1-30+"px";
						elem&&elem.dispatchEvent(getMouseEvent({
							"type":"mousemove",
							"x":x,
							"y":y,
							"buttom":0, // ???
							"buttons":0, // ???
						}));
						// 图标再渲染一次
						mouse.style.top=y1-30+"px";
						mouse.style.left=x1-30+"px";
					}();
					// mousedown
					obj.nodeName.toLowerCase()==="mousedown"&&function(){
						var 
							elem;
						elem=getTarget(obj);
						pr.curDown=elem;
						mouse.style.top=y1-30+"px";
						mouse.style.left=x1-30+"px";
						elem&&elem.nodeName.toLowerCase()!=="select"&&
							elem.dispatchEvent(getMouseEvent({
								"type":"mousedown",
								"x":x,
								"y":y
							})); // 针对select
						// 图标再渲染一次
						mouse.style.top=y1-30+"px";
						mouse.style.left=x1-30+"px";
						// 2014/2/21 19:08 + 清空rangeView valueView
						pr.rangeView={
							"start":0,
							"startOffset":0,
							"end":0,
							"endOffset":0
						};
						pr.valueView={"start":0,"end":0};
						// range or value clear
						// pr.selection.collapse(document.body,0);
						pr.selection.collapse();
						// 存在bug 如果是用户操作 value不会采集 造成value的选中无法清楚
						// value的选中和selection存在本质上区别,后者属于全局对象管理,而value是元素自己管理
						// 2014/3/7 10:48 value的处理属于焦点处理 focus/blur 相当重要 ???
						/**
						pr.curValue&&
							function(){
								var 
									elem;
								elem=pr.curValue;
								elem.selectionStart=elem.selectionEnd;
								pr.curValue=null;
							}();
						**/
					}();
					// 先针对mouseup下蛋
					obj.nodeName.toLowerCase()==="mouseup"&&function(){
						var
							ele=doci.createElement("div");
							ele.style.cssText="position:absolute;background-image:url('"+url+_a[button]+"');width:60px;height:60px;";
							ele.style.top=y1-30+"px";
							ele.style.left=x1-30+"px";
						egg.appendChild(ele);
						// up click
						void function(){
							var 
								elem;
							elem=getTarget(obj);
							mouse.style.top=y1-30+"px";
							mouse.style.left=x1-30+"px";
							elem&&elem.dispatchEvent(getMouseEvent({
								"type":"mouseup",
								"x":x,
								"y":y
							}));
							// ??? bug 注意共同父元素 +? 注意右键不会click
							elem&&(elem===pr.curDown?
								elem.dispatchEvent(getMouseEvent({
									"type":"click",
									"x":x,
									"y":y
								})):
									function(){

									}());
							// 清空down
							pr.curDown=null;

						}();
					}();
					// +wheel
					obj.nodeName.toLowerCase()==="mousewheel"&&function(){
						var 
							elem,
							value,
							deltaY;
						elem=getTarget(obj);
						// pr.curDown=elem;
						mouse.style.top=y1-30+"px";
						mouse.style.left=x1-30+"px";
						// direct的断定
						value=obj.getAttribute("direct");

						if(pr.direct){
							if(value){
								pr.direct=-pr.direct;
							}
							deltaY=pr.direct;
						}
						else{
							// first 
							if(value){
								pr.direct=1;
							}
							else{
								pr.direct=-1;
							}
							deltaY=pr.direct;
						}

						elem&&elem.dispatchEvent(getWheelEvent({
							"type":"mousewheel",
							"x":x,
							"y":y,
							"deltaY":deltaY
						}));
						// 图标再渲染一次
						mouse.style.top=y1-30+"px";
						mouse.style.left=x1-30+"px";
					}();

				},
				mouseOverAction=function(obj){
					getTarget(obj); // 更新PlayRun
				},
				mouseoutAction=function(obj){
					var 
						time;
					time=parseInt(obj.getAttribute("time"));
					pr.time+=(!isNaN(time)?time:0);

					pr.curOver&&pr.curOver.dispatchEvent(getMouseEvent({
						"type":"mouseout",
						"x":-1,
						"y":-1
					}));
				},
				xhrStartAction=function(obj){
					var 
						count,
						time;
					time=parseInt(obj.getAttribute("time"));
					pr.time+=(!isNaN(time)?time:0);

					count=parseInt(obj.getAttribute("count"))+1;
					console.log(pr.time+" XHR start : "+count);
				},
				xhrSuccessAction=function(obj){
					var 
						count,
						time;
					time=parseInt(obj.getAttribute("time"));
					pr.time+=(!isNaN(time)?time:0);

					count=parseInt(obj.getAttribute("count"))+1;
					console.log(pr.time+" XHR success : "+count);
				},
				rangeAction=function(obj){
					var 
						start,
						end,
						startOffset,
						endOffset,
						rView,
						sElem,
						eElem,
						eArr,
						tArr,
						r,
						s;
					s=pr.selection;
					rView=pr.rangeView;
					eArr=pr.elementArr;
					tArr=pr.textArr;
					start=parseInt(obj.getAttribute("start"));
					end=parseInt(obj.getAttribute("end"));
					startOffset=parseInt(obj.getAttribute("startOffset"));
					endOffset=parseInt(obj.getAttribute("endOffset"));

					start=(start!==-1?start:rView.start);
					end=(end!==-1?end:rView.end);
					startOffset+=rView.startOffset;
					endOffset+=rView.endOffset;

					rView.start=start;
					rView.end=end;
					rView.startOffset=startOffset;
					rView.endOffset=endOffset;

					sElem=(!startOffset?eArr[start].__obj__:tArr[start].__obj__);
					eElem=(!endOffset?eArr[end].__obj__:tArr[end].__obj__);

					r=document.createRange();
					r.setStart(sElem,(sElem.nodeType===sElem.ELEMENT_NODE?0:startOffset-1));
					r.setEnd(eElem,(eElem.nodeType===eElem.ELEMENT_NODE?0:endOffset-1));
					// s.collapse(document.body,0);
					s.collapse();
					s.addRange(r);
				},
				screenAction=function(obj){
					var 
						x,
						y,
						sView;
					x=parseInt(obj.getAttribute("x"));
					y=parseInt(obj.getAttribute("y"));
					x+=sView.screenX;
					y+=sView.screenY;

					sView.screenX=x;
					sView.screenY=y;
				},
				keyAction=function(obj){

				},
				contextMenuAction=function(obj){
					var 
						elem,
						evt;
					elem=getTarget(obj);
					// evt=document.createEvent("Events");
					// evt.initEvent("contextmenu",true,true);
					evt=new Event("contextmenu",{"bubbles":true,"cancelable":true});
					elem&&elem.dispatchEvent(evt);
					console.log("debug : "+evt.type);
				},
				selectChangeAction=function(obj){
					var 
						elem,
						sIndex,
						evt;
					elem=pr.curOver;
					sIndex=parseInt(obj.getAttribute("sIndex"));
					elem&&(elem.selectedIndex=sIndex);
					evt=new Event("change",{"bubbles":true,"cancelable":true});
					elem&&elem.dispatchEvent(evt);
				},
				fileChangeAction=function(obj){
					var 
						elem, // file 替换 ???
						value,
						evt;
					elem=pr.curOver;
					value=decodeURIComponent(obj.getAttribute("value")||"");
					evt=new Event("change",{"bubbles":true,"cancelable":true});
					console.log(value||"debug : no files!");
					elem&&elem.dispatchEvent(evt);
				},
				keyDownAction=function(obj){
					var 
						elem,
						keyCode;
					elem=pr.curFocus;
					keyCode=parseInt(obj.getAttribute("keyCode"));
					elem&&(getEditable(elem)?function(){
						var 
							kObj,
							type,
							c,
							_m,
							_l,
							start,
							end,
							value,
							str,
							str1,
							str2,
							len,
							_obj,
							_tag;
						kObj=getKey(keyCode);
						type=kObj.type;
						start=elem.selectionStart;
						end=elem.selectionEnd;
						_tag=elem.nodeName.toLowerCase();
						value=elem.value;
						len=(value?value.length:0); // bug +?

						if(type==="capslock"){
							pr.capsLock=true;
						}
						else if(type==="shift"){
							pr.shift=true;
						}
						else if(type==="char"){
							// ??? 复杂的操作
							// 操作value,以及修正相应的selection
							c=kObj.raw;
							// 求知 插入 修正 +? 区分value选中状态
							_obj={
								"`":1,
								"-":1,
								"=":1,
								"[":1,
								"]":1,
								"\\":1,
								";":1,
								"'":1,
								",":1,
								".":1,
								"/":1
							};

							_m=c[0];

							if((_m>="A"&&_m<="Z")){
								if(pr.capsLock||pr.shift){
									_m=c[1];
								}
							}
							else if((_m>="0"&&_m<="9")||_obj[_m]){
								if(pr.shift){
									_m=c[1]||_m;
								}
							}
							else{

							}

							// str1=value.slice(0,elem.__start__);
							// str2=value.slice(elem.__start__);
							str1=value.slice(0,elem.selectionStart);
							str2=value.slice(elem.selectionEnd);
							elem.value=str1+_m+str2;

							elem.__start__+=1;
							elem.selectionStart=elem.__start__;
							elem.selectionEnd=elem.__start__;
						}
						else if(type==="dirc"){
							// 处理左右方向
							c=kObj.raw;

							if(end>start){
								if(c==="left"){
									elem.__start__=start;
									elem.selectionStart=elem.__start__;
									elem.selectionEnd=elem.selectionStart;
								}
								else if(c==="right"){
									elem.__start__=end;
									elem.selectionStart=elem.__start__;
									elem.selectionEnd=elem.selectionStart;
								}
								else{
									// 处理down/up 避免选中
									elem.selectionStart=elem.__start__;
									elem.selectionEnd=elem.selectionStart;
								}
							}
							else{
								if(c==="left"){
									_m=elem.__start__-1;
									elem.__start__=(_m>0?_m:0);
									elem.selectionStart=elem.__start__;
									elem.selectionEnd=elem.selectionStart;
								}
								else if(c==="right"){
									_m=elem.__start__+1;
									_l=value.length;
									elem.__start__=(_m>_l?_l:_m);
									elem.selectionStart=elem.__start__;
									elem.selectionEnd=elem.selectionStart;
								}
								else{
									// 处理down/up 避免选中
									elem.selectionStart=elem.__start__;
									elem.selectionEnd=elem.selectionStart;
								}
							}
						}
						else if(type==="del"){
							// very good 注意区分 range
							c=kObj.raw;

							if(end>start){
								_m=start-end;
								str1=value.slice(0,start);
								str2=value.slice(end);
								elem.value=str1+str2;
								// value变化引起selection的状态变化修正
								elem.__start__=start;
								elem.selectionStart=elem.__start__;
								elem.selectionEnd=elem.selectionStart;
							}
							else{
								// value的变化 selection的变化
								if(c==="backspace"){
									if(elem.selectionStart>0){
										str1=value.slice(0,elem.selectionStart-1);
										str2=value.slice(elem.selectionStart);
										elem.value=str1+str2;
										// value变化引起selection的状态变化修正
										elem.__start__-=1;
										elem.selectionStart=elem.__start__;
										elem.selectionEnd=elem.__start__;
									}
								}
								else if(c==="delete"){
									// selection保持不变
									if(elem.selectionStart<len){
										str1=value.slice(0,elem.selectionStart);
										str2=value.slice(elem.selectionStart+1);
										elem.value=str1+str2;
										// value变化引起selection的状态变化修正
										elem.selectionStart=elem.__start__;
										elem.selectionEnd=elem.__start__;
									}
								}
								else{

								}
							}
						}
						else if(type==="tab"){
							/*** 和采集对应,关注up非down
							// tab 键之up的处理 ??? 应该移到focusin/out中
							// elem.selectionStart=elem.__start__;
							void function(){
								var 
									tag;
								tag=elem.nodeName.toLowerCase();
								if(tag==="input"){
									elem.__start__=0;
									elem.selectionStart=0;
									elem.selectionEnd=len; // input value的选中
								}
								else if(tag==="textarea"){
									elem.selectionStart=elem.__start__; // caret的操作
									elem.selectionEnd=elem.selectionStart;
								}
								else{

								}
							}();
							***/

						}
						else if(type==="enter"){
							// elem.click();
							// 针对textarea
							if(_tag==="textarea"){
								str1=value.slice(0,elem.selectionStart);
								str2=value.slice(elem.selectionEnd);
								elem.value=str1+"\n"+str2;

								elem.__start__+=1;
								elem.selectionStart=elem.__start__;
								elem.selectionEnd=elem.__start__;
							}
							else{

							}
						}
						else{

						}
					}():
						function(){
							var 
								kObj,
								type,
								c;
							kObj=getKey(keyCode);
							type=kObj.type;
							if(type==="enter"){
								// click的模拟触发是有条件的 表单项不会触发 其它 +?
								// elem.click();
							}
						}());
				},
				// 注意空如起来的up 会有node ??? 重新判定getTarget
				keyUpAction=function(obj){
					var 
						elem,
						keyCode;
					elem=pr.curFocus;
					keyCode=parseInt(obj.getAttribute("keyCode"));
					elem&&getEditable(elem)&&
						function(){
							var 
								kObj,
								type;
							kObj=getKey(keyCode);
							type=kObj.type;
							if(type==="capslock"){
								pr.capsLock=false;
							}
							else if(type==="shift"){
								pr.shift=false;
							}
							else if(type==="tab"){
								// tab 键之up的处理 ??? 应该移到focusin/out中
								// elem.selectionStart=elem.__start__;
								void function(){
									var 
										tag;
									tag=elem.nodeName.toLowerCase();
									if(tag==="input"){
										elem.__start__=0;
										elem.selectionStart=0;
										elem.selectionEnd=elem.value.length; // input value的选中
									}
									else if(tag==="textarea"){
										elem.selectionStart=elem.__start__; // caret的操作
										elem.selectionEnd=elem.selectionStart;
									}
									else{

									}
								}();
							}
							else if(type==="dirc"){
								// 处理左右方向
								c=kObj.raw;

								if(c==="down"||c==="up"){
									elem.selectionEnd=elem.selectionStart;
								}

							}
							else{

							}
						}();

				},
				// caret由mouseup和tab keyup产生
				caretAction=function(obj){
					var 
						elem,
						p,
						pre,
						c;
					elem=pr.curFocus;
					p=parseInt(obj.getAttribute("p"));
					elem&&getEditable(elem)&&
						function(){
							elem.__start__=p;
							elem.selectionStart=p; // 注意value选中的特性
							pre=obj.previousElementSibling;
							c=parseInt(pre.getAttribute("keyCode"));
							
							if(pre.nodeName.toLowerCase()==="keydown"&&(c===38||c===40)){
								elem.selectionEnd=p;
							}

						}();
				},
				valueAction=function(obj){
					var 
						start,
						end,
						vView,
						elem;
					elem=pr.curOver;
					vView=pr.valueView;
					start=parseInt(obj.getAttribute("start"));
					end=parseInt(obj.getAttribute("end"));
					start+=vView.start;
					end+=vView.end;

					vView.start=start;
					vView.end=end;

					elem.selectionStart=start;
					elem.selectionEnd=end;

					elem.__start__=start;
					// pr.curValue=elem;
				},
				stringAction=function(obj){
					var 
						start,
						end,
						value,
						elem,
						old;
					start=parseInt(obj.getAttribute("start"));
					end=parseInt(obj.getAttribute("end"));
					value=decodeURIComponent(obj.getAttribute("value"));
					elem=pr.curFocus;

					elem&&function(){
						var 
							str,
							str1,
							str2,
							len;
							
						str=elem.value;
						len=str.length;
						str1=str.slice(0,start);
						str2=str.slice(len-end);
						elem.value=str1+value+str2;
						elem.__start__=str1.length+value.length;
						elem.selectionStart=elem.__start__;
						elem.selectionEnd=elem.__start__;

					}();



				},
				// 每个元素执行相应的动作
				actionObj=function(obj){
					// 2013/10/31 15:37 针对性的优化 选择mouse和focus优化
					switch(obj.nodeName.toLowerCase()){
						case "node":
							void function(){
								nodeAction(obj);
							}();
							break;
						case "element":
							void function(){
								elementAction(obj);
							}();
							break;
						case "mouseover":
							void function(){
								mouseOverAction(obj);
							}();
							break;
						case "mousewheel":
						case "mousemove":
						case "mousedown":
						case "mouseup":
							void function(){
								// ???
								if(pr.exeOver){
									pr.exeOver=0;
									/**
									if(pr.onlyOver){
										pr.onlyOver=0;
										pr.preOver&&
											pr.preOver.dispatchEvent(getMouseEvent({
												"type":"mouseout",
												"x":pr.mouseView.x,
												"y":pr.mouseView.y,
												"relatedTarget":pr.curOver
											}));
									}
									**/
									if(pr.curOver&&!pr.curOver.__only__){
										delete pr.curOver.__only__;
										pr.preOver&&
											pr.preOver.dispatchEvent(getMouseEvent({
												"type":"mouseout",
												"x":pr.mouseView.x,
												"y":pr.mouseView.y,
												"relatedTarget":pr.curOver
											}));
									}
									pr.curOver&&pr.curOver.dispatchEvent(getMouseEvent({
										"type":"mouseover",
										"x":pr.mouseView.x,
										"y":pr.mouseView.y,
										"relatedTarget":pr.preOver
									}));
								}
								mouseMoveAction(obj);
							}();
							break;
						case "mouseout":
							void function(){
								mouseoutAction(obj);
							}();
							break;
						// 针对window的scroll和resize操作
						case "scrollx":
							void function(){
								scrollXAction(obj);
							}();
							break;
						case "scrolly":
							void function(){
								scrollYAction(obj);
							}();
							break;
						case "scroll":
							void function(){
								scrollAction(obj);
							}();
							break;
						case "resize":
							void function(){
								resizeAction(obj);
							}();
							break;
						// 针对elmPos 操作,这个和mouseover关联一起，特别重要
						// mouseover可以忽略不计，大大的提高clicktale回放的性能 ???
						// case "mouseover":
						case "error":
							void function(){
								errorAction(obj);
							}();
							break;
						// 有关焦点的一些事件
						case "focusin":
							void function(){
								focusInAction(obj);
							}();
							break;
						case "focusout":
							void function(){
								focusOutAction(obj);
							}();
							break;
						case "xhrstart":
							void function(){
								// clicktale暂无处理
								xhrStartAction(obj);
							}();
							break;
						case "xhrsuccess":
							void function(){
								// clicktale暂无处理
								xhrSuccessAction(obj);
							}();
							break;
						case "range":
							void function(){
								rangeAction(obj);
							}();
							break;
						case "value":
							void function(){
								valueAction(obj);
							}();
							break;
						case "screen":
							void function(){
								screenAction(obj);
							}();
							break;
						case "key":
							void function(){
								keyAction(obj);
							}();
							break;
						case "contextmenu":
							void function(){
								contextMenuAction(obj);
							}();
							break;
						case "selectchange":
							void function(){
								selectChangeAction(obj);
							}();
							break;
						case "filechange":
							void function(){
								fileChangeAction(obj);
							}();
							break;
						case "keydown":
							void function(){
								keyDownAction(obj);
							}();
							break;
						case "keyup":
							void function(){
								keyUpAction(obj);
							}();
							break;
						case "caret":
							void function(){
								caretAction(obj);
							}();
							break;
						case "string":
							void function(){
								stringAction(obj);
							}();
							break;
						// 其它事件的待处理或默认不做处理
						case "submit":
						case "reset":
						default:
							void function(){
								
							}();
					}

				},
				// xml循环遍历
				a1=function(){
					// count主导一切
					count<length&&
						function(){
							var 
								t,
								type,
								obj;
							obj=col[count];
							t=parseInt(obj.getAttribute("time"));
							type=obj.nodeName.toLowerCase();

							// 存在时间属性时 move out down up scroll focusin/out
							if(t>=0){

								if(type==="mouseout"){
									pr.onlyOver=1; // over 之out 不需要触发
								}

								if(t<=2){
									actionObj(obj);
									count++;
									a1();
								}
								else{
									setTimeout(function(){
										actionObj(obj);
										count++;
										a1();
									},t);
								}
							}
							else{
								// over out node element
								if(type==="node"||type==="element"||type==="range"){
									actionObj(obj);
									count++;
									a1();
								}
								else if(type==="mouseover"){
									pr.exeOver=1;
									actionObj(obj);
									count++;
									a1();
								}
								else if(type==="mouseout"){
									pr.onlyOver=1; // over 之out 不需要触发
									count++;
									a1();
								}
								else{
									actionObj(obj);
									count++;
									a1();
								}
							}
						}();
				};
			a1(); // 递归调用
		},
		replay=function(){

		};	
		window["play"]=play;
}(); // @ sourceURL=play.js

