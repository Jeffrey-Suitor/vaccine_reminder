const functions = require("firebase-functions");
const admin = require('firebase-admin');
admin.initializeApp()
const db = admin.firestore();

const spawn = require('child-process-promise').spawn;
const path = require('path');
const os = require('os');
const fs = require('fs');
const XLSX = require("xlsx");
'use strict';


 exports.add_sheet = functions.storage.bucket('generalremindersender.appspot.com').object().onFinalize(async (object) => {
    // Get info
    const fileBucket = object.bucket; // The Storage bucket that contains the file.
    const filePath = object.name; // File path in the bucket.
    const user_id = object.metadata.user_id;

    // Setup file path
    const fileName = path.basename(filePath);
    const bucket = admin.storage().bucket(fileBucket);
    const tempFilePath = path.join(os.tmpdir(), fileName);

    // Download file
    await bucket.file(filePath).download({destination: tempFilePath, validation: false});
    functions.logger.log('EXCEL DOWNLOADED TO', tempFilePath);

    var wb = XLSX.readFile(tempFilePath);
    wb.SheetNames.forEach(async (sheet_name) =>{
        var sheetId = `${path.parse(tempFilePath).base}>${sheet_name}`;
        var sheet = wb.Sheets[sheet_name];
        var array = XLSX.utils.sheet_to_json(sheet, {blankrows: false, header: 1});
        
        // Get the max length
        var max_length = 0;
        for (let row of array) {
            if (row.length > max_length) {
                max_length = row.length;
            }
        }
        console.log(max_length)

        db.doc(`/users/${user_id}/sheets/${sheetId}`).set({
            sheetId: sheetId,
            originalArray: JSON.stringify(array),
            top: 1,
            right: max_length,
            bottom: array.length,
            left: 1,
            uniqueIdCol: 1,
            maxRight: max_length,
            maxBottom: array.length,
        });

        const user_doc = await db.doc(`/users/${user_id}`).get();
        if (!user_doc.exists) {
            db.doc(`/users/${user_id}`).set({ userId: user_id, savedSheets: [], sheets: admin.firestore.FieldValue.arrayUnion(sheetId), activeSheet: sheetId}, {merge: true});
        } else {
            db.doc(`/users/${user_id}`).set({ sheets: admin.firestore.FieldValue.arrayUnion(sheetId), activeSheet: sheetId }, {merge: true});

        }
        functions.logger.log(`USER: ${user_id} - Created spreadsheet with sheetId: ${sheetId}`);
    });

     return fs.unlinkSync(tempFilePath);
 });


// // Convert 2D array to HTML Table
// function get_table(data, control_inputs={}) {

//     const header = control_inputs.header || 1;
//     const bot = control_inputs.bot || 999999;
//     const right = control_inputs.right || 999999;
//     const left = control_inputs.left || 1;

//     var max_col = null;
//     let result = ['<table border=1>'];
//     for (let i = 0, len = data.length; i < len; i++) {
//         result.push('<tr>');
//         result.push(`<td class="row-indicator">${i+1}</td>`); // Add the row indicator
//         for (let j = 0, jlen = data[i].length; j <jlen; j++) {
//             if (jlen > max_col) {max_col = jlen;} // Get max cols
//             if (i+1 < header || i+1 > bot || j+1 < left || j+1 > right){
//                 result.push(`<td class="unselected">${data[i][j]}</td>`);
//             } else if (i+1 === header){
//                 result.push(`<td class="header">${data[i][j]}</td>`);
//             } else {
//                 result.push(`<td>${data[i][j]}</td>`);
//             }

//         }
//         result.push('</tr>');
//     }
//     result.push('</table>');

//     // Add the column indicator
//     var column_indicator_array = []
//     column_indicator_array.push("<tr>");
//     for (i = 0; i < max_col+1; i++) {
//         if (i === 0 ) {
//             column_indicator_array.push('<td></td>');
//         } else {
//             column_indicator_array.push(`<td class="column-indicator">${i}</td>`);
//         }
//     }
//     result.splice(1, 0, column_indicator_array)
//     return result.flat().join('\n');
// }

function parse_data(data, control_inputs, control_toggles) {
    // Index back to 0
    const values_to_strip = [null, undefined];
    const left = control_inputs.left - 1;
    const header_num = control_inputs.header -1;
    const uidcol = control_inputs.uidcol - control_inputs.left;

    const header = data[header_num].splice(left, control_inputs.right);
    const merge_direction = control_toggles.merge_direction;
    const partial_preview_array = data.slice(control_inputs.header, control_inputs.bot)

    var preview_array = [];
    for (let i = 0; i < partial_preview_array.length; i++) {
        preview_array.push(partial_preview_array[i].splice(left, control_inputs.right));
    }

    if (merge_direction === "up") {preview_array = preview_array.reverse()};

    // Generate the final array
    var unique_row = [];
    var saved_values = [];
    var final_array = [];
    for (let i = 0; i < preview_array.length; i++) {
        if (preview_array[i][uidcol] !== null) {
            if (unique_row.length === 0) {
                unique_row = preview_array[i];
            } else {
                final_array.push(merge_rows(unique_row, saved_values, values_to_strip))
                saved_values = [];
                unique_row = preview_array[i];
            }
        } else {
            saved_values.push(preview_array[i]);
        }

        // If last iteration
        if (i === preview_array.length - 1) {
            final_array.push(merge_rows(unique_row, saved_values, values_to_strip));
        }
    }

    var objects_array = [];
    var user_array = [];
    for (let i = 0; i < final_array.length; i++) {
        user_array = [];
        for (let j = 0; j < final_array[i].length; j++) {
            if (!values_to_strip.includes(header[j])) {
                user_array.push([header[j], final_array[i][j]]);
            }
        }
        objects_array.push([final_array[i][uidcol], Object.fromEntries(user_array)]);
    }

    return Object.fromEntries(objects_array);
}


// Merge rows together
function merge_rows(main, other_rows=[], values_to_strip=[null, undefined]) {
    var output_array = [];
    var combined_array = [];
    for (let i = 0; i < main.length; i++) {
        combined_array = values_to_strip.includes(main[i]) ? [] : [ strip(main[i]) ];
        for (let j = 0; j < other_rows.length; j++) {
            if (!values_to_strip.includes(strip(other_rows[j][i]))) {
                combined_array.push(other_rows[j][i]);
            }
        }

        if (combined_array.length === 0) {
            continue
        }
        else if (combined_array.length === 1) { // Only one value
            output_array.push(combined_array[0]);
        } else {
            output_array.push(combined_array);
        }
    }
    return output_array;
}


// Strip extra whitespace
function strip(value) {
    if (value) {
        return value.toString().trim()
    }
}

// function get_preview(object_objects) {
//     var next_view_html =['<div class="next_view">'];
//     Object.keys(object_objects).forEach((key) => {
//         const top_obj = object_objects[key]
//         next_view_html.push('<div class="card">');
//         next_view_html.push(`<h1>${key}</h1>`);
//         next_view_html.push('<ul>');
//         Object.keys(top_obj).forEach((prop) => {
//             next_view_html.push(`<li>${prop}: ${top_obj[prop]}</li>`);

//         });
//         next_view_html.push('</ul>');
//         next_view_html.push('</div>')

//     })
//     next_view_html.push("</div>");
//     return next_view_html.join('\n');
// }

// exports.update_spreadsheet_view = functions.firestore.document('/users/{user_id}/sheets/active_sheet')
//     .onUpdate(async (snap, _context) => {
//         const data = snap.after.data();
//         const original_array = JSON.parse(data.original_array);
//         const current_view = get_table(original_array, data.control_inputs);

//         snap.after.ref.update({
//             current_view: current_view
//         });

//         if (!data.control_inputs.hide_preview) {
//             const parsed_data = parse_data(original_array, data.control_inputs, data.control_toggles);
//             const next_view = get_preview(parsed_data);
//             snap.after.ref.update({
//                 parsed_data: parsed_data,
//                 next_view: next_view
//             });
//         }
//     });

// // Saves a message to the Firebase Realtime Database but sanitizes the text by removing swearwords.
// exports.change_sheet = functions.https.onCall(async (data, context) => {
//     const new_sheetId = data.new_sheetId;
//     const user_id = data.user_id;
//     const active_sheet_doc = await db.doc(`/users/${user_id}/sheets/active_sheet`).get();
//     const active_sheet_data = active_sheet_doc.data();

//     if (new_sheetId !== active_sheet_data.sheetId) {
//         const saved_sheet_doc = await db.doc(`/users/${user_id}/sheets/${new_sheetId}`).get();
//         const saved_sheet_data = saved_sheet_doc.data();
//         await db.doc(`/users/${user_id}/sheets/${active_sheet_data.sheetId}`).set(active_sheet_data);
//         await db.doc(`/users/${user_id}/sheets/active_sheet`).set(saved_sheet_data);
//     }
// });

