define("task-status", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TaskStatus;
    (function (TaskStatus) {
        TaskStatus[TaskStatus["CREATED"] = 0] = "CREATED";
        TaskStatus[TaskStatus["WAITING"] = 1] = "WAITING";
        TaskStatus[TaskStatus["RUNNING"] = 2] = "RUNNING";
        TaskStatus[TaskStatus["FULFILLED"] = 3] = "FULFILLED";
        TaskStatus[TaskStatus["REJECTED"] = 4] = "REJECTED";
    })(TaskStatus = exports.TaskStatus || (exports.TaskStatus = {}));
});
define("task-callback", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("task-catch-callback", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("task-child-callback", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("task", ["require", "exports", "task-argument", "task-status"], function (require, exports, task_argument_1, task_status_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Task = /** @class */ (function () {
        function Task(args) {
            var _this = this;
            /**
             * Situação atual da tarefa
             */
            this.status = task_status_1.TaskStatus.CREATED;
            /**
             * Dados vinculadas com as tarefas, eles precisam vir juntos
             * caso haja a necessidade de retorná-la em um contexto onde
             * ela esteja encapsulada
             */
            this.data = null;
            /**
             * Quando um erro é lançado na execução do corpo de uma tarefa
             * ou então quando o reject é executado
             */
            this.err = null;
            /**
             * Aqui serão vinculadas todas as funções que devem ser vinculadas
             * quando a requisição for concluida
             */
            this.childCry = null;
            if (args instanceof task_argument_1.TaskArgument) {
                this.thenCallback = args.callback;
                this.parent = args.parent;
                switch (this.parent.status) {
                    case task_status_1.TaskStatus.FULFILLED:
                        this.executeCallback();
                        break;
                    case task_status_1.TaskStatus.REJECTED:
                        this.status = task_status_1.TaskStatus.REJECTED;
                        break;
                    default:
                        this.status = task_status_1.TaskStatus.WAITING;
                        this.parent.onComplete(function (data, err) {
                            _this.data = data;
                            _this.err = err;
                            if (_this.parent.status == task_status_1.TaskStatus.REJECTED)
                                _this.status = task_status_1.TaskStatus.REJECTED;
                            _this.executeCallback();
                        });
                        break;
                }
            }
            else {
                this.thenCallback = args;
                this.executeCallback();
            }
        }
        Task.prototype.getParent = function () {
            return this.parent;
        };
        Task.prototype.getChild = function () {
            return this.child;
        };
        Task.prototype.resolve = function (data) {
            if (this.status == task_status_1.TaskStatus.FULFILLED || this.status == task_status_1.TaskStatus.REJECTED)
                return;
            this.status = task_status_1.TaskStatus.FULFILLED;
            this.data = data;
            this.complete();
        };
        Task.prototype.reject = function (err) {
            if (this.status == task_status_1.TaskStatus.FULFILLED || this.status == task_status_1.TaskStatus.REJECTED)
                return;
            this.status = task_status_1.TaskStatus.REJECTED;
            this.err = err;
            this.complete();
        };
        Task.prototype.executeCallback = function () {
            var _this = this;
            try {
                this.status = task_status_1.TaskStatus.RUNNING;
                if (this.parent && this.parent.status === task_status_1.TaskStatus.REJECTED) {
                    if (this.catchCallback)
                        this.catchCallback(this.err, this.data);
                }
                else {
                    if (this.thenCallback)
                        this.thenCallback(function (data) { return _this.resolve(data); }, function (err) { return _this.reject(err); }, this.data);
                }
            }
            catch (e) {
                this.status = task_status_1.TaskStatus.REJECTED;
                this.reject(e);
            }
        };
        Task.prototype.then = function (callback) {
            var noviceTask = this;
            if (!this.child)
                return this.child = new Task(new task_argument_1.TaskArgument(this, callback));
            while (noviceTask.getChild())
                noviceTask = noviceTask.getChild();
            return noviceTask.then(callback);
        };
        Task.prototype.catch = function (catchCallback) {
            this.catchCallback = catchCallback;
        };
        Task.prototype.onComplete = function (call) {
            if (this.childCry)
                throw new Error('This task already has a callback from his children');
            this.childCry = call;
        };
        Task.prototype.complete = function () {
            if (this.childCry)
                this.childCry(this.data, this.err);
        };
        return Task;
    }());
    exports.Task = Task;
});
define("task-argument", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TaskArgument = /** @class */ (function () {
        function TaskArgument(parent, callback) {
            this.parent = parent;
            this.callback = callback;
        }
        return TaskArgument;
    }());
    exports.TaskArgument = TaskArgument;
});
