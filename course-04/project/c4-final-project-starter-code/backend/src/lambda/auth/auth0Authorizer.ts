import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
// import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
// const jwksUrl = 'https://dev-p2daq5pt.us.auth0.com/.well-known/jwks.json'
const cert = `-----BEGIN CERTIFICATE-----
MIIDDTCCAfWgAwIBAgIJfXhHwZCRBPB5MA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
BAMTGWRldi1wMmRhcTVwdC51cy5hdXRoMC5jb20wHhcNMjIwODAxMTYzNTA5WhcN
MzYwNDA5MTYzNTA5WjAkMSIwIAYDVQQDExlkZXYtcDJkYXE1cHQudXMuYXV0aDAu
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0Ityh4R3R+56IllU
nCszdAxoD9Y/dPdPLQRCjZNnn810GdkNlT9FkUxo5QvywJTNutsBcA0VSY5hNdul
AsJ6tQ1bw6FiNShFm1yR4Y1yiqr6rtZNoe4YIKR+R8coYYACQkpEoxbclyKbFsNd
cHYw5DIeP+KutvwTU++DHDJa/CMI7fSPG+MdFza6cZsdPSBHShiTqcn5Y86u8sDQ
xybb6hjR3b3h9ktEUlMBuHEc7y5eUTJlPKZQjXQ1lKflq0ZNjoiUO6DBr6jPm3cB
4ubzLG3Z3oBIawbFgagsc5tjhrFqYElBdXSv0BxxSXFCjL9ZEtFYclRfIEv/lekM
hxMjDQIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBTBGQ/3C52F
2vrbYFuEAVWsy85/DDAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
AG4Ojd/nrKXvilHqDbIXmQ4Y5Ien/sQBx3XKq8gk4aeKTAwhViSQR9KN6a4x9Vj3
FcS1I5+QOKrFqA0ShVzwryKI+pGjFfCrUkaIjk4MdpIpqmZDnIwejggNwgLzVdU3
NaHJKcgl6OiGfsdXIo1lhGCT2ejkksVqcY+p4xZZZb3C9un7OzQD3wO8qgNA2ksZ
vcsBzp4PeKkT0ftvb3Ssjrcsi0sD9RsrSWjVBnfHLWigJhO9z1HH2Uzkzyi7/KX0
v/lM8K0bXjKI6vbzBtCyYUo4l07kykgcDHacKv1AVKJgZqF/pM133rYxJ1AKZSqU
d7ZBk9PTxnZ8xxIc5CgeLTM=
-----END CERTIFICATE-----`

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  return verify(token, cert, {algorithms: [jwt.header.alg.toString()] }) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
