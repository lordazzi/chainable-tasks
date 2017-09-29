declare module "task-status" {
    export enum TaskStatus {
        CREATED = 0,
        WAITING = 1,
        RUNNING = 2,
        FULFILLED = 3,
        REJECTED = 4,
    }
}
declare module "task-callback" {
    import { Task } from "task";
    export type ThenCallback = (resolve: (data: any) => void, reject: (err: Error) => void, data: any) => Task;
}
declare module "task-catch-callback" {
    export type TaskCatchCallback = (err: Error, data: any) => void;
}
declare module "task-child-callback" {
    export type TaskChildCallback = (data: any, err: Error) => void;
}
declare module "task" {
    import { TaskArgument } from "task-argument";
    import { TaskStatus } from "task-status";
    import { ThenCallback } from "task-callback";
    import { TaskCatchCallback } from "task-catch-callback";
    import { TaskChildCallback } from "task-child-callback";
    export class Task {
        /**
         * Situação atual da tarefa
         */
        status: TaskStatus;
        /**
         * Função que representa o corpo da tarefa a ser executado
         */
        private thenCallback;
        /**
         * Função que será chamada caso tudo dê errado
         */
        private catchCallback;
        /**
         * Dados vinculadas com as tarefas, eles precisam vir juntos
         * caso haja a necessidade de retorná-la em um contexto onde
         * ela esteja encapsulada
         */
        private data;
        /**
         * Quando um erro é lançado na execução do corpo de uma tarefa
         * ou então quando o reject é executado
         */
        private err;
        /**
         * Tarefa precedente a esta
         */
        private parent;
        /**
         * Tarefa seguinte a esta
         */
        private child;
        /**
         * Aqui serão vinculadas todas as funções que devem ser vinculadas
         * quando a requisição for concluida
         */
        private childCry;
        constructor(args: ThenCallback | TaskArgument);
        getParent(): Task;
        getChild(): Task;
        private resolve(data);
        private reject(err);
        private executeCallback();
        then(callback: ThenCallback): Task;
        catch(catchCallback: TaskCatchCallback): void;
        onComplete(call: TaskChildCallback): void;
        private complete();
    }
}
declare module "task-argument" {
    import { Task } from "task";
    import { ThenCallback } from "task-callback";
    export class TaskArgument {
        parent: Task;
        callback: ThenCallback;
        constructor(parent: Task, callback: ThenCallback);
    }
}
