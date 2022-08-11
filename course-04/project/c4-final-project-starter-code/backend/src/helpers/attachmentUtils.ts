import * as AWS from 'aws-sdk'
// import * as AWSXRay from 'aws-xray-sdk'

// const XAWS = AWSXRay.captureAWS(AWS)

const s3 = new AWS.S3({
    signatureVersion: 'v4'
})

const imageBucket = process.env.ATTACHMENT_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION


// TODO: Implement the fileStogare logic
export class AttachmentUtils {
    async createAttachmentPresignedUrl(todoId :string) {
     const url = s3.getSignedUrl('putObject', {
                     Bucket: imageBucket,
 
                     Key: todoId,
                     Expires: parseInt(urlExpiration)
                 })
     return url
    }
 
 }