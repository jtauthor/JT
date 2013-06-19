

/************************************************************************************************************ 
 **********************************      JavaScript Tools(by wangfz)      *********************************** 
 ************************************************************************************************************/
 
 
window.JT=(function(){if(window.$){var o={}; o.extend=$.extend; return o;}return false;})();

//如果选择依赖库，这个函数则可以注释或剔除掉。  
window.JT=window.JT||(function(){	
	var JT = function(dom){if(!dom) {return this;} this.length=0;if(dom.length){for(var i=0;i<dom.length;i++){this[this.length++]=dom[i]}}else{this[this.length++]=dom}return this}
	var _$ = function(dom){return new JT(dom);}
	
	_$.fn=JT.prototype = { 
			forEach		: [].forEach,
			eq 			: function(i){var _this=this,slice=function(){return _$([].slice.apply(_this,arguments))};return i===-1?slice(i):slice(i,+i+1)},			
			find		: function(str){function unique(arr){for(var i=0;i<arr.length;i++){if(arr.indexOf(arr[i])!=i){arr.splice(i,1);i--}}return arr}if(this.length===0){return undefined}var elems=[],tmpElems;for(var i=0;i<this.length;i++){tmpElems=this[i].querySelectorAll(str);for(var j=0;j<tmpElems.length;j++){elems.push(tmpElems[j])}}return _$(unique(elems))}, 
			each		: function(callback){this.forEach(function(el,idx){callback.call(el,idx,el)});return this},		
			addClass	: function(name){this.each(function(){this.classList.add(name);});return this;},
			removeClass	: function(name){this.each(function(){this.classList.remove(name);});return this;},
			css			: function(attribute, value, obj){var toAct=obj!=undefined?obj:this[0];if(this.length===0)return undefined;if(value==undefined&&typeof(attribute)==="string"){var styles=window.getComputedStyle(toAct);return toAct.style[attribute]?toAct.style[attribute]:window.getComputedStyle(toAct)[attribute]}for(var i=0;i<this.length;i++){if(typeof attribute==="object"){for(var j in attribute){this[i].style[j]=attribute[j]}}else{this[i].style[attribute]=value}}return this},			
			bind		: function(type, fn){this.each(function(){this.addEventListener(type, fn, false);}); return this;}, 
			unbind		: function(type, fn){this.each(function(){this.removeEventListener(type, fn, false);}); return this;}, 
			append		: function(node){node=node.nodeType==1?node:node[0];this[0].appendChild(node);return this;},
			prepend		: function(node){node=node.nodeType==1?node:node[0];node=node.cloneNode(true);this[0].insertBefore(node, this[0].firstChild);return this;},
			clone		: function(deep){var node=this[0].cloneNode(true); return _$(node);}
	};

	_$.extend = function(target){if(target==undefined)target=this;if(arguments.length===1){for(var key in target)this[key]=target[key];return this}else{slice.call(arguments,1).forEach(function(source){for(var key in source)target[key]=source[key]})}return target};	
	
	return _$;
})();


JT.extend({		
	/**
	 *	滑动播放组件(tab切换、tab滑动、滑图功能, 播放功能)	
	 *	例：txSlide({panel:panel});
	 *
	 *	使用说明：
	 *
	 *	点击指定项, 立马从当前位置跳到指定项位置, 过渡效果可能是向左的, 如2→4, 也可能是向右的, 如5→3
	 *	点击下一页/上一页(向左滑/向右滑), 如果循环参数loop为true, 那么支持单方向无限次数滑动，否则到头则停止。
	 *	开启自动播放时, 过渡效果是向左的, 循环参数loop会强制为true, 一直播放下去。
	 *
	 * 	options : { 
	 *		container		: container, 	//必选 滑动面板容器元素或选择器
	 * 
	 *		tab				: tab,			//可选 tab元素数组或选择器
	 *		activeClass		: 'selected', 	//可选 激活时的class
	 *		duration   		: 400,			//可选 一幅帧完整滑过的时间 单位毫秒 
	 *		ease			: 'linear'		//可选 动画过渡效果
	 *		bounce 			: true,			//可选 bounce效果
	 *		onTouchMove		: null,			//可选 触摸移动时的回调
	 *		onScrollStart	: null, 		//可选 开始滚动前的回调
	 *		onScrollEnd		: null,		 	//可选 在滚动结束后的回调
	 *		showPrevNext	: false, 		//可选 是否显示上一页 下一页
	 *		showIndicator	: false, 		//可选 是否指示器，多数情况下以“点点点”表现形式展现
	 * 		isLoop			: false,		//可选 是否支持循环滑动, 单方向无限滑动
	 *		isPlay			: false,		//可选 如果为true, isLoop参数为强制为true
	 *		stayTime		: 2000,			//可选 帧的间隔时间, 每帧的停留时间 单位毫秒 	 
	 *  }
	 *	
	 *	返回一个slide对象。 
	 *	return {
	 *		//以下几个方法是为方便开发者自定义使用
	 *		num 			: number,		//取滑动面板数量
	 *		width 			: number,		//滑动面板宽度
	 *		moveX 			: number,		//当前滑动面板的偏移量	 
	 *		goIndex			: function(){},	//前进、后退、去第几项	
	 * 		getPastIndex 	: function(){}	//取刚刚过去(上一次)的索引	
	 * 		getCurrentIndex : function(){}	//取当前索引
	 *
	 * 		//以下播放控制功能仅当isPlay为true时有效。
	 *		start			: function(){}, //开始
	 *		go				: function(){}, //继续
	 *		pause			: function(){}, //暂停
	 *		stop			: function(){}, //停止	
	 *	}
	 *	
	 */	
	slide : function(options){
		var $=window.$ || window.JT; //此处$(dom)只要具备支持索引、length、eq、find、addClass、removeClass、css、append、prepend、clone、bind、unbind这些属性/方法即可。		
		
		$.fn.eq = $.fn.eq || function(i){var _this=this,slice=function(){return $([].slice.apply(_this,arguments))};return i===-1?slice(i):slice(i,+i+1)}; //jqmobi目前还不支持这个函数		
		
		var hasTouch = 'ontouchstart' in window, START_EV = hasTouch ? 'touchstart' : 'mousedown', MOVE_EV = hasTouch ? 'touchmove' : 'mousemove', END_EV = hasTouch ? 'touchend' : 'mouseup';
			
		var o={
			init : function(options){
				var _this=this;				
				this.oContainer=typeof options.container==='string'? $(document.querySelector(options.container)) :  $(options.container); 
				this.oTab=typeof options.container==='string' ? $(document.querySelectorAll(options.tab)) : $(options.tab);			
				this.oPanelParent=this.oContainer.find('.t_panels');
				this.isLoop=options.isPlay?true:options.isLoop;			
				if(this.oContainer.find('.t_panel').length<=1){return;}
				this.activeClass=options.activeClass ||'active';
				this.oContainer.find('.t_panel').removeClass(this.activeClass);
				if(this.isLoop){
					(function addCloneNode(){
						var oPanel=_this.oContainer.find('.t_panel'), cloneFirstNode=oPanel.eq(0).clone().addClass('clone'), cloneLastNode=oPanel.eq(oPanel.length-1).clone().addClass('clone');
						_this.oPanelParent.append(cloneFirstNode).prepend(cloneLastNode);
					})();
				}
				this.oPanel=this.oContainer.find('.t_panel');
				this.slideNum = this.oPanel.length;	
				this.slideWidth = parseInt(getComputedStyle(this.oPanelParent[0]).width);			
				this.oPanelParent.css('-webkit-tap-highlight-color', 'rgba(255,255,255,0)').css('width',(this.slideNum*this.slideWidth)+'px').css('-webkit-transition','0s');		
				this.oPanel.css('float', 'left').css('width', this.slideWidth+'px').css('overflow','hidden');				
				this.duration =options.duration?parseInt(options.duration)+'ms' : '400ms';
				this.bounce = options.bounce==undefined?true:options.bounce;
				this.ease = options.ease||"linear";			
				this.pastIndex=-1;				
				this.currentIndex =0;
				this.currentPanelIndex =this.isLoop?1:0;			
				this.currentX=-this.currentPanelIndex*this.slideWidth;			
				this.animFrontFunc=function(){
					var i=this.currentIndex;
					if(this.oTab && this.oTab.length){
						this.oTab.removeClass(this.activeClass); 
						this.oTab.eq(i).addClass(this.activeClass);
					}
					
					if(this.showIndicator){					
						var oLI=this.oContainer.find('.t_orders li');
						oLI.removeClass(this.activeClass);					
						oLI.eq(i).addClass(this.activeClass);					
					}
					options.onScrollStart && options.onScrollStart(i);
				};
				this.animEndFunc=function(){
					this.oPanel.removeClass(this.activeClass); 						 
					this.oPanel.eq(this.currentPanelIndex).addClass(this.activeClass);				
					options.onScrollEnd && options.onScrollEnd(this.currentIndex);				
				};	
				this.touchMoveFunc=options.onTouchMove;
				this.handerTransitionEnd=function(e){
					if(e.target!=_this.oPanelParent[0]){return;}				
					_this.animEndFunc.call(_this,_this.currentPanelIndex);
					if(_this.isInPlay){_this.playFunc();}			
				};						
				this.oPanel.eq(this.currentPanelIndex).addClass(this.activeClass);
				this.oPanelParent.css('-webkit-transform','translate3d('+this.currentX+'px,0,0)').css('-webkit-transition-timing-function',this.ease);
				this.oldTime=0;				
				this.moveX=0;//往左移为负值 往右移动为正值			
				this.touch();
				this.showPrevNext=options.showPrevNext;
				this.showIndicator=options.showIndicator;
				this.oPanelParent.bind('webkitTransitionEnd', this.handerTransitionEnd);
				this.iTimer=null;
				this.isPlay=options.isPlay;
				this.stayTime=parseInt(options.stayTime)||2000;					
				this.isInPlay=this.isPlay;
				this.playFunc=function(){clearTimeout(this.iTimer);this.iTimer= setTimeout(function(){_this.goIndex('+1');}, _this.stayTime);}			
				this.isPlay && this.playFunc();
				
				if(this.showIndicator){
					var s='',len=len=this.slideNum-(this.isLoop?2:0);
					for(var i=0;i<len;i++){
						var css=i==0?' class="'+this.activeClass+'"':'';
						s+='<li'+css+'><a>'+(i+1)+'</a></li>';
					}
					var ol = document.createElement('ol');
					ol.classList.add('t_orders');
					ol.innerHTML=s;
					this.oContainer.append(ol);				
				}
						
				if(this.showPrevNext){
					var div = document.createElement('div');
					div.classList.add('t_direction');
					div.innerHTML='<span class="prev">prev</span><span class="next">next</span>';
					this.oContainer.append(div);
					this.oPrev=this.oContainer.find('.prev');
					this.oNext=this.oContainer.find('.next');		
					this.oPrev.bind(START_EV,function(e){e.preventDefault(); _this.goIndex('-1');});
					this.oNext.bind(START_EV,function(e){e.preventDefault();_this.goIndex('+1');});
				} 
			
				if(this.oTab && this.oTab.length){
					var inArray	=function(elem,array){if(array.indexOf){return array.indexOf(elem)}for(var i=0,len=array.length;i<len;i++){if(array[i]===elem){return i}}return-1};				
					this.oTab.bind('click',function(e){e.preventDefault();_this.goIndex(inArray(this, _this.oTab));});
				} 							
			},	
			//← → direction['-1','+1',...] 如果'-1'、'+1'表示往前1张、往后1张, 否则表示跳到指定索引
			goIndex:function(direction, duration){ 
				clearTimeout(this.iTimer);
				
				var panelIndex;
				if(typeof direction === 'string' && direction.indexOf('-')!=-1){//prev
					panelIndex=!this.isLoop?Math.max(this.currentIndex-1,0) : this.currentPanelIndex==0?this.slideNum-3:this.currentPanelIndex-1;			
				}else if(typeof direction === 'string' && direction.indexOf('+')!=-1){//next
					panelIndex=!this.isLoop?Math.min(this.currentIndex+1,this.slideNum-1):this.currentPanelIndex==this.slideNum-1?2:this.currentPanelIndex+1;
				}else{
					panelIndex=direction+(this.isLoop?1:0);
				}
							
				if(this.isLoop && (panelIndex==0 || panelIndex==this.slideNum-1)){
					var oldIndex, x;
					
					if(panelIndex==0){
						oldIndex=this.slideNum-1;
						panelIndex=oldIndex-1;
						x=-oldIndex*this.slideWidth+this.moveX;
					}else{
						oldIndex=0;
						panelIndex=1;
						x=this.moveX;				
					}	
					this.oPanelParent.css('-webkit-transform','translate3d('+x+'px,0,0)').css('-webkit-transition','0ms');
					window.getComputedStyle(this.oPanelParent[0]).zoom;
				}
					
				var length=(-panelIndex/this.slideNum)* 100, duration=duration==undefined?this.duration:duration;
				length = parseInt(length * 100)/100;
				this.currentPanelIndex=panelIndex;
				this.pastIndex=this.currentIndex;
				this.currentIndex=panelIndex-(this.isLoop?1:0);		
				this.currentX = -this.currentPanelIndex*this.slideWidth;	
				this.animFrontFunc(this.currentIndex);			
				this.oPanelParent.css('-webkit-transform','translate3d('+this.currentX+'px,0,0)').css('-webkit-transition-duration',duration);
			},					

			touch: function(){
				var _this=this, identifier, pageX, pageY, isMoved, isHorizontalMove, currX, currY, deltaX, deltaY;
			
				var onTouchStart=function(e){
					if (e.touches.length !== 1) {return;}
					identifier=e.changedTouches[0].identifier;
					pageX=e.pageX;
					pageY=e.pageY;	
					
					this.oldTime=Date.now();//e.timeStamp
					isMoved = false;
					currX = hasTouch ? e.touches[0].pageX : e.pageX;
					currY = hasTouch ? e.touches[0].pageY : e.pageY;
					this.oPanelParent.bind(MOVE_EV, func_MOVE_EV).bind(END_EV, func_END_EV);											
				};
				
				var onTouchMove=function(e){
					var isStartFinger=Math.abs(e.pageX-pageX)<50 && Math.abs(e.pageY-pageY)<50; //是否是初始手指	
					if(!isStartFinger){return;}				
					
					deltaX = (hasTouch ? e.touches[0].pageX : e.pageX) - currX; // 往左滑为负，往右滑为正
					deltaY = (hasTouch ? e.touches[0].pageY : e.pageY) - currY;

					if(!isMoved){
						isMoved = true;
						isHorizontalMove=Math.abs(deltaX) > Math.abs(deltaY);
						isHorizontalMove && e.preventDefault();
					}else{					
						if(isHorizontalMove){
							e.preventDefault();
							var x=deltaX;	

							if((this.currentIndex==0 && deltaX >0)|| (this.currentIndex == this.slideNum-(this.isLoop?3:1) && deltaX<0)){							
								if(!this.isLoop){
									x = Math.min(this.slideWidth/5, Math.abs(x));
									x = !this.bounce?0:this.currentIndex==0?x:-x;
								}else{
									x = Math.min(this.slideWidth, Math.abs(x));
									x = this.currentIndex==0?x:-x;	
								}
							}	
							
							clearTimeout(this.iTimer);						
							this.moveX=x;
							this.oPanelParent.css('-webkit-transform','translate3d('+(this.currentX + x)+'px,0,0)').css('-webkit-transition','0ms');
							this.touchMoveFunc && this.touchMoveFunc(this.currentIndex, this.moveX/this.slideWidth);
						}					
					}
				};
						
				var onTouchEnd=function(e){		
					if(identifier!=e.changedTouches[e.changedTouches.length-1].identifier){return;}
					this.oPanelParent.unbind(MOVE_EV, func_MOVE_EV).unbind(END_EV, func_END_EV);				
					
					if(!isMoved || !isHorizontalMove){return;}

					if(Date.now()-this.oldTime < 300){
						this.goIndex(deltaX>10?'-1':deltaX<-10?'+1':this.currentIndex);
					}else{
						if(Math.abs(this.moveX)/this.slideWidth<0.5){
							this.goIndex(this.currentIndex);
						}else{
							this.goIndex(deltaX>10?'-1':'+1');							
						}					
					}
				};

				var func_START_EV=function(e){onTouchStart.call(_this,e);}, func_MOVE_EV=function(e){onTouchMove.call(_this,e);}, func_END_EV=function(e){onTouchEnd.call(_this,e);};							
				this.oPanelParent.bind(START_EV, func_START_EV);
			}			
		};
		
		o.init(options);	
		
		return {
			num 			: o.slideNum,
			width			: this.slideWidth,
			moveX			: function(){return o.moveX;},
			goIndex			: function(direction, duration){o.goIndex(direction, duration);},
			getPastIndex 	: function(){return o.pastIndex;},			
			getCurrentIndex : function(){return o.currentIndex;},
			
			start			: function(){if(!o.isPlay){return;}o.isInPlay=true;o.playFunc();},
			pause			: function(){if(!o.isPlay){return;}o.isInPlay=false;clearTimeout(o.iTimer);},
			go				: function(){if(!o.isPlay){return;}o.isInPlay=true;o.playFunc();},
			stop			: function(){if(!o.isPlay){return;}o.isInPlay=false;clearTimeout(o.iTimer);o.goIndex(1,0);}		
		};		
	}	
});


