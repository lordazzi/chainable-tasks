import { TaskArgument } from './task-argument';
import { TaskStatus } from "./task-status";
import { ThenCallback } from "./task-callback";
import { TaskCatchCallback } from "./task-catch-callback";
import { TaskChildCallback } from "./task-child-callback";

export class Task {

    /**
     * Situação atual da tarefa
     */
    public status = TaskStatus.CREATED;

    /**
     * Função que representa o corpo da tarefa a ser executado
     */
    private thenCallback: ThenCallback;

    /**
     * Função que será chamada caso tudo dê errado
     */
    private catchCallback: TaskCatchCallback;

    /**
     * Dados vinculadas com as tarefas, eles precisam vir juntos
     * caso haja a necessidade de retorná-la em um contexto onde
     * ela esteja encapsulada
     */
    private data: any = null;

    /**
     * Quando um erro é lançado na execução do corpo de uma tarefa
     * ou então quando o reject é executado
     */
    private err: Error = null;

    /**
     * Tarefa precedente a esta
     */
    private parent: Task;

    /**
     * Tarefa seguinte a esta
     */
    private child: Task;

    /**
     * Aqui serão vinculadas todas as funções que devem ser vinculadas
     * quando a requisição for concluida
     */
    private childCry: TaskChildCallback = null;

    public constructor(args: ThenCallback | TaskArgument) {
        if (args instanceof TaskArgument) {
            this.thenCallback = args.callback;
            this.parent = args.parent;

            switch (this.parent.status) {
                case TaskStatus.FULFILLED:
                    this.executeCallback();
                    break;

                case TaskStatus.REJECTED:
                    this.status = TaskStatus.REJECTED;
                    break;

                default:
                    this.status = TaskStatus.WAITING;
                    this.parent.onComplete((data, err) => {
                        this.data = data;
                        this.err = err;

                        if (this.parent.status == TaskStatus.REJECTED)
                            this.status = TaskStatus.REJECTED;

                        this.executeCallback();
                    });
                    break;

            }
        } else {
            this.thenCallback = <ThenCallback>args;
            this.executeCallback();
        }
    }

    public getParent(): Task {
        return this.parent;
    }

    public getChild(): Task {
        return this.child;
    }

    private resolve(data: any): void {
        if (this.status == TaskStatus.FULFILLED || this.status == TaskStatus.REJECTED)
            return;

        this.status = TaskStatus.FULFILLED;
        this.data = data;

        this.complete();
    }

    private reject(err: Error): void {
        if (this.status == TaskStatus.FULFILLED || this.status == TaskStatus.REJECTED)
            return;

        this.status = TaskStatus.REJECTED;
        this.err = err;

        this.complete();
    }

    private executeCallback() {
        try {
            this.status = TaskStatus.RUNNING;

            if (this.parent && this.parent.status === TaskStatus.REJECTED) {
                if (this.catchCallback) this.catchCallback(this.err, this.data);
            } else {
                if (this.thenCallback) this.thenCallback(data => this.resolve(data), err => this.reject(err), this.data);
            }
        } catch (e) {
            this.status = TaskStatus.REJECTED;
            this.reject(e);
        }
    }

    public then(callback: ThenCallback): Task {
        let noviceTask: Task = this;

        if (!this.child)
            return this.child = new Task(new TaskArgument(this, callback));

        while (noviceTask.getChild())
            noviceTask = noviceTask.getChild();

        return noviceTask.then(callback);
    }

    public catch(catchCallback: TaskCatchCallback): void {
        this.catchCallback = catchCallback;
    }

    public onComplete(call: TaskChildCallback): void {
        if (this.childCry)
            throw new Error('This task already has a callback from his children');

        this.childCry = call;
    }

    private complete() {
        if (this.childCry)
            this.childCry(this.data, this.err);
    }
}