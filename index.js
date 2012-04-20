/**
 * @license RequireJS domReady 1.0.0 Copyright (c) 2010-2011, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/requirejs for details
 */
define("domReady",[],function(){function i(a){for(var b=0,d;d=a[b];b++)d(c)}function j(){var a=d,c=e;b&&(a.length&&(d=[],i(a)),f.resourcesDone&&c.length&&(e=[],i(c)))}function k(){b||(b=!0,h&&clearInterval(h),j())}function l(a){return b?a(c):d.push(a),l}var a=typeof window!="undefined"&&window.document,b=!a,c=a?document:null,d=[],e=[],f=requirejs||require||{},g=f.resourcesReady,h;return"resourcesReady"in f&&(f.resourcesReady=function(a){g&&g(a),a&&j()}),a&&(document.addEventListener?(document.addEventListener("DOMContentLoaded",k,!1),window.addEventListener("load",k,!1)):window.attachEvent&&(window.attachEvent("onload",k),self===self.top&&(h=setInterval(function(){try{document.body&&(document.documentElement.doScroll("left"),k())}catch(a){}},30))),document.readyState==="complete"&&k()),l.withResources=function(a){return b&&f.resourcesDone?a(c):e.push(a),l},l.version="1.0.0",l.load=function(a,b,c,d){d.isBuild?c(null):l(c)},l}),define("src/dom",[],function(){var a=function(a){var b=[[["charset","UTF-8"]],[["name","viewport"],["content","width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"]],[["name","apple-mobile-web-app-capable"],["content","yes"]],[["name","apple-mobile-web-app-status-bar-style"],["content","black"]]],c=a.getElementsByTagName("meta"),d,e,f;for(d=0;d<b.length;d++){var g=b[d],h=!1;for(e=0;e<c.length&&!h;e++){var i=c[e],j=!0;for(f=0;f<g.length&&j;f++){var k=g[f][0],l=g[f][1];i.getAttribute(k)!==l&&(j=!1)}j&&(h=!0)}if(h)continue;var m=a.createElement("meta");for(f=0;f<g.length;f++)m.setAttribute(g[f][0],g[f][1]);a.head.appendChild(m)}},b=function(a,b){a.document.title=b},c=function(a){var b=a.document,c=document.createElement("canvas");c.id="ncolors",c.style.position="absolute",c.style.left="0px",c.style.top="0px",c.style.right="0px",c.style.bottom="0px",document.body.appendChild(c);var d=function(b){var d=a.innerWidth,e=a.innerHeight,f=a.devicePixelRatio||1;c.width=d*f,c.height=e*f,console.log("Resizing canvas",d,e,f),c.resizeHandler&&c.resizeHandler()};return a.addEventListener("resize",d,!1),d(),c},d=function(d){return a(d.document),b(d,"Colors for Nell"),c(d)},e=function(d){var e=d.open("","_blank");return a(e),b(e,"Colors for Nell"),c(e)};return{insertMeta:a,new_canvas:function(){return e(window)},set_title:function(a,b){a.ownerDocument.title=b},get_title:function(a){return a.ownerDocument.title}}}),define("hammer",[],function(){return function(b,c,d){function x(a){return a.touches?a.touches.length:1}function y(a){a=a||window.event;if(!a.touches){var b=document,c=b.body;return[{x:a.pageX||a.clientX+(b&&b.scrollLeft||c&&c.scrollLeft||0)-(b&&b.clientLeft||c&&b.clientLeft||0),y:a.pageY||a.clientY+(b&&b.scrollTop||c&&c.scrollTop||0)-(b&&b.clientTop||c&&b.clientTop||0)}]}var d=[],e;for(var f=0,g=a.touches.length;f<g;f++)e=a.touches[f],d.push({x:e.pageX,y:e.pageY});return d}function z(a,b){return Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI}function A(a,b){b.touches=y(b.originalEvent),b.type=a,H(e["on"+a])&&e["on"+a].call(e,b)}function B(a){a=a||window.event,a.preventDefault?a.preventDefault():(a.returnValue=!1,a.cancelBubble=!0)}function C(){j={},l=!1,k=0,g=0,h=0,m=null}function E(a){switch(a.type){case"mousedown":case"touchstart":j.start=y(a),o=(new Date).getTime(),k=x(a),l=!0,u=a;var d=b.getBoundingClientRect(),e=b.clientTop||document.body.clientTop||0,f=b.clientLeft||document.body.clientLeft||0,p=window.pageYOffset||b.scrollTop||document.body.scrollTop,q=window.pageXOffset||b.scrollLeft||document.body.scrollLeft;s={top:d.top+p-e,left:d.left+q-f},t=!0,D.hold(a),c.prevent_default&&B(a);break;case"mousemove":case"touchmove":if(!t)return!1;v=a,j.move=y(a),D.transform(a)||D.drag(a);break;case"mouseup":case"mouseout":case"touchcancel":case"touchend":if(!t||m!="transform"&&a.touches&&a.touches.length>0)return!1;t=!1,w=a,m=="drag"?A("dragend",{originalEvent:a,direction:i,distance:g,angle:h}):m=="transform"?A("transformend",{originalEvent:a,position:j.center,scale:a.scale,rotation:a.rotation}):D.tap(u),n=m,C()}}function F(a,b){!b&&window.event&&window.event.toElement&&(b=window.event.toElement);if(a===b)return!0;if(b){var c=b.parentNode;while(c!==null){if(c===a)return!0;c=c.parentNode}}return!1}function G(a,b){var c={};if(!b)return a;for(var d in a)d in b?c[d]=b[d]:c[d]=a[d];return c}function H(a){return Object.prototype.toString.call(a)=="[object Function]"}var e=this,f={prevent_default:!1,css_hacks:!0,drag:!0,drag_vertical:!0,drag_horizontal:!0,drag_min_distance:20,transform:!0,scale_treshold:.1,rotation_treshold:15,tap:!0,tap_double:!0,tap_max_interval:300,tap_double_distance:20,hold:!0,hold_timeout:500};c=G(f,c),function(){if(!c.css_hacks)return!1;var a=["webkit","moz","ms","o",""],d={userSelect:"none",touchCallout:"none",userDrag:"none",tapHighlightColor:"rgba(0,0,0,0)"},e="";for(var f=0;f<a.length;f++)for(var g in d)e=g,a[f]&&(e=a[f]+e.substring(0,1).toUpperCase()+e.substring(1)),b.style[e]=d[g]}();var g=0,h=0,i=0,j={},k=0,l=!1,m=null,n=null,o=null,p={x:0,y:0},q=null,r=null,s={},t=!1,u,v,w;this.getDirectionFromAngle=function(a){var b={down:a>=45&&a<135,left:a>=135||a<=-135,up:a<-45&&a>-135,right:a>=-45&&a<=45},c,d;for(d in b)if(b[d]){c=d;break}return c};var D={hold:function(a){c.hold&&(m="hold",clearTimeout(r),r=setTimeout(function(){m=="hold"&&A("hold",{originalEvent:a,position:j.start})},c.hold_timeout))},drag:function(a){var b=j.move[0].x-j.start[0].x,d=j.move[0].y-j.start[0].y;g=Math.sqrt(b*b+d*d);if(c.drag&&g>c.drag_min_distance||m=="drag"){h=z(j.start[0],j.move[0]),i=e.getDirectionFromAngle(h);var f=i=="up"||i=="down";if((f&&!c.drag_vertical||!f&&!c.drag_horizontal)&&g>c.drag_min_distance)return;m="drag";var k={x:j.move[0].x-s.left,y:j.move[0].y-s.top},n={originalEvent:a,position:k,direction:i,distance:g,distanceX:b,distanceY:d,angle:h};l&&(A("dragstart",n),l=!1),A("drag",n),B(a)}},transform:function(a){if(c.transform){var b=a.scale||1,d=a.rotation||0;if(x(a)!=2)return!1;if(m!="drag"&&(m=="transform"||Math.abs(1-b)>c.scale_treshold||Math.abs(d)>c.rotation_treshold)){m="transform",j.center={x:(j.move[0].x+j.move[1].x)/2-s.left,y:(j.move[0].y+j.move[1].y)/2-s.top};var e={originalEvent:a,position:j.center,scale:b,rotation:d};return l&&(A("transformstart",e),l=!1),A("transform",e),B(a),!0}}return!1},tap:function(a){var b=(new Date).getTime(),d=b-o;if(c.hold&&!(c.hold&&c.hold_timeout>d))return;var e=function(){if(p&&c.tap_double&&n=="tap"&&o-q<c.tap_max_interval){var a=Math.abs(p[0].x-j.start[0].x),b=Math.abs(p[0].y-j.start[0].y);return p&&j.start&&Math.max(a,b)<c.tap_double_distance}return!1}();e?(m="double_tap",q=null,A("doubletap",{originalEvent:a,position:j.start}),B(a)):(m="tap",q=b,p=j.start,c.tap&&(A("tap",{originalEvent:a,position:j.start}),B(a)))}};"ontouchstart"in window?(b.addEventListener("touchstart",E,!1),b.addEventListener("touchmove",E,!1),b.addEventListener("touchend",E,!1),b.addEventListener("touchcancel",E,!1)):b.addEventListener?(b.addEventListener("mouseout",function(a){F(b,a.relatedTarget)||E(a)},!1),b.addEventListener("mouseup",E,!1),b.addEventListener("mousedown",E,!1),b.addEventListener("mousemove",E,!1)):document.attachEvent&&(b.attachEvent("onmouseout",function(a){F(b,a.relatedTarget)||E(a)},!1),b.attachEvent("onmouseup",E),b.attachEvent("onmousedown",E),b.attachEvent("onmousemove",E))}}),define("index",["domReady!","./src/dom","./hammer"],function(a,b,c){b.insertMeta(a);var d=a.createElement("iframe"),e=null,f=function(a){if(!e)return;e.postMessage(JSON.stringify(a))},g=function(a){var b=a.data;typeof b=="string"&&(b=JSON.parse(b));switch(b.type){case"brush":console.log("Brush update",b);break;default:console.warn("Unexpected parent toolbar message",a)}},h=function(a){var b=a.data;typeof b=="string"&&(b=JSON.parse(b));switch(b.type){case"toolbar":return e.dispatchEvent({data:b.msg});case"childReady":console.assert(a.source===d.contentWindow),a.ports&&a.ports.length>0?(e=a.ports[0],e.addEventListener("message",g,!1),e.start()):(console.log("Using emulated MessageChannel"),e={dispatchEvent:function(a){g(a)},postMessage:function(b){var c={type:"toolbar",msg:b};a.source.postMessage(JSON.stringify(c),a.origin)}});break;default:console.warn("Unexpected parent message",a)}};window.addEventListener("message",h,!1);var i=a.getElementById("wrapper"),j=a.getElementById("loading");i.removeChild(j),d.appendChild(j),d.id="inner",d.scrolling="no",d.src="ncolors.html",i.appendChild(d);var k=a.getElementById("toolbarButtons"),l=function(b){var d=a.createElement("span");d.className="icon "+b,k.appendChild(d);var e=new c(d,{prevent_default:!0,drag:!1,transform:!1});return e.ontap=function(){f({type:b+"Button"})},d},m=l("undo"),n=l("redo"),o=l("hard"),p=l("soft"),q=function(b){var c=a.createElement("span");c.className="swatch "+b;var d=a.createElement("span");return c.appendChild(d),k.appendChild(c),c},r=["red","orange","yellow","green","blue","indigo","violet","white","black"],s=r.map(function(a){return q(a)});s.forEach(function(a,b){var d=r[b],e=new c(a,{prevent_default:!0,drag:!1,transform:!1});e.ontap=function(){f({type:"swatchButton",color:d})}});var t=function(b,c,d,e,g){var h=a.createElement("input");return h.type="range",h.id=b,h.min=c,h.max=d,h.step=g,h.value=e,k.appendChild(h),h.addEventListener("change",function(){f({type:b+"Slider",value:h.value})},!1),h},u=t("size",1,40,20,1),v=t("opacity",0,1,.7,"any"),w=function(){var b=a.querySelectorAll(".swatch > span");Array.prototype.forEach.call(b,function(a){a.style.opacity=v.value})};v.addEventListener("change",w,!1),w();var x=a.getElementById("toolbar")})