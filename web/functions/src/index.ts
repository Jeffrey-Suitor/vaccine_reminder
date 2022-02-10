import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
admin.initializeApp();
const db = admin.firestore();

import * as path from "path";
import * as os from "os";
import * as fs from "fs";
import * as XLSX from "xlsx";

const loc = "generalremindersender.appspot.com";

exports.addSheet = functions.storage
    .bucket(loc)
    .object()
    .onFinalize(async (object) => {
      // Get info
      const fileBucket = object.bucket; // The Storage bucket
      const filePath = object.name; // File path in the bucket.
      const userId = object.metadata?.userId || "0";

      if (filePath === undefined) {
        throw new ReferenceError("Filepath is undefined.");
      }

      // Setup file path
      const fileName = path.basename(filePath);
      const bucket = admin.storage().bucket(fileBucket);
      const tempFilePath = path.join(os.tmpdir(), fileName);

      // Download file
      await bucket
          .file(filePath)
          .download({destination: tempFilePath, validation: false});

      functions.logger.log("EXCEL DOWNLOADED TO", tempFilePath);

      const wb = XLSX.readFile(tempFilePath);
      wb.SheetNames.forEach(async (sheetName) => {
        const sheetId = `${path.parse(tempFilePath).base}>${sheetName}`;
        const sheet = wb.Sheets[sheetName];
        const arr: string[][] = XLSX.utils.sheet_to_json(
            sheet,
            {blankrows: false, header: 1});

        const maxLength = Math.max.apply(
            null,
            arr.map(function(o: Array<string>) {
              return o.length;
            }
            ));

        db.doc(`/users/${userId}/sheets/${sheetId}`).set({
          bottom: arr.length,
          left: 1,
          maxBottom: arr.length,
          maxRight: maxLength,
          originalArrayString: JSON.stringify(arr),
          right: maxLength,
          sheetId: sheetId,
          top: 1,
          uniqueIdCol: 1,
          parsedData: {},
        });

        const userDoc = await db.doc(`/users/${userId}`).get();
        if (!userDoc.exists) {
          db.doc(`/users/${userId}`).set({
            userId: userId,
            savedSheets: [],
            sheets: admin.firestore.FieldValue.arrayUnion(sheetId),
            activeSheet: sheetId},
          {merge: true});
        } else {
          db.doc(`/users/${userId}`).set({
            sheets: admin.firestore.FieldValue.arrayUnion(sheetId),
            activeSheet: sheetId},
          {merge: true});
        }
        functions.logger.log(
            `USER: ${userId} - Created spreadsheet with sheetId: ${sheetId}`);
      });

      return fs.unlinkSync(tempFilePath);
    });
