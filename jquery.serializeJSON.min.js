/*!
  SerializeJSON jQuery plugin.
  https://github.com/marioizquierdo/jquery.serializeJSON
  version 1.1.1 (Feb 16, 2014)

  Copyright (c) 2012 Mario Izquierdo
  Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
  and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
*/
(function(c){c.fn.serializeJSON=function(){var e,d;e={};d=this.serializeArray();c.each(d,function(h,f){var g,k,j;g=f.name;k=f.value;j=c.map(g.split("["),function(i){var l;l=i[i.length-1];return l==="]"?i.substring(0,i.length-1):i});if(j[0]===""){j.shift()}c.deepSet(e,j,k)});return e};var a=function(d){return d===Object(d)};var b=function(d){return/^[0-9]+$/.test(String(d))};c.deepSet=function(d,l,i){var j,h,f,g,k,e;if(!l||l.length===0){throw new Error("ArgumentError: keys param expected to be an array with least one key")}j=l[0];if(l.length==1){if(j===""){d.push(i)}else{d[j]=i}}else{h=l[1];if(j===""){k=d.length-1;e=d[d.length-1];if(a(e)&&!e[h]){j=k}else{d.push({});j=k+1}}if(d[j]===undefined){if(h===""||b(h)){d[j]=[]}else{d[j]={}}}f=l.slice(1);c.deepSet(d[j],f,i)}}}(jQuery));