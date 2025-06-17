// src/aws-config.js
import { Amplify } from 'aws-amplify';
import awsExports from './aws-exports';
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";

Amplify.configure(awsExports);

export const REGION = awsExports.aws_project_region;
const IDENTITY_POOL_ID = awsExports.aws_cognito_identity_pool_id;

export const dynamoClient = new DynamoDBClient({
    region: REGION,
    credentials: fromCognitoIdentityPool({
        identityPoolId: IDENTITY_POOL_ID,
        client: new CognitoIdentityClient({ region: REGION }),
    }),
});