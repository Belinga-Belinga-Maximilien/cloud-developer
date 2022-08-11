import { TodosAccess } from './todosAcess'
import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
// import * as createError from 'http-errors'

// TODO: Implement businessLogic
const todoAccess = new TodoAccess()
const attachment = new AttachmentUtils()
const logger = createLogger('TodoAccess');

export async function getTodosForUser(
    userId: string
):Promise<TodoItem[]> {
    logger.info('Getting users todos')
    return todoAccess.getTodosForUser(userId)
}

export async function createTodo(
    createTodoRequest: CreateTodoRequest,
    userId: string
): Promise<TodoItem> {
    const todoId = uuid.v4()
    const createdAt = new Date().toISOString()
    return await todoAccess.createTodo({
        todoId: todoId,
        userId: userId,
        createdAt: createdAt,
        name: createTodoRequest.name,
        dueDate: createTodoRequest.dueDate,
        done: false
    })
}

export async function updateTodo(
    updateTodoRequest: UpdateTodoRequest,
    userId: string,
    todoId: uuid
): Promise<TodoUpdate>{
    return await todoAccess.updateTodo({
        name: updateTodoRequest.name,
        dueDate:updateTodoRequest.dueDate,
        done: updateTodoRequest.done
    },
    todoId, userId)
}
export async function createAttachmentPresignedUrl(todoId:string) {

    return await attachment.createAttachmentPresignedUrl(todoId)
}
export async function deleteTodo(userId:string, todoId:string) {
    await todoAccess.deleteTodo(userId, todoId)
}