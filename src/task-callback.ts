import { Task } from './task';

export type ThenCallback = (resolve: (data: any) => void, reject: (err: Error) => void, data: any) => Task;