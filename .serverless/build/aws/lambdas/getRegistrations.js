"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// aws/lambdas/getRegistrations.ts
var getRegistrations_exports = {};
__export(getRegistrations_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(getRegistrations_exports);
var import_client_dynamodb = require("@aws-sdk/client-dynamodb");
var client = new import_client_dynamodb.DynamoDBClient({ region: process.env.AWS_REGION || "us-east-1" });
var REGISTRATIONS_TABLE = process.env.BOOKINGS_TABLE || "Registrations";
var USER_ID_INDEX = process.env.USER_ID_INDEX || "userId-index";
var handler = async (event) => {
  try {
    const userId = event.queryStringParameters?.userId;
    if (!userId) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: "Missing userId" })
      };
    }
    const command = new import_client_dynamodb.QueryCommand({
      TableName: REGISTRATIONS_TABLE,
      IndexName: USER_ID_INDEX,
      KeyConditionExpression: "userId = :uid",
      ExpressionAttributeValues: {
        ":uid": { S: userId }
      },
      ProjectionExpression: "eventId"
    });
    const result = await client.send(command);
    const eventIds = (result.Items || []).map((item) => item.eventId.S);
    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ eventIds })
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error occurred";
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: message })
    };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
//# sourceMappingURL=getRegistrations.js.map
