// src/DynamoService.js
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoClient } from "./aws-config";

export const fetchDynamoData = async (TableName) => {
    try {
        const command = new ScanCommand({ TableName });
        const result = await dynamoClient.send(command);
        return result.Items || [];
    } catch (err) {
        console.error("DynamoDB Scan Error:", err);
        return [];
    }
};