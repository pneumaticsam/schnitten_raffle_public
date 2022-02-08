function doGet() {

    const response = [{
        name: "This is a test"
    }];

    return ContentService.createTextOutput()
        .append(JSON.stringify(response))
        .setMimeType(ContentService.MimeType.JSON);

}

function doPost(e) {

    schemaSample = {
        sheetName: "raffleChecks",
        operation: "insert|update|upsert",
        refColumn: "id_column_name",
        headers: "obj_id,customer_id,raffle_code,check_time,cat,name,phone, address, zipcode",
        data: {
            "1-I": "5653383, 787833, DH769JNkd789, 67323323",
            "2-U": "5653383, 787833, DH769JNkd789, 67323323",
            "3-I": "5653383, 787833, DH769JNkd789, 67323323"
        }
    }

    var lock = LockService.getDocumentLock();
    try {

        //log(e);

        let body = e ? e.postData.contents : null;

        //log(body);

        const bodyJSON = JSON.parse(body);

        log("CONSOLE...BODY PARSED AS...");
        log(bodyJSON);

        lock.waitLock(30000);

        let ws = getWorksheet(bodyJSON.sheetName);

        let headers = ws.getLastColumn() > 1 ? ws.getRange(1, 1, 1, ws.getLastColumn()).getValues()[0] : [];

        if (headers.length === 0) {
            headers = bodyJSON.headers.split(',')
            let headers2insert = bodyJSON.headers.split(',');
            headers2insert.unshift("_id");
            ws.appendRow(headers2insert)
            log(headers);
        }


        let maxID = getMaxID_(ws);
        let ikount = 0,
            ukount = 0;
        const inserted_ids = [],
            updated_ids = [];

        for (const index in bodyJSON.data) {
            if (Object.hasOwnProperty.call(bodyJSON.data, index)) {
                const item = bodyJSON.data[index];
                let rowData = item.split(',');

                if (index.split('-')[1] == "I") {

                    rowData.unshift(++maxID);

                    ws.appendRow(rowData);

                    //i[maxID] = rowData[1];
                    inserted_ids.push({
                        _id: maxID,
                        id: rowData[1]
                    });
                    ikount++;
                } else {
                    try {
                        let id = rowData[0];

                        // Creates  a text finder for the ID COLUMN.
                        var textFinder = ws.getRange(2, 2, ws.getLastRow(), 2).createTextFinder(id);
                        log(`looking for '${id}' in the range: 2,2,${ws.getLastRow()},2`);

                        // Returns the first occurrence of 'dog'.
                        var hit = textFinder.findNext();
                        log(`id found at ${hit.getRow()}, ${hit.getColumn()}`);
                        if (hit) {
                            //select the relevante row
                            var rnum = hit.getRow();
                            var row = ws.getRange(rnum, 2, 1, rowData.length);

                            log(`range is ${row.getA1Notation()}`);

                            row.setValues([rowData]);

                            updated_ids.push({
                                _id: ws.getRange(rnum, 1).getValue(),
                                id: id
                            });
                            ukount++;
                        } else {
                            log(`row with id '${id}' not found for update`);
                        }
                    } catch (ex) {
                        log(ex);
                    }
                }
            }
        }
        lock.releaseLock();
        log(JSON.stringify(inserted_ids));
        log(ikount + ' rows inserted');
        log(ukount + ' rows updated');

        return getJSONResponse({
            inserted_rows: ikount,
            updated_rows: ukount,
            inserted: inserted_ids,
            updated: updated_ids
        });
    } catch (err) {
        log(err);
        throw err;
    }

}

function getMaxID_(ws) {
    if (ws.getLastRow() > 1) {
        const range = ws.getRange(2, 1, ws.getLastRow() - 1, ws.getLastColumn())
        if (range.getHeight() > 0) {
            range.sort(1);
        }
    }

    var lastCell = ws.getRange(ws.getLastRow(), 1);

    return lastCell.getRow() == 1 ? 0 : lastCell.getValue();
}

function getJSONResponse(json_or_json_tring) {
    //return JSON.stringify(json_or_json_tring);
    return ContentService.createTextOutput()
        .append(JSON.stringify(json_or_json_tring))
        .setMimeType(ContentService.MimeType.JSON);

}

function log(info) {
    let ws = getWorksheet("Logging");
    ws.appendRow([new Date().getTime(), info]);
}

function getWorksheet(name) {
    let ss = SpreadsheetApp.getActiveSpreadsheet();
    let ws = ss.getSheetByName(name);
    if (!ws) {
        ws = ss.insertSheet(name);
    }
    return ws;
}