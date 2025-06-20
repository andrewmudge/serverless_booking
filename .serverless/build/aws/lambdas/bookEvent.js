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
var SENDER_EMAIL = process.env["SENDER_EMAIL"];
var handler = async (event) => {
  try {
    const { eventId, userId, userEmail, title, day, time } = JSON.parse(event.body || "{}");
    if (!eventId || !userId || !userEmail || !title || !day || !time) {
      console.error("Missing required fields:", { eventId, userId, userEmail, title, day, time });
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: "Missing eventId, userId, userEmail, title, day, or time" })
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
    const emailBody = `Thank you for registering for ${title} on ${day} at ${time}. Your booking is confirmed.`;
    const emailCommand = new import_client_ses.SendEmailCommand({
      Source: SENDER_EMAIL,
      Destination: {
        ToAddresses: [userEmail]
      },
      Message: {
        Subject: { Data: "Event Registration Confirmation" },
        Body: {
          Text: { Data: emailBody }
        }
      }
    });
    console.log("Sending SES email:", {
      to: userEmail,
      from: SENDER_EMAIL,
      subject: "Event Registration Confirmation",
      body: emailBody
    });
    try {
      await ses.send(emailCommand);
      console.log("SES email sent successfully");
    } catch (sesErr) {
      console.error("SES send error:", sesErr);
      throw sesErr;
    }
    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: "Booking confirmed and email sent" })
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error occurred";
    console.error("Lambda error:", message, err);
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
