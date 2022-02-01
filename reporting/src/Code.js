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
            1: "5653383, 787833, DH769JNkd789, 67323323",
            2: "5653383, 787833, DH769JNkd789, 67323323",
            3: "5653383, 787833, DH769JNkd789, 67323323"
        }
    }

    var lock = LockService.getDocumentLock();
    try {

        log(e);

        let body = e ? e.postData.contents : null;

        log(body);

        const bodyJSON = JSON.parse(body);

        Logger.log("BODY PARSED AS...");

        Logger.log(bodyJSON);

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
        let kount = 0;
        const inserted_ids = [];

        for (const index in bodyJSON.data) {
            if (Object.hasOwnProperty.call(bodyJSON.data, index)) {
                const item = bodyJSON.data[index];
                let rowData = item.split(',');

                //this could result in duplicate entries for concurrent 
                //transactions but this is not critical
                rowData.unshift(++maxID);

                ws.appendRow(rowData);
                inserted_ids.push(maxID);
                kount++;
            }
        }
        lock.releaseLock();
        log(kount + ' rows inserted');

        return getJSONResponse({
            affected_rows: kount,
            inserted: inserted_ids
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