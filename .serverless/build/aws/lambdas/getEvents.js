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

// aws/lambdas/getEvents.ts
var getEvents_exports = {};
__export(getEvents_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(getEvents_exports);
var import_client_dynamodb = require("@aws-sdk/client-dynamodb");
var import_lib_dynamodb = require("@aws-sdk/lib-dynamodb");
var client = new import_client_dynamodb.DynamoDBClient({ region: "us-east-1" });
var docClient = import_lib_dynamodb.DynamoDBDocumentClient.from(client);
var TABLE_NAME = "Events";
var handler = async () => {
  try {
    const command = new import_lib_dynamodb.ScanCommand({ TableName: TABLE_NAME });
    const response = await docClient.send(command);
    console.log("Items:", response.Items);
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(response.Items)
    };
  } catch (error) {
    console.error("\u274C Lambda failed:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Requested resource not found" })
    };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
//# sourceMappingURL=getEvents.js.map
