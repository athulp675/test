var ZSDKUtil = function (c) {
    function f() { } function g(a) { var b = {}; a = a || window.location.href; return a.substr(a.indexOf("?") + 1).split("\x26").forEach(function (a) { a = a.split("\x3d"); b[a[0]] = a[1] }), b.hasOwnProperty("serviceOrigin") && (b.serviceOrigin = decodeURIComponent(b.serviceOrigin)), b } var e, a = g(); return f.prototype.Info = function () { (c.isDevMode() || c.isLogEnabled()) && console.info.apply(console, arguments) }, f.prototype.Error = console.error, c.GetQueryParams = g, c.isDevMode = function () { return a && a.isDevMode }, c.isLogEnabled =
        function () { return a && a.isLogEnabled }, c.getLogger = function () { return e && e instanceof f || (e = new f), e }, c
}(window.ZSDKUtil || {}), ZSDKMessageManager = function (c) {
    function f(b) {
        try { var e = "string" == typeof b.data ? JSON.parse(b.data) : b.data } catch (u) { e = b.data } var c = e.type; try {
            var f; if (!(f = "__REGISTER__" === c)) { var k = b.source, r = b.origin; f = !(!h.isRegistered() || n !== k || v !== r) || Error("Un-Authorized Message.") } if (f) switch (c) {
                case "__REGISTER__": b = e; n = window.parent; v = w.serviceOrigin; h.dcType = window.location.origin.split(".").pop().toUpperCase();
                    "COM" === h.dcType && (h.dcType = "US"); h.key = b.uniqueID; h.parentWindow = n; h._isRegistered = !0; d({ type: "__REGISTER__", widgetOrigin: p(), uniqueID: h.key }, h); a(h, "Load", b.data); break; case "__EVENT_RESPONSE__": var m = e.promiseID, q = e.data, t = e.isSuccess; l.hasOwnProperty(m) && (t ? l[m].resolve(q) : l[m].reject(q), l[m] = void 0, delete l[m]); break; default: g(b, e)
            }
        } catch (u) { x.Error("[SDK.MessageHandler] \x3d\x3e ", u.stack) }
    } function g(b, d) {
        var c = d.widgetID; b = d.eventName; if (h.key === c) var f = a(h, b, d.data); else {
            var k = h._childWidgets[c];
            k && (f = a(k, b, d.data))
        } if (d.isPromise) { var g = {}; Promise.all(f).then(function (b) { g.response = b; g.widgetID = c; g.sourceWidgetID = h.key; e(d, g) }).catch(function (b) { g.response = b; g.widgetID = c; g.sourceWidgetID = h.key; e(d, g) }) }
    } function e(b, a) { d({ type: "__EVENT_RESPONSE__", widgetOrigin: p(), uniqueID: h.key, eventName: b.eventName, data: a, promiseID: b.promiseID }, h) } function a(b, a, d) {
        a = b.eventHandlers[a]; var e = []; if (Array.isArray(a)) for (var c = 0; c < a.length; c++) {
            try {
                var f = a[c].call(b, d); var k = f instanceof Promise ? f.then(function (b) {
                    return {
                        isSuccess: !0,
                        response: b
                    }
                }).catch(function (b) { return { isSuccess: !1, response: b } }) : { isSuccess: !0, response: f }
            } catch (q) { k = { isSuccess: !1, response: q } } e.push(k)
        } return e
    } function d(a, d) { var e, c = a.isPromise; if (c && (e = "Promise" + t++, a.promiseID = e), d && (a.uniqueID = (d.parentWidget || d).key, a.widgetID = d.key), a.time = (new Date).getTime(), r(a), c) return b(e) } function b(b) { return new Promise(function (a, d) { l[b] = { resolve: a, reject: d, time: (new Date).getTime() } }) } function k() { r({ type: "__DEREGISTER__", uniqueID: h.key }) } function r(b) {
        if ("object" ==
            typeof b && (b.widgetOrigin = encodeURIComponent(p())), !n) throw Error("Parentwindow reference not found."); n.postMessage(b, w.serviceOrigin)
    } function p() { return window.location.protocol + "//" + window.location.host + window.location.pathname } var h, n, v, x = ZSDKUtil.getLogger(), t = 100, l = {}, w = ZSDKUtil.GetQueryParams(); return c.Init = function (b) { h = b; window.addEventListener("message", f); window.addEventListener("unload", k) }, c.SendEvent = d, c
}(window.ZSDKMessageManager || {});
window.ZSDK = function () {
    function c(e) { this.serviceOrigin = e.serviceOrigin || g.serviceOrigin; this.parentWidget = e.parentWidget; this.key = e.key; this._isRegistered = !1; this._childWidgets = {}; this.eventHandlers = Object.create(null); this.meta } var f, g = ZSDKUtil.GetQueryParams(); return c.prototype.on = function (e, a) {
        if ("string" != typeof e) throw Error("Invalid eventname parameter passed."); if ("function" != typeof a) throw Error("Invalid function parameter passed."); var d = this.eventHandlers[e]; if (Array.isArray(d) || (this.eventHandlers[e] =
            d = []), d.push(a), "Load" !== e) { var b = { type: "__EVENT_BIND__", eventName: e, count: d.length }; this.parentWidget && !this.parentWidget.isRegistered() || !this.parentWidget && !this.isRegistered() ? (this.parentWidget || this).on("Load", function () { ZSDKMessageManager.SendEvent(b, this) }) : ZSDKMessageManager.SendEvent(b, this) }
    }, c.prototype.off = function (e, a) {
        if ("string" != typeof e) throw Error("Invalid eventname parameter passed."); if ("function" != typeof a) throw Error("Invalid function parameter passed."); e = this.eventHandlers[e];
        if (Array.isArray(e)) { var d, b = []; for (d = 0; d < e.length; d++)e[d] === a && b.push(d); for (; b.length;)e.splice(b.pop(), 1) }
    }, c.prototype._sendEvent = function (e, a, d) { return ZSDKMessageManager.SendEvent({ type: "__EVENT__", eventName: e, data: a, isPromise: d }, this) }, c.prototype.emit = function (e, a) { ZSDKMessageManager.SendEvent({ type: "__EMIT__", eventName: e, data: a }, this) }, c.prototype.isRegistered = function () { return this._isRegistered }, c.prototype.fetch = function (e) {
        return ZSDKMessageManager.SendEvent({
            eventName: "__HTTP__", isPromise: !0,
            options: e
        }, this)
    }, c.prototype.createInstance = function (e) { return ZSDKMessageManager.SendEvent({ eventName: "__CREATE_INSTANCE__", isPromise: !0, options: e }, this) }, c.prototype.modal = function (e) { return "object" == typeof e && (e.location = "__MODAL__"), this.createInstance(e) }, c.prototype.getWidgets = function () { return ZSDKMessageManager.SendEvent({ eventName: "__WIDGETS_INFO__", isPromise: !0 }, this) }, c.prototype.getWidgetInstance = function (e) {
        if ("string" != typeof e) throw Error("Invalid WidgetID passed"); if (this.parentWidget) return this.parentWidget.getWidgetInstance(e);
        var a = this._childWidgets[e]; return a || (this._childWidgets[e] = a = new c({ key: e, parentWidget: this })), a
    }, c.prototype.getFileObject = function (e) { return new File([e.slice(0, e.size)], e.name, { type: e.type }) }, { Init: function () { return f || (f = new c({ serviceOrigin: g.serviceOrigin }), ZSDKMessageManager.Init(f), f) }, _getRootInstance: function () { return f } }
}();
window.SigmaSDK = function () {
    function c(b) { this._serviceName = b } var f, g = function () { if (!f.isRegistered()) throw Error("App not registered."); }, e = function (b, a) { return f._sendEvent("SIGMA_" + b + "_EVENT", a, !0) }, a = function (b, a) { return Promise.reject({ type: b, message: a }) }; c.prototype.isRegistered = function () { return f.isRegistered() }; c.prototype.context = function () { return g(), f }; c.prototype.createWidget = function (b) { return g(), f.createInstance(b) }; c.prototype.getWidget = function (b) { return f.getWidgetInstance(b) }; c.prototype.widgetsMeta =
        function () { return g(), f.getWidgets() }; c.prototype.on = function (b, a) { return f.on(b, a) }; c.prototype.off = function (b, a) { return f.off(b, a) }; c.prototype.trigger = function (b, a) { return g(), f.emit(b, a) }; c.prototype.modal = function (b) { return g(), f.modal(b) }; c.prototype.fetch = function (b) { return g(), f.fetch(b) }; c.prototype.get = function (b) {
            if (g(), "string" != typeof b && !Array.isArray(b)) return a("VALIDATION_ERROR", "The get method accepts String or Array of Strings only."); b = "string" == typeof b ? [b] : b; return 0 >= b.length ?
                a("VALIDATION_ERROR", "The get method should not accept empty Array of Strings.") : e(this._serviceName, { event_type: "get", properties: b })
        }; c.prototype.getAll = function (b, d) { return (g(), "string" != typeof b) ? a("VALIDATION_ERROR", "The getAll method accepts module_name as String only.") : e(this._serviceName, { event_type: "get_all", module_name: b, options: d }) }; c.prototype.set = function (b, d) {
            if (g(), "string" != typeof b && "object" != typeof b && Array.isArray(b)) return a("VALIDATION_ERROR", "The set method accepts key-value pair or Object of key-value pairs only.");
            var c; return ("string" == typeof b ? (c = {}, c[b] = d) : c = b, 0 >= c.keys.length) ? a("VALIDATION_ERROR", "The set method should not accept empty Object.") : e(this._serviceName, { event_type: "get_all", properties: c })
        }; c.prototype.remove = function (b) {
            if (g(), "string" != typeof b && !Array.isArray(b)) return a("VALIDATION_ERROR", "The remove method accepts String or Array of Strings only."); b = "string" == typeof b ? [b] : b; return 0 >= b.length ? a("VALIDATION_ERROR", "The remove method should not accept empty Array of Strings.") : e(this._serviceName,
                { event_type: "remove", properties: b })
        }; c.prototype.request = function (b) {
            if (g(), !b.url || 0 >= b.url.trim().length) return a("VALIDATION_ERROR", "The parameter url should not be empty"); if ("string" != typeof b.url) return a("VALIDATION_ERROR", "The parameter url should be type of string"); if (b.method || (b.method = "GET"), b.params && "object" != typeof b.params && Array.isArray(b.params)) return a("VALIDATION_ERROR", "The parameter params should be type of object"); if (b.headers && "object" != typeof b.headers && Array.isArray(b.headers)) return a("VALIDATION_ERROR",
                "The parameter headers should be type of object"); if (b.files) { if ("object" != typeof b.files || Array.isArray(b.files)) return a("VALIDATION_ERROR", "The parameter files should be type of object"); if (5 < Object.keys(b.files).length) return a("VALIDATION_ERROR", "You can upload a maximum of 5 files at a time."); for (var d = 0; d < b.files.length; d++)b.files[d] = f.getFileObject(b.files[d]) } return e(this._serviceName, { event_type: "request", options: b })
        }; c.prototype.requestapiconnection = function (b) {
            if (g(), !b.api_namespace ||
                0 >= b.api_namespace.trim().length) return a("VALIDATION_ERROR", "The parameter api_namespace should not be empty"); if ("string" != typeof b.api_namespace) return a("VALIDATION_ERROR", "The parameter api_namespace should be type of string"); if (!b.url || 0 >= b.url.trim().length) return a("VALIDATION_ERROR", "The parameter url should not be empty"); if ("string" != typeof b.url) return a("VALIDATION_ERROR", "The parameter url should be type of string"); if (b.method || (b.method = "GET"), b.params && "object" != typeof b.params &&
                    Array.isArray(b.params)) return a("VALIDATION_ERROR", "The parameter params should be type of object"); if (b.headers && "object" != typeof b.headers && Array.isArray(b.headers)) return a("VALIDATION_ERROR", "The parameter headers should be type of object"); if (b.files) {
                        if ("object" != typeof b.files || Array.isArray(b.files)) return a("VALIDATION_ERROR", "The parameter files should be type of object"); if (5 < Object.keys(b.files).length) return a("VALIDATION_ERROR", "You can upload a maximum of 5 files at a time."); for (var d =
                            0; d < b.files.length; d++)b.files[d] = f.getFileObject(b.files[d])
                    } return e(this._serviceName, { event_type: "requestapiconnection", options: b })
        }; c.prototype.dispatch = function (b, a) { g(); return e(this._serviceName, { event_type: b, options: a }) }; var d = function (b) { return f = window.ZSDK.Init(), "function" == typeof b && (f.isRegistered() ? b.call() : f.on("Load", b)), new c(this._serviceName) }; return {
            CRM: { init: d.bind({ _serviceName: "CRM" }) }, DESK: { init: d.bind({ _serviceName: "DESK" }) }, PROJECTS: { init: d.bind({ _serviceName: "PROJECTS" }) },
            ORCHESTLY: { init: d.bind({ _serviceName: "ORCHESTLY" }) }, MAIL: { init: d.bind({ _serviceName: "MAIL" }) }, SHOW: { init: d.bind({ _serviceName: "SHOW" }) }, SDP: { init: d.bind({ _serviceName: "SDP" }) }, IOT: { init: d.bind({ _serviceName: "IOT" }) }, CATALYST: { init: d.bind({ _serviceName: "CATALYST" }) }, FINANCE: { init: d.bind({ _serviceName: "FINANCE" }) }, CONNECT: { init: d.bind({ _serviceName: "CONNECT" }) }, TEAMINBOX: { init: d.bind({ _serviceName: "TEAMINBOX" }) }, SPRINTS: { init: d.bind({ _serviceName: "SPRINTS" }) }, BUGTRACKER: { init: d.bind({ _serviceName: "BUGTRACKER" }) },
            CREATOR: { init: d.bind({ _serviceName: "CREATOR" }) }, PEOPLE: { init: d.bind({ _serviceName: "PEOPLE" }) }, COMMERCE: { init: d.bind({ _serviceName: "COMMERCE" }) }, SITES: { init: d.bind({ _serviceName: "SITES" }) }, RECRUIT: { init: d.bind({ _serviceName: "RECRUIT" }) }, WORKDRIVE: { init: d.bind({ _serviceName: "WORKDRIVE" }) }, WRITER: { init: d.bind({ _serviceName: "WRITER" }) }, INVOICE: { init: d.bind({ _serviceName: "INVOICE" }) }, INVENTORY: { init: d.bind({ _serviceName: "INVENTORY" }) }, SUBSCRIPTIONS: { init: d.bind({ _serviceName: "SUBSCRIPTIONS" }) }, CAMPAIGNS: { init: d.bind({ _serviceName: "CAMPAIGNS" }) },
            CHARMHEALTHEHR: { init: d.bind({ _serviceName: "CHARMHEALTHEHR" }) }, BIGIN: { init: d.bind({ _serviceName: "BIGIN" }) }
        }
}(); var ZCSDK = new function () {
    var c = !1, f, g = void 0, e = {}; this._init = function () { if (!c) { c = !0; f = new ZSDK; e.appSDK = f; var a; g = new Promise(function (d, b) { a = d }); f.OnLoad(function () { f.getContext().Event.Trigger("GET_INIT_PARAMS", !0, !0).then(function (d) { e.initParams = d; f.getContext().Event.Trigger("GET_QUERY_PARAMS", !0, !0).then(function (b) { e.queryParams = b; a() }) }) }) } return g }; this._getInitParams = function () { return e.initParams }; this._getQueryParams = function () { return e.queryParams }; this._getApi = function () {
        return {
            API: { RECORDS: new Records(e) },
            UTIL: new Util(e)
        }
    }
}, ZOHO = new function () { var c = !1, f = new ZSDK.Init, g = void 0, e = void 0, a = {}, d; g = new Promise(function (b, a) { d = b }); f.on("Load", function () { d() }); return { CREATOR: { API: new Records(a), UTIL: new Util(a), init: function () { if (!c) { var b; e = new Promise(function (a, d) { b = a }); g.then(function () { c = !0; a.appSDK = f; f._sendEvent("GET_INIT_PARAMS", !0, !0).then(function (d) { a.initParams = d; f._sendEvent("GET_QUERY_PARAMS", !0, !0).then(function (d) { a.queryParams = d; b() }) }) }).catch(function () { }) } return e } } } };
function Records(c) {
    function f(a) { a.scope || (a.scope = c.initParams.scope); a.envUrlFragment || (a.envUrlFragment = c.initParams.envUrlFragment.substr(1)); a.appName || (a.appName = c.initParams.appLinkName) } function g(a, d) { var b = !1, e; for (e in a) { var c; if (c = !(d && d.includes(e))) { c = a[e]; var f = !1, g; if (!(g = !c || null == c || "" === c || "string" == typeof c && 0 == c.trim().length) && (g = "object" == typeof c)) a: { g = void 0; for (g in c) { g = !1; break a } g = !0 } g && (f = !0); c = f } c && (b = !0) } return b } function e(a) {
        return new Promise(function (d, b) {
            var c =
                new FileReader; c.readAsDataURL(a); c.onload = function () { d(c.result) }; c.onerror = function (a) { b(a) }
        })
    } return {
        addRecord: function (a) { if (g(a)) return new Promise(function (a, b) { b("Improper Configuration..!!") }); f(a); return c.appSDK._sendEvent("ADD_RECORD", { appLinkName: a.appName, formLinkName: a.formName, body: a.data }, !0) }, updateRecord: function (a) {
            if (g(a)) return new Promise(function (b, a) { a("Improper Configuration..!!") }); var d = a.id.toString().split(","); f(a); return c.appSDK._sendEvent("EDIT_RECORDS", {
                appLinkName: a.appName,
                viewLinkName: a.reportName, body: a.data, listOfRecords: d
            }, !0)
        }, deleteRecord: function (a) { if (g(a)) return new Promise(function (a, b) { b("Improper Configuration..!!") }); f(a); return c.appSDK._sendEvent("DELETE_RECORDS", { appLinkName: a.appName, viewLinkName: a.reportName, criteria: a.criteria }, !0) }, getRecordById: function (a) { if (g(a)) return new Promise(function (a, b) { b("Improper Configuration..!!") }); f(a); return c.appSDK._sendEvent("GET_RECORD", { appLinkName: a.appName, viewLinkName: a.reportName, id: a.id }, !0) }, getAllRecords: function (a) {
            if (g(a,
                ["criteria", "page", "pageSize"])) return new Promise(function (a, b) { b("Improper Configuration..!!") }); f(a); return c.appSDK._sendEvent("GET_RECORDS", { appLinkName: a.appName, viewLinkName: a.reportName, criteria: a.criteria, page: a.page, pageSize: a.pageSize }, !0)
        }, uploadFile: function (a) {
            if (g(a, ["file", "parentId"])) return new Promise(function (a, b) { b("Improper Configuration..!!") }); f(a); return a.file ? a.file.size && 50 < a.file.size / 1024 / 1024 ? new Promise(function (a, b) { b("Improper Configuration..!!") }) : new Promise(function (d,
                b) { var f = e(a.file), g = "", p = a.file.name; f.then(function (e) { g = e; e = { appLinkName: a.appName, viewLinkName: a.reportName, id: a.id, fieldName: a.fieldName, file: g, fileName: p }; a.parentId && (e.parentId = a.parentId); c.appSDK._sendEvent("UPLOAD_FILE", e, !0).then(function (b) { d(b) }).catch(function (a) { b(a) }) }).catch(function (a) { b(a) }) }) : new Promise(function (a, b) { b("Improper Configuration..!!") })
        }, getRecordCount: function (a) {
            if (g(a)) return new Promise(function (a, b) { b("Improper Configuration..!!") }); f(a); return c.appSDK._sendEvent("GET_COUNT",
                { appLinkName: a.appName, viewLinkName: a.reportName, criteria: a.criteria }, !0)
        }, readFile: function (a) { if (g(a)) return new Promise(function (a, c) { c("Improper Configuration..!!") }); f(a); var d = { appLinkName: a.appName, viewLinkName: a.reportName, id: a.id, fieldName: a.fieldName }; a.parentId && (d.parentId = a.parentId); return c.appSDK._sendEvent("READ_FILE", d, !0) }
    }
}
function Util(c) {
    return {
        setImageData: function (f, g, e) { if (g.startsWith("/api/v2/")) { var a = {}; a.src = g; c.appSDK._sendEvent("IMAGE_LOAD", a, !0).then(function (a) { f.setAttribute("src", a); e({ status: "200", statusText: "success" }) }).catch(function (a) { if (e) e(a); else { var b = window.console; b.log("Error: Unable to set image data"); b.log(a) } }) } else f.setAttribute("src", g) }, getInitParams: function () { return c.initParams }, getQueryParams: function () { return c.queryParams }, navigateParentURL: function (f) {
            return f && f.action ? c.appSDK._sendEvent("PARENT_NAVIGATION",
                f, !0) : new Promise(function (c, e) { e("Improper Configuration..!!") })
        }
    }
};