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

// aws/lambdas/bookEvent.ts
var bookEvent_exports = {};
__export(bookEvent_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(bookEvent_exports);
var import_client_dynamodb = require("@aws-sdk/client-dynamodb");
var client = new import_client_dynamodb.DynamoDBClient({});
var handler = async (event) => {
  try {
    const { eventId, userId } = JSON.parse(event.body || "{}");
    if (!eventId || !userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing eventId or userId" })
      };
    }
    const command = new import_client_dynamodb.TransactWriteItemsCommand({
      TransactItems: [
        {
          Update: {
            TableName: "Events",
            // <-- Use your actual table name
            Key: { eventId: { S: eventId } },
            ConditionExpression: "seatsRemaining > :zero",
            UpdateExpression: "SET seatsRemaining = seatsRemaining - :one",
            ExpressionAttributeValues: {
              ":one": { N: "1" },
              ":zero": { N: "0" }
            }
          }
        },
        {
          Put: {
            TableName: "Registrations",
            // <-- Use your actual table name
            Item: {
              userId: { S: userId },
              eventId: { S: eventId }
            },
            ConditionExpression: "attribute_not_exists(eventId)"
            // eventId as sort key
          }
        }
      ]
    });
    await client.send(command);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Booking confirmed" })
    };
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: err.message })
    };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
//# sourceMappingURL=bookEvent.js.map
