// Instances
var storage = firebase.storage();
storage.useEmulator("localhost", 9199);
var db = firebase.firestore();
var storage_ref = storage.ref();
var user_id = 0;
const active_sheet_ref = db.doc(`/users/${user_id}/sheets/active_sheet`);
const user_doc_ref = db.doc(`/users/${user_id}`);

// Elements
const sheet_selector = document.getElementById("sheet-selector");
const sheet_selector_add = document.getElementById("sheet-selector-add");
const sheet_selector_complete = document.getElementById("sheet-selector-complete");
const sheet_selector_container = document.getElementById("sheet-selector-container");

const stage_1 = document.getElementById("stage-1");
const stage_2 = document.getElementById("stage-2");
    //
const controls_container = document.getElementById("controls")
const header_input_ref = document.getElementById("controls-inputs-header");
const right_input_ref = document.getElementById("controls-inputs-right");
const left_input_ref = document.getElementById("controls-inputs-left");
const bot_input_ref = document.getElementById("controls-inputs-bot");
const uidcol_input_ref = document.getElementById("controls-inputs-uidcol");

const hide_unselected = document.getElementById("controls-toggles-hideunselected");
const hide_preview = document.getElementById("controls-toggles-preview");

const active_data = document.getElementById("active-data");
const preview = document.getElementById("preview");

const file_input = document.getElementById("file-input");
const file_drop_zone = document.getElementById("file-drop-zone");

// Functions
var change_sheet = firebase.functions().httpsCallable('change_sheet');

// Helper functions
function get_radio_value(name) {
    var ele = document.getElementsByName(name);
    for(i = 0; i < ele.length; i++) {
        if(ele[i].checked) {
            return ele[i].value;
        }
    }
}
////////////// Listerners ////////////////////

// Sheet watcher
file_input.addEventListener('change', (e) => {
    var files = e.target.files;
    var f = files[0];
    var ref = storage_ref.child(f.name)
    var metadata = {
        customMetadata: {
            "user_id": user_id
        }
    };
    ref.put(f, metadata).then((snap) => {
        console.log("Uploaded a snapshot");
        file_drop_zone.disabled = true;
        stage_1.hidden = true;
        stage_2.hidden = false;
        sheet_selector.hidden = false;
    });
});


//Update the current view with info from the db
active_sheet_ref.onSnapshot(async (doc) => {
    if (doc.exists) {
        const data = await doc.data()
        const inputs = data.control_inputs;

        active_data.innerHTML = data.current_view;
        preview.innerHTML = data.next_view;
        preview.hidden = data.control_toggles.hide_preview;

        uidcol_input_ref.value = inputs.uidcol.toString()
        header_input_ref.value = inputs.header.toString();
        right_input_ref.value = inputs.right.toString();
        bot_input_ref.value = inputs.bot.toString();
        left_input_ref.value = inputs.left.toString();

        header_input_ref.max = inputs.max_bot;
        right_input_ref.max = inputs.max_right;
        bot_input_ref.max = inputs.max_bot;
        left_input_ref.max = inputs.max_right;

        const unselected = document.querySelectorAll('.unselected');
        unselected.forEach(element => {
            element.style.visibility = data.control_toggles.hide_unselected ? 'hidden' : 'visible';
            element.style.border = data.control_toggles.hide_unselected ? 'none' : '1px solid black';
        });
    }
});


// Input watcher
controls_container.addEventListener('change', () => {

    var uidcol = parseInt(uidcol_input_ref.value) || 1;
    var header = parseInt(header_input_ref.value) || 1;
    var right = parseInt(right_input_ref.value) || 999999;
    var bot = parseInt(bot_input_ref.value) || 999999;
    var left = parseInt(left_input_ref.value) || 1;
    const max_right = parseInt(right_input_ref.max) || 999999;
    const max_bot = parseInt(bot_input_ref.max) || 999999;

    // Check to make sure we don't exceed values
    if (header > max_bot  ) { header = max_bot;   }
    if (right  > max_right) { right  = max_right; }
    if (bot    > max_bot  ) { bot    = max_bot;   }
    if (left   > max_right) { left   = max_right; }

    // Make sure we can't accidently hide things
    if (right < left  ) { right = left;   }
    if (bot   < header) { bot   = header; }

    // Fix the unique id column
    if (uidcol < left) { uidcol = left; }

    // Update the previous values
    uidcol_input_ref.value = uidcol.toString();
    header_input_ref.value = header.toString();
    right_input_ref.value = right.toString();
    bot_input_ref.value = bot.toString();
    left_input_ref.value = left.toString();

    const controls_object = {
        control_inputs: {
            uidcol: uidcol,
            header: header,
            right: right,
            bot: bot,
            left: left,
            max_right: max_right,
            max_bot: max_bot
        },
        control_toggles: {
            hide_unselected: hide_unselected.checked,
            hide_preview: hide_preview.checked,
            merge_direction: get_radio_value("controls-toggles-mergedirection")
        }
    }

    active_sheet_ref.set(controls_object, {merge: true});
});

user_doc_ref.onSnapshot(async (doc) => {
    if (doc.exists) {
        const data = doc.data();
        const identifier_class = "sheet-selectable"

        if (!data.sheet_list) { return; }

        var items_to_remove = document.getElementsByClassName(identifier_class)
        if (items_to_remove.length > 0) {
            for (let i = 0, len = items_to_remove.length; i < len; i++) {
               items_to_remove[i].remove() 
            }
        }

        data.sheet_list.forEach((sheet_name) => {
            var sheet_link = document.createElement("a")
            sheet_link.innerHTML = sheet_name
            sheet_link.style.cursor = "pointer";
            sheet_link.classList.add(identifier_class)
            sheet_link.id = sheet_name
            sheet_link.addEventListener('click', (e) => { 
                e.stopPropagation();
                change_sheet({new_sheet_id: e.target.id, user_id: user_id});
                var active_to_remove = document.getElementsByClassName(`${identifier_class}-active`);
                if (active_to_remove) { active_to_remove.remove(); }
                e.target.classList.add(`${identifier_class}-active`)
            });
            sheet_selector_container.insertBefore(sheet_link, sheet_selector_container.firstChild);
        });
    }
});

sheet_selector_add.addEventListener('click', (e) => { 
    e.stopPropagation();
    document.getElementById('file-input').click();
});
