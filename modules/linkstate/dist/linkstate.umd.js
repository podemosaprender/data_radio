!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define(e):t.linkState=e()}(this,function(){function t(t,e,n,o){for(o=0,e=e.split?e.split("."):e;t&&o<e.length;)t=t[e[o++]];return void 0===t?n:t}function e(e,n,o){var i=n.split("."),f=e.__lsc||(e.__lsc={});return f[n+o]||(f[n+o]=function(n){for(var f=n&&n.target||this,r={},c=r,u="string"==typeof o?t(n,o):f.nodeName?f.type.match(/^che|rad/)?f.checked:f.value:n,d=0;d<i.length-1;d++)c=c[i[d]]||(c[i[d]]=!d&&e.state[i[d]]||{});c[i[d]]=u,e.setState(r)})}return e});
//# sourceMappingURL=linkstate.umd.js.map