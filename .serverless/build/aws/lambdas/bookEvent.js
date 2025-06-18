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
var import_client_ses = require("@aws-sdk/client-ses");
var client = new import_client_dynamodb.DynamoDBClient({});
var ses = new import_client_ses.SESClient({});
var SENDER_EMAIL = process.env.SENDER_EMAIL;
var handler = async (event) => {
  try {
    const { eventId, userId, userEmail } = JSON.parse(event.body || "{}");
    if (!eventId || !userId || !userEmail) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: "Missing eventId, userId, or userEmail" })
      };
    }
    const command = new import_client_dynamodb.TransactWriteItemsCommand({
      TransactItems: [
        {
          Update: {
            TableName: process.env.EVENTS_TABLE,
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
            TableName: process.env.BOOKINGS_TABLE,
            Item: {
              userId: { S: userId },
              eventId: { S: eventId }
            },
            ConditionExpression: "attribute_not_exists(eventId)"
          }
        }
      ]
    });
    await client.send(command);
    const emailCommand = new import_client_ses.SendEmailCommand({
      Source: SENDER_EMAIL,
      Destination: {
        ToAddresses: [userEmail]
        // Send to the user who registered
      },
      Message: {
        Subject: { Data: "Event Registration Confirmation" },
        Body: {
          Text: {
            Data: `Thank you for registering for event ${eventId}! Your booking is confirmed.`
          }
        }
      }
    });
    await ses.send(emailCommand);
    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: "Booking confirmed and email sent" })
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error occurred";
    return {
      statusCode: 400,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: message })
    };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
//# sourceMappingURL=bookEvent.js.map
