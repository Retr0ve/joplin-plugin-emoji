// Generic utilities
var elt = function(tagname, cls, name /*, ... elts*/) {
var e = document.createElement(tagname);
if (cls) e.className = cls;
if (name) e.setAttribute("name", name);
for (var i = 3; i < arguments.length; ++i) {
    var elt = arguments[i];
    if (typeof elt == "string") elt = document.createTextNode(elt);
    e.appendChild(elt);
}
return e;
}


module.exports = elt;