import { Task } from './task';
import { ThenCallback } from './task-callback';

export class TaskArgument {
    constructor(public parent: Task, public callback: ThenCallback) {

    }
}