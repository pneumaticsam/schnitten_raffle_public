function doGet() {

    const response = [{
        name: "This is a test"
    }];

    return ContentService.createTextOutput()
        .append(JSON.stringify(response))
        .setMimeType(ContentService.MimeType.JSON);

}


function doPost(e) {

    schema = {
        sheetName: "raffleChecks",
        operation: "insert|update|upsert",
        refColumn: "id_column_name",
        headers: "obj_id,customer_id,raffle_code,check_time,cat,name,phone, address, zipcode",
        data: {
            1: "5653383, 787833, DH769JNkd789, 67323323",
            2: "5653383, 787833, DH769JNkd789, 67323323",
            3: "5653383, 787833, DH769JNkd789, 67323323",
        }
    }

    try {

        let body = e.postData.contents;
        body = '{ \
        "sheetName": "raffleChecks", \
        "operation": "insert|update|upsert", \
        "refColumn": "id_column_name", \
        "headers": "obj_id,customer_id,raffle_code,check_time,cat,name,phone, address, zipcode", \
        "data": { \
            "1": "5653383, cus_787833, DH769JNkd789, 2021-12-23 12:24:2121, A,Sylvester Chukwu,0803851334,25b Dopemu Street,23401",\
            "2": "5653384, cus_787833, DH769JNkd783, 2021-12-23 12:31:5151",\
            "3": "5653387, cus 787833, DH769JNkd750, 2021-12-23 02:40:0404, D,Obiora Obi,08038511402,2b Eloseh Street,23401"\
        }\
}';
        console.log(body);

        const bodyJSON = JSON.parse(body);

        const ss = SpreadsheetApp.getActiveSpreadsheet();
        let ws = ss.getSheetByName(bodyJSON.sheetName);
        if (!ws) {
            ws = ss.insertSheet(bodyJSON.sheetName);
        }

        let headers = ws.getLastColumn() > 1 ? ws.getRange(1, 1, 1, ws.getLastColumn()).getValues()[0] : [];

        if (headers.length === 0) {
            headers = bodyJSON.headers.split(',')
            let headers2insert = bodyJSON.headers.split(',');
            headers2insert.unshift("_id");
            ws.appendRow(headers2insert)
            Logger.log(headers);
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


        Logger.log(ss.getUrl());
        Logger.log(kount + ' rows inserted');

        return {
            affected_rows: kount,
            inserted: inserted_ids
        };
    } catch (err) {
        throw err;
    }

}

function getMaxID_(ws) {
    var lastCell = ws.sort(1).getRange(ws.getLastRow(), 1);

    return lastCell.getRow() == 1 ? 0 : lastCell.getValue();
}