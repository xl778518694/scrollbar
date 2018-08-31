(function (global) {
    global = global || this || (0, eval)("this");
    if (!Function.prototype.bind) {
        Function.prototype.bind = function (toThis) {
            if (typeof this !== "function") throw new Error("bind方法只能在function对象上调用");
            var args = Array.prototype.slice.call(arguments, 1),
                fromThis = this,
                tempFunc = function () {
                }, funcBound = function () {
                    return fromThis.apply(this instanceof tempFunc && toThis ? this : toThis,
                        args.concat(Array.prototype.slice.call(arguments, 1)));
                };
            tempFunc.prototype = this.prototype;
            funcBound.prototype = new tempFunc();
            return funcBound;
        }
    }
    var args = {
        // 滚动条方向[x|y(default)]
        "direction": "y",
        // 滚动条位置, 当direction=x时，[t|b(default)];当direction=y时，[l|r(default)]
        "position": "r",
        // 滚动条圆角弧度, px或百分比均可；
        "borderRadius": "5px",
        // 外部滚动条的横轴长度；
        "crossAxisLength": "6px",
        "innerCrossAxisLength": "6px",
        // 外部滚动条的主轴长度（百分比）；
        "minAxisPercent": "90%",
        // 离开target对象是否自动隐藏滚动条，默认为false，只有设置true（boolean）类型才会生效；
        "visibleOnlyWhenHover": false,
        // 透明度
        "opacity": ".6",
        // 外部滚动条的颜色
        "outerColor": "#ffe7ba",
        // 内部滚动块的颜色
        "innerColor": "#d46b08",
        "_scroll": 0,
        "_client": 0,
        "_startX": 0,
        "_startY": 0,
    }, prop, prototype = {
        "init": function (props) {
            var prop, isDom;
            for (prop in props) {
                if (props.hasOwnProperty(prop)) this[prop] = props[prop];
            }

            if ("string" === typeof this.target) this.target = document.querySelector(this.target);

            // 判断target是否为dom对象
            isDom = (typeof HTMLElement === 'object') ?
                this.target instanceof HTMLElement :
                this.target && typeof this.target === 'object' && this.target.nodeType === 1 && typeof this.target.nodeName === 'string';

            if (false === isDom) {
                throw new Error("target属性必需为element对象或者element对象对应的选择器；(target must be element or element selector. )");
            }

            this.opacity = "" + this.opacity;
            this.direction = this.direction.toLowerCase();
            this.position = this.position.toLowerCase();
            if (true !== this.visibleOnlyWhenHover) this.visibleOnlyWhenHover = false;
            if ("y" === this.direction) {
                if ("l" !== this.position) this.position = "r";
            } else {
                this.direction = "x";
                if ("t" !== this.position) this.position = "b";
            }
            this.create();
            this.listen();
        },
        "listen": function () {
            this.listenContentChange();
            this.listenScroll();
            this.listenTargetHover();
            this.listenDragScrollbar();
        },
        "listenScroll": function () {
            var _this = this, scrollEvent = function (ev) {
                ev = ev || window.event;
                var offset = 0, scroll;

                if (ev.wheelDelta) offset = ev.wheelDelta;
                else offset = -ev.detail * 40;

                if ("x" !== _this.direction) {
                    scroll = _this.getScroll(["scrollTop"]);
                    scroll.scrollTop -= offset;
                } else {
                    scroll = _this.getScroll(["scrollLeft"]);
                    scroll.scrollLeft -= offset;
                }
                _this.setScroll(scroll);
                return false;
            };
            Scrollbar.addEvent(this.target, 'mousewheel', scrollEvent);
            Scrollbar.addEvent(this.target, 'DOMMouseScroll', scrollEvent);
        },
        "listenContentChange": function () {
            var MutationObserver = window.MutationObserver || window.WebkitMutationObserver || window.MozMutationObserver;
            if (!!MutationObserver) {
                var mo = new MutationObserver(this.checkContentChange.bind(this));
                mo.observe(this.target, {'childList': true, 'subtree': true});
            } else {
                setInterval(this.checkContentChange.bind(this), 1000);
            }
        },
        "listenDragScrollbar": function () {
            var mouseMoveCallback = (function (ev) {
                ev = ev || window.Event;
                var x = ev.x || ev.pageX,
                    y = ev.y || ev.pageY, scroll;
                if ("x" === this.direction) {
                    scroll = this.getScroll(["scrollLeft"]);
                    scroll.scrollLeft += (x - this._startX) / this.scrollbar.clientWidth * this._scroll;
                } else {
                    scroll = this.getScroll(["scrollTop"]);
                    scroll.scrollTop += (y - this._startY) / this.scrollbar.clientHeight * this._scroll
                }
                this.setScroll(scroll);
                this._startX = x;
                this._startY = y;
            }).bind(this);
            var mouseMoveEndCallback = (function () {
                this.scrollbarInner["onmousemove"] = null;
                this.scrollbarInner["onmouseup"] = null;
            }).bind(this);

            this.scrollbarInner["onmousedown"] = (function (ev) {
                ev = ev || window.Event;
                this._startX = ev.x || ev.pageX;
                this._startY = ev.y || ev.pageY;
                this.scrollbarInner["onmousemove"] = mouseMoveCallback;
                this.scrollbarInner["onmouseup"] = mouseMoveEndCallback;
            }).bind(this);

            this.scrollbarInner["onmouseout"] = mouseMoveEndCallback;
        },
        "listenTargetHover": function () {
            if (true === this.visibleOnlyWhenHover) {
                Scrollbar.addEvent(this.target, "mouseover", (function () {
                    this.scrollbar.style.transform = "scale(1)";
                    this.scrollbar.style.opacity = this.opacity;
                    this.scrollbar.style.filter = "alpha(opacity:" + parseInt(this.opacity) * 100 + ")";
                    this.scrollbarInner.style.filter = "alpha(opacity:" + parseInt(this.opacity) * 100 + ")";
                }).bind(this));
                Scrollbar.addEvent(this.target, "mouseout", (function () {
                    this.scrollbar.style.transform = "scale(.001)";
                    this.scrollbar.style.opacity = "0";
                    this.scrollbarInner.style.filter = "alpha(opacity:0)";
                    this.scrollbar.style.filter = "alpha(opacity:0)";
                }).bind(this));
            }
        },
        "checkContentChange": function () {
            if (this._scroll !== this.getDocumentMainLength() || this._client !== this.getClient()) {
                this.dealPosition();
            }
        },
        "getDocumentMainLength": function () {
            return "y" === this.direction ? this.getScroll(["scrollHeight"]).scrollHeight : this.getScroll(["scrollWidth"]).scrollWidth;
        },
        "getClient": function () {
            return "y" === this.direction ? this.getScroll(["clientHeight"]).clientHeight : this.getScroll(["clientWidth"]).clientWidth;
        },
        "getScroll": function (scrollArr) {
            var dom = this.target, i = 0, result = {};
            scrollArr = scrollArr || ["scrollTop", "scrollLeft", "scrollHeight", "scrollWidth", "clientHeight", "clientWidth"];
            for (; i < scrollArr.length; i++)
                result[scrollArr[i]] = dom.tagName === "BODY" ? document.documentElement[scrollArr[i]] || document.body[scrollArr[i]] : dom[scrollArr[i]];
            return result;
        },
        "setScroll": function (props) {
            var dom = this.target, prop, offset, scrollDirection = "scrollTop", styleAttr = "top";
            this.checkContentChange();
            // 设置内容滚动位置
            for (prop in {"scrollTop": "", "scrollLeft": ""}) {
                if (props.hasOwnProperty(prop)) {
                    props[prop] = Math.max(0, props[prop]);
                    props[prop] = Math.min(this._scroll - this._client, props[prop]);
                    if (dom.tagName === "BODY") document.documentElement[prop] = props[prop];
                    else dom[prop] = props[prop];
                }
            }

            if ("x" === this.direction) {
                scrollDirection = "scrollLeft";
                styleAttr = "left";
            }
            // 设置滚动条位置，防止滚动条随文档内容滚动；
            offset = (props[scrollDirection] + (100 - parseInt(this.minAxisPercent)) * this._client / 200) + "px";
            this.scrollbar.style[styleAttr] = offset;

            offset = (props[scrollDirection] / this._scroll * 100) + "%";
            this.scrollbarInner.style[styleAttr] = offset;
        },
        "dealPosition": function () {
            this._scroll = this.getDocumentMainLength();
            this._client = this.getClient();
            if (this._client >= this._scroll) this.scrollbar.style.display = "none";
            this.innerminAxisPercent = (this._client / this._scroll * 100) + "%";
            if ("y" === this.direction) this.scrollbarInner.style.height = this.innerminAxisPercent;
            else this.scrollbarInner.style.width = this.innerminAxisPercent;
            this.setScroll(this.getScroll(["scrollTop", "scrollLeft"]));
        },
        "create": function () {
            if (this.target.tagName !== "BODY" && this.target.tagName !== "HTML" &&
                "static" === (window.getComputedStyle ? window.getComputedStyle(this.target).position : this.target.currentStyle.position)) {
                this.target.style.position = "relative";
            }
            this.target.style["overflow" + this.direction.toUpperCase()] = "hidden";
            this.createOuter();
            this.createInner();
            this.target.appendChild(this.scrollbar);
            this.scrollbar.appendChild(this.scrollbarInner);
            this.dealPosition();
        },
        "createOuter": function () {
            this.scrollbar.className = "_scrollbar";
            this.scrollbar.style.position = "absolute";
            if (true === this.visibleOnlyWhenHover) {
                this.scrollbar.style.transform = "scale(.001)";
                this.scrollbar.style.opacity = "0";
                this.scrollbar.style.filter = "alpha(opacity:0)";
                this.scrollbarInner.style.filter = "alpha(opacity:0)";
                this.scrollbar.style.transition = "transform .3s";
            } else {
                this.scrollbar.style.transform = "scale(1)";
                this.scrollbar.style.filter = "alpha(opacity:" + parseInt(this.opacity) * 100 + ")";
                this.scrollbarInner.style.filter = "alpha(opacity:" + parseInt(this.opacity) * 100 + ")";
                this.scrollbar.style.opacity = this.opacity;
            }
            this.scrollbar.style.display = "block";
            if ("r" === this.position) this.scrollbar.style.right = "3px";
            else if ("l" === this.position) this.scrollbar.style.left = "3px";
            else if ("t" === this.position) this.scrollbar.style.top = "3px";
            else this.scrollbar.style.bottom = "3px";
            // 设置滚动条的主轴和侧轴的长度；
            if ("x" === this.direction) {
                this.scrollbar.style.width = this.minAxisPercent;
                this.scrollbar.style.height = this.crossAxisLength;
            } else {
                this.scrollbar.style.height = this.minAxisPercent;
                this.scrollbar.style.width = this.crossAxisLength;
            }
            this.scrollbar.style.backgroundColor = this.outerColor;
            this.scrollbar.style.border = "0 none";
            this.scrollbar.style.borderRadius = this.borderRadius;
            this.scrollbar.style.boxSizing = "border-box";
        },
        "createInner": function () {
            this.scrollbarInner.className = "_scrollbar_inner";
            this.scrollbarInner.style.display = "block";
            this.scrollbarInner.style.position = "absolute";
            this.scrollbarInner.style.boxSizing = "border-box";
            this.scrollbarInner.style.cursor = "pointer";
            // 设置滚动块的侧轴长度；
            var crossAxisOffset = -1 * parseInt(this.innerCrossAxisLength) / 2 + "px";
            if ("x" === this.direction) {
                this.scrollbarInner.style.height = this.innerCrossAxisLength;
                this.scrollbarInner.style.top = "50%";
                this.scrollbarInner.style.marginTop = crossAxisOffset;
            } else {
                this.scrollbarInner.style.left = "50%";
                this.scrollbarInner.style.marginLeft = crossAxisOffset;
                this.scrollbarInner.style.width = this.innerCrossAxisLength;
            }
            this.scrollbarInner.style.backgroundColor = this.innerColor;
            this.scrollbarInner.style.border = "0 none";
            this.scrollbarInner.style.borderRadius = this.borderRadius;
        }
    };

    function Scrollbar() {
        for (prop in args) {
            this[prop] = args[prop];
        }
        this.target = document.body;
        this.scrollbarInner = document.createElement("span");
        this.scrollbar = document.createElement("span");
        this.init.apply(this, arguments);
    }

    for (prop in prototype) {
        Scrollbar.prototype[prop] = prototype[prop];
    }
    Scrollbar.addEvent = (function () {
        if (document.addEventListener) {
            return function (element, type, handler) {
                element.addEventListener(type, handler, false);
            }
        } else if (document.attachEvent) {
            return function (element, type, handler) {
                element.attachEvent('on' + type, handler);
            }
        } else {
            return function (element, type, handler) {
                element['on' + type] = handler;
            }
        }
    })();
    Scrollbar.removeEvent = (function () {
        if (document.removeEventListener) {
            return function (element, type, handler) {
                element.removeEventListener(type, handler, false);
            }
        } else if (document.detachEvent) {
            return function (element, type, handler) {
                element.detachEvent('on' + type, handler);
            }
        } else {
            return function (element, type, handler) {
                element['on' + type] = null;
            }
        }
    })();
    global.Scrollbar = Scrollbar;
})(window);
