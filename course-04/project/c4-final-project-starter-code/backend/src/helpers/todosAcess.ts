import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
//import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
export class TodoAccess {
    constructor(
        private readonly docClient: AWSXRay.DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todoTable = process.env.TODOS_TABLE
    ){}

    async getTodosForUser(userId: string): Promise<TodoItem[]>{
        logger.info('Getting all todos for a User', {
            userId: userId
        })
        const result = await this.docClient.query({
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': {
                    S: userId
                }
            },
            TableName: this.todoTable
        }).promise()

        const todos = result.Items
        return todos as TodoItem[]
    }

    async createTodo(todo: TodoItem): Promise<TodoItem> {
        logger.info(`Creating todo with id ${todo.todoId}`)
        await this.docClient.put({
            TableName: this.todoTable,
            Item: todo
        }).promise()
        return todo 
    }

    async updateTodo(todo: TodoUpdate, todoId: string, userId: string): Promise<TodoUpdate>{
        var params = {
            TableName: this.todoTable,
            Key: {
                todoId: todoId,
                userId: userId
            },
            ExpressionAttributeNames: {
                "#NM": "name",
                "#DD": "dueDate",
                "D": "done"
            },
            ExpressionAttributeValues: {
                ":name" : {
                    S: todo.name
                },
                ":dueDate": {
                    S: todo.dueDate
                },
                ":done": {
                    BOOL: todo.done
                }
            },
            UpdateExpression: "SET #NM = :name, #DD = :dueDate, #D = :done"
        }

        return await this.docClient.update({
            params
        }).promise()
    }

    async deleteTodo(userId: string, todoId: string) {
        await this.docClient.delete({
            TableName: this.todoTable,
            Key: {
                userId: userId,
                todoId: todoId
            }
        })
    }
}