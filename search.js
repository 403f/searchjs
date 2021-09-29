(function(root) {
    function register(env, name, obj) {
        if (typeof env[name] == 'object') {
            return false;
        }
        env[name] = obj;
        return true;
    }

    let Log = function() {
        let message_type = ['error', 'important', 'warn', 'accept'];

        let emptyMsg = {
            'funcName': 'none',
            'type': 'accept',
            'content': 'the default log info',
            'time': new Date()
        };

        let msgs = [];

        return {
            'put': function(funcName, type, content) {
                if (typeof funcName != 'string' || message_type.indexOf(type) < 0 || typeof content != 'string') {
                    this.fire(funcName, type, content);
                    return;
                }

                let msg = {
                    'funcName': funcName,
                    'type': type,
                    'content': content,
                    'time': new Date()
                };

                msgs.push(msg);

            },

            'last': function() {
                if (msgs.length < 0) {
                    return emptyMsg;
                }
                return msgs.pop();
            },

            'lastNoDel': function() {
                if (msgs.length < 0) {
                    return emptyMsg;
                }

                return msgs[msgs.length - 1];
            },

            'msgToString': function(msg) {
                let stream = 'function:' + msg['funcName'] + ';';
                stream = stream + 'type:' + msg['type'] + ';';
                stream = stream + 'info' + msg['content'] + ';';
                stream = stream + 'time' + msg['time'].toDateString() + ';';

                return stream;
            },

            'fire': function(funcName, type, content) {

                let find = 0;
                message_type.forEach(function(mt) {
                    if (mt == type) {
                        find = 1;
                    }
                });
                let outputFunc = console.log; (!find ? console.error("the type was error where function name is" + funcName + ";type is:" + type + "log is" + content) : function() {
                    if (mt == 'error') {
                        outputFunc = console.error;
                    } else if (mt == 'warn') {
                        outputFunc = console.warn;
                    }
                });
                this.put(funcName, type, content);
                outputFunc(this.msgToString(this.last()));
                return;
            },

            'getLogByFuncName': function(funcName) {
                if (typeof funcName != 'string') {
                    return [];
                }
                let result = [];

                msgs.forEach(function(msg) {
                    if (msg['funcName'] == funcName) {
                        result.push(msg);
                    }
                });

                return result;
            },

            'getLogByType': function(type) {
                if (typeof type != 'string') {
                    return [];
                }

                let result = [];

                msgs.forEach(function(msg) {
                    if (msg['type'] == type) {
                        result.push(msg);
                    }
                });

                return result;
            },

            'getLogByTime': function(time) {
                if (!Array.isArray(time) || time.length != 2) {
                    return [];
                }
                let check = true;
                time.forEach(function(ti) {
                    if (! (ti instanceof Date)) {
                        check = false;
                    }
                });

                if (!check) return [];

                let result = [];

                msgs.forEach(function(msg) {
                    let mtime = msg['time'].getTime();
                    if (mtime >= time[0].getTime() && mtime <= time[1].getTime()) {
                        result.push(msg);
                    }
                });

                return result;
            },

            'flush': function() {
                for (let i = 0; i < msgs.length; i++) {
                    this.fire();
                }
            },

        }
    }

    Log = new Log();

    register(root, 'Log', Log);

    let Compare = function() {};

    Compare.generalCompare = function(a, op, b) {
        switch (op) {
        case '>':
            return a > b;
            break;
        case '<':
            return a < b;
            break;
        case '<=':
            return a <= b;
            break;
        case '>=':
            return a >= b;
            break;
        case '=':
            return a == b;
            break;
        default:
            return false;
        }
    };

    Compare.baseCompare = function(a, b) {
        return a - b;
    }

    register(root, 'Compare', Compare);

    let Hash = function() {
        this.hashKey = 'sdadffhttyvhjhgijt';
        this.dict = 'abcdefghijklmnopqrstuvwxyz';
        this.base = 10;
        this.step = 1;
        this.scope = 1000;
    }

    Hash.prototype.formatObj = function(obj) {
        let that = this;
        if (Array.isArray(obj)) {
            obj.sort(Compare.baseCompare);
            for (let i = 0; i < obj.length; i++) {
                that.formatObj(obj[i]);
            }
        } else if (typeof obj == 'object') {
            let obj_keys = Object.keys(obj);
            obj_keys.sort(Compare.baseCompare);
            let tmp_obj = {};
            for (let i = 0; i < obj_keys.length; i++) {
                tmp_obj[obj_keys[i]] = obj[obj_keys[i]];
                that.formatObj(tmp_obj[obj_keys[i]]);
            }
            obj = tmp_obj;
        } else {
            return;
        }

    }

    Hash.prototype.calcHashCode = function(str) {
        if (typeof str != 'string') {
            return false;
        }
        let st = this.step;
        let code = 0;
        for (let i = 0; i < str.length; i++) {
            code += str.charCodeAt(i) * st;
            st = st * this.base;
        }

        return code % this.scope;
    }

    let hash = new Hash();

    register(root, 'Hash', hash);

    let find = function(origin) {
        //当要增加方法时，注意this.result的push和pop的含义已经变化，分别为从result中原位存入和取出
        //对于result的元素删除操作只能使用splice才能保证库正常运行
        //notation: when you want to extends this library, please remember that this.result.pop or this.result.push has different function from prototype of array,and all the library
        //depend on the share_data ,result,runStack.
        let sql = function() {
            this.runStack = [];
            this.inxs = (function() {
                if (origin.length == 0) {
                    return [];
                } else {
                    return Object.keys(origin[0]);
                }
            })();
            this.result = [];

            let share_data = null;
            let cur_data_wrapper = {
                'data': null,
                'pos': this.result.length - 1,
            };
            let hadRun = [];
            let that = this;

            let run = function() {
                that.result.clear();
                share_data = null;
                for (let i = 0; i < origin.length; i++) {
                    share_data = origin[i];
                    for (let j = that.runStack.length - 1; j >= 0; j--) {
                        that.runStack[j]();
                    }
                }
                origin = JSON.parse(JSON.stringify(that.result));
            };

            Object.keys(sql.prototype).forEach(function(methodName) {
                Object.defineProperty(that.result, methodName, {
                    'value': function(...argu) {
                        if (methodName != 'run') {

                            let hasSeq = typeof argu[0] == 'boolean' ? argu[0] : false;
                            let tmp_argu = JSON.parse(JSON.stringify(argu));
                            if (!hasSeq) {
                                hash.formatObj(tmp_argu);
                            }
                            tmp_argu = JSON.stringify(tmp_argu);

                            let ky = methodName + hash.calcHashCode(tmp_argu);
                            if (hadRun.indexOf(ky) < 0) {
                                that[methodName](...argu);
                                run();
                                hadRun.push(ky);
                            }

                        }
                        return that.result;
                    },
                    'configurable': false,
                    'enumerable': false,
                    'writable': false,
                });
            });

            Object.defineProperty(that.result, 'push', {
                'value': function(argv) {

                    if (share_data == null && cur_data_wrapper.pos >= 0) {
                        that.result.splice(cur_data_wrapper.pos, 0, argv);
                    } else {
                        Array.prototype.push.call(that.result, argv);
                        cur_data_wrapper.data = share_data;
                        cur_data_wrapper.pos = that.result.length - 1;
                        share_data = null;
                    }

                },
                'configurable': false,
                'writable': false,
                'enumerable': false,
            });

            Object.defineProperty(that.result, 'pop', {
                'value': function() {
                    let tmp = null;
                    if (share_data != null) {
                        tmp = JSON.stringify(share_data);
                        share_data = null;
                        tmp = JSON.parse(tmp);
                    } else {
                        if (that.result.length > 0 && cur_data_wrapper.pos >= 0) {
                            tmp = that.result.splice(cur_data_wrapper.pos, 1)[0];
                        } else {
                            tmp = null;
                        }
                    }
                    cur_data_wrapper.data = tmp;
                    return tmp;
                },
                'configurable': false,
                'writable': false,
                'enumerable': false,
            });

            Object.defineProperty(that.result, 'splice', {
                'value': function(start, delcount, ...addData) {
                    if (delcount == 0) {
                        cur_data_wrapper.pos = start;
                    } else {
                        cur_data_wrapper.pos = -1;
                    }

                    return Array.prototype.splice.call(that.result, start, delcount, ...addData);
                },
                'configurable': false,
                'writable': false,
                'enumerable': false,
            });

            this.result.clear = function() {
                that.result.splice(0, that.result.length);
                cur_data_wrapper.pos = that.result.length - 1;
                cur_data_wrapper.data = null;
            }

            this.result.put = function(data) {
                if (!Array.isArray(data)) {
                    Log.fire('sql.result.put', 'error', 'the argument of put must be array');
                }
                that.result.splice(that.result.length, 0, data);
            }

        };

        sql.prototype = {
            //每一个方法处理share_data，也只能处理share_data，整个运行就像一条流水线加工厂
            'where': function(wh) {
                if (typeof wh !== 'object') {
                    console.error('your where syntax was error');
                    Log.fire('find.sql.where', 'error', 'the where syntax was error');
                }

                let that = this;

                this.runStack.unshift(function() {
                    let data = null;
                    data = that.result.pop();

                    if (typeof wh != 'object') {
                        //debug
                        Log.fire('find.sql.where.runStackFunction', 'error', 'the where syntax was error');
                    }
                    let match = true;
                    let k = Object.keys(wh);
                    for (let i = 0; i < k.length; i++) {
                        if (that.inxs.indexOf(k[i]) < 0) {
                            continue;
                        }
                        if (data[k[i]] && typeof data[k[i]] !== 'object') {
                            if (typeof data[k[i]] === null) {
                                continue;
                            }
                            if (typeof wh[k[i]] !== 'string' && Object.getPrototypeOf(wh[k[i]]) === RegExp.prototype) {
                                if (!wh[k[i]].test(data[k[i]])) {
                                    match = false;
                                    break;
                                }
                            } else if (typeof wh[k[i]] === 'string') {
                                if (!data[k[i]] || data[k[i]] != wh[k[i]]) {
                                    match = false;
                                    break;
                                }
                            } else if (Array.isArray(wh[k[i]])) {
                                if (wh[k[i]].length !== 2) {
                                    Log.fire('find.sql.where.runStackFunction', 'error', 'the Arraywhere syntax was error. Want to Konw detail,please see the document');
                                }
                                let op = wh[k[i]][0];
                                let d = wh[k[i]][1];
                                if (typeof op != 'string' || (typeof d != 'string' && typeof d != 'number')) {
                                    Log.fire('find.sql.where.runStackFunction', 'error', 'the Arraywhere syntax was error. Want to Konw detail,please see the document');
                                }
                                try {
                                    if (typeof data[k[i]] == 'number') {
                                        if ((d = parseFloat(d)) === NaN) {
                                            d = parseInt(d);
                                        }
                                    }
                                    if (!Compare.generalCompare(data[k[i]], op, d)) {
                                        match = false;
                                    }
                                } catch(e) {
                                    throw e;
                                }
                            }
                        } else {
                            match = false;
                            break;
                        }

                    }

                    (match ? that.result.push(data) : '');
                }

                );

            },
            'orderBy': function(inx, direct) {
                let dic = ['desc', 'asc'];

                if (dic.indexOf(direct) < 0) {
                    Log.fire('find.sql.orderBy', 'error', 'the direct was error');
                }
                if (this.inxs.indexOf(inx) < 0) {
                    Log.fire('find.sql.orderBy', 'error', 'the inx not in the data');
                }
                let that = this;

                this.runStack.unshift(function() {

                    let data = null;
                    data = that.result.pop();
                    if (data == [] || data == null) {
                        return;
                    }
                    let end = that.result.length ? that.result.length - 1 : 0;
                    let start = 0;
                    let inx_val = data[inx];
                    let mid = 0;

                    while (start <= end) {
                        let avg = Math.ceil((end - start + 1) / 2);
                        mid = start + avg;
                        if (mid >= that.result.length) {
                            break;
                        }
                        if (inx_val < that.result[mid][inx]) {
                            if (direct == 'desc') {
                                start += avg;
                            } else {
                                end -= avg;
                            }
                        } else if (inx_val == that.result[mid][inx]) {
                            that.result.splice(mid + 1, 0, data);
                            return;
                        } else if (inx_val > that.result[mid][inx]) {
                            if (direct == 'desc') {
                                end -= avg;
                            } else {
                                start += avg;
                            }
                        }
                    }
                    if (that.result.length > 0) {
                        if (data[inx] > that.result[start][inx]) {
                            if (direct == 'asc') {
                                start++;
                            }
                        } else {
                            if (direct == 'desc') {
                                start++;
                            }
                        }
                    }

                    that.result.splice(start, 0, data);
                });

            },

            'filter': function(fields) {
                if (!Array.isArray(fields)) {
                    return;
                }
                let that = this;
                fields.forEach(function(field) {
                    if (that.inxs.indexOf(field) < 0) {
                        return;
                    }
                });
                this.runStack.unshift(function() {
                    let data = that.result.pop();
                    let tmp_data = {};
                    if (data == null) {
                        return;
                    }
                    fields.forEach(function(field) {
                        if (data[field] !== undefined) {
                            tmp_data[field] = data[field];
                        }
                    });

                    that.result.push(tmp_data);
                });
            },

            'find': function() {
                let that = this;
                this.runStack.unshift(function() {
                    that.result.push(that.result.pop());
                });
            },
        };

        let sql_obj = new sql();

        return sql_obj.result.find();
    }

    if (typeof window.module == undefined && module.exports) {
        module.exports = find;
    } else if (!root.findData) {
        root.findData = find;
    }
})(window);
