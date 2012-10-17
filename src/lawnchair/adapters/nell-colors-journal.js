/**
 * nell-colors-journal adapter.
 * C. Scott Ananian
 */
define([], function() { return function(Lawnchair) {

Lawnchair.adapter('nell-colors-journal', (function() {
    // use dom storage to store a persistent UUID
    var domStorage = window.localStorage;
    // key name used to store UUID
    var UUID_KEY = 'nell-colors-journal-uuid';
    // server name!
    var NCJ_BASE_URL = 'http://nell-colors-journal.appspot.com';
    // local debugging only!
    //NCJ_BASE_URL = 'http://localhost:8888';

    var uuid = (function() {
        var _uuid = null;
        return function(lawnchair) {
            if (lawnchair._wildcard) { return '*'; }
            if (!_uuid) {
                // try to get uuid from domStorage
                _uuid = domStorage.getItem(UUID_KEY);
            }
            if (!_uuid) {
                // create a new uuid (and store it)
                _uuid = lawnchair.uuid();
                domStorage.setItem(UUID_KEY, _uuid);
            }
            console.assert(_uuid);
            return _uuid;
        };
    })();

    // serialize parameters (borrowed then simplified from zepto.js)

    var $param = function(obj) {
        var escape = encodeURIComponent;
        var k, params = [];
        for (k in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, k)) {
                params.push(escape(k) + '=' + escape(obj[k]));
            }
        }
        return params.join('&').replace(/%20/g, '+');
    };
    var appendQuery = function(url, query) {
        return (url + '&' + query).replace(/[&?]{1,2}/, '?');
    };
    var doReq = function(method, url, params, callback) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            var result = null, error = false;
            if (xhr.readyState !== 4) { return; /* not interesting */ }
            if ((xhr.status >= 200 && xhr.status < 300) || xhr.status==304){
                result = xhr.responseText;
                try {
                    result = JSON.parse(result);
                } catch (e) { error = 'parsererror'; }
            } else {
                error = 'error';
            }
            callback(result, error);
        };
        var data = $param(params);
        if (method==='GET') { url = appendQuery(url, data); data = null; }
        xhr.open(method, NCJ_BASE_URL + url, true/*async*/);
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        if (method==='POST') {
            xhr.setRequestHeader('Content-Type',
                                 'application/x-www-form-urlencoded');
        }
        if (data) { xhr.send(data); } else { xhr.send(); }
        return xhr;
    };
    // do a request with a 'cursor' in the callback
    var doMultipartReq = function(method, url, params, callback) {
        var r = [];
        var doOne = function(lastCursor) {
            if (lastCursor) { params.cursor = lastCursor; }
            doReq(method, url, params, function(result, error) {
                if (error) { callback(null, error); }
                if (result.result) { r.push.apply(r, result.result); }
                if (result.cursor) {
                    doOne(result.cursor);
                } else {
                    callback(r, false);
                }
            });
        };
        doOne(null);
    };

    var setVersion = function(obj, version) {
        // add non-enumerable property to obj
        Object.defineProperty(obj, "__version__", {
            value: version,
            enumerable: false
        });
    };

    return {
        valid: function() {
            if (!domStorage) { return false; }
            // xxx query the 'version' API on the server?
            return true;
        },
        init: function(options, callback) {
            this._wildcard = !!options.wildcard;
            uuid(this);
            this.fn(this.name, callback).call(this, this);
            return this;
        },
        save: function(obj, callback) {
            var key = obj.key || this.uuid();
            if (arguments.length > 2) {
                // store this value iff current value is still equal
                // to condObj (condObj is optional second argument)
                var condObj = arguments[1]; callback = arguments[2];
                if (!obj.key) { key = condObj.key || key; }
                doReq('POST', '/putif/'+uuid(this), {
                    dbname: this.name,
                    key:    key,
                    value:  JSON.stringify(obj),
                    version: condObj.__version__
                }, function(result, error) {
                    console.assert(!error);
                    if (callback) {
                        obj.key = key;
                        // extra arg to callback saying whether write was
                        // successful (or you could look at the object)
                        if (result.success) {
                            setVersion(obj, result.version);
                            this.lambda(callback).call(this, obj, true);
                        } else {
                            this.lambda(callback).call(this, condObj, false);
                        }
                    }
                }.bind(this));
                return this;
            }
            doReq('POST', '/put/'+uuid(this), {
                dbname: this.name,
                key:    key,
                value:  JSON.stringify(obj)
            }, function(result, error) {
                console.assert(!error);
                if (callback) {
                    obj.key = key;
                    setVersion(obj, result.version);
                    this.lambda(callback).call(this, obj);
                }
            }.bind(this));
            return this;
        },
        remove: function(keyOrArray, callback) {
            // handle case where we were given an array.
            if (this.isArray(keyOrArray)) {
                var i, left = keyOrArray.length;
                var done = function() {
                    // are we done with all the requests yet?
                    if ((--left) > 0) { return; }
                    if (callback) { this.lambda(callback).call(this); }
                }.bind(this);
                for (i=0; i<keyOrArray.length; i++) {
                    // recurse to handle a single key
                    this.remove(keyOrArray[i], done);
                }
                return;
            }
            // ok, now we only need to handle a single key.
            var key = keyOrArray.key ? keyOrArray.key: keyOrArray;
            doReq('POST', '/delete/'+uuid(this), {
                dbname: this.name,
                key:    key
            }, function(result, error) {
                console.assert(!error);
                if (callback) { this.lambda(callback).call(this); }
            }.bind(this));
            return this;
        },
        batch: function(objs, callback) {
            var i, r = [], left = objs.length;
            var doOne = function(i) {
                this.save(objs[i], function(val) {
                    r[i] = val;
                    if ((--left) > 0) { return; }
                    if (callback) { this.lambda(callback).call(this, r); }
                }.bind(this));
            }.bind(this);
            for (i=0; i<objs.length; i++) {
                doOne(i);
            }
            return this;
        },
        get: function(keyOrArray, callback) {
            // handle case where we were given an array.
            if (this.isArray(keyOrArray)) {
                var i, r = [], left = keyOrArray.length;
                var doOne = function(i) {
                    // recurse to handle a single key
                    this.get(keyOrArray[i], function(val) {
                        r[i] = val;
                        // are we done with all the requests yet?
                        if ((--left) > 0) { return; }
                        if (callback) { this.lambda(callback).call(this, r); }
                    }.bind(this));
                }.bind(this);
                for (i=0; i<keyOrArray.length; i++) {
                    doOne(i);
                }
                return this;
            }
            // ok, now we only need to handle a single key.
            doReq('GET', '/get/'+uuid(this), {
                dbname: this.name,
                key: keyOrArray
            }, function(result, error) {
                console.assert(!error);
                // result.value is null if key is not found.
                var r = result ? JSON.parse(result.value) : null;
                if (r) {
                    r.key = keyOrArray;
                    setVersion(r, result.version);
                }
                if (callback) { this.lambda(callback).call(this, r); }
            }.bind(this));
            return this;
        },
        exists: function(key, callback) {
            doReq('GET', '/exists/'+uuid(this), {
                dbname: this.name,
                key: key
            }, function(result, error) {
                console.assert(!error);
                if (callback) { this.lambda(callback).call(this, result); }
            }.bind(this));
            return this;
        },
        keys: function(callback) {
            doMultipartReq('GET', '/keys/'+uuid(this), { dbname: this.name }, function(result, error) {
                console.assert(!error);
                if (callback) { this.lambda(callback).call(this, result); }
            }.bind(this));
            return this;
        },
        all: function(callback) {
            doMultipartReq('GET', '/list/'+uuid(this), { dbname: this.name }, function(result, error) {
                console.assert(!error);
                result = result.map(function(obj) {
                    var r = JSON.parse(obj.value);
                    if (r) { r.key = obj.key; }
                    setVersion(r, obj.version);
                    return r;
                });
                if (callback) { this.lambda(callback).call(this, result); }
            }.bind(this));
            return this;
        },
        nuke: function(callback) {
            doMultipartReq('POST', '/nuke/'+uuid(this), { dbname: this.name }, function(result, error) {
                console.assert(!error);
                if (callback) { this.lambda(callback).call(this); }
            }.bind(this));
            return this;
        }
    };
})());

};
});
