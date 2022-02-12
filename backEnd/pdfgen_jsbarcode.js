 //Required package
 var pdf = require("pdf-creator-node");
 var fs = require("fs");
 const {
     pathToFileURL
 } = require("url");
 const JsBarcode = require("jsbarcode");

 module.exports = async function genPdf(code, forceOverwrite) {
     filePath = pathToFileURL(`repo/pdf/${code}.pdf`).toString();

     filePath = filePath.substring(7);

     console.log(`PDFfile now = [${filePath}]`);


     if (!forceOverwrite && fs.existsSync(filePath)) {
         console.log(`${filePath} already exists, exiting...`);
         return filePath;
     }


     // Read HTML Template
     var html = fs.readFileSync("./pdfTemplate_jsbarcode.htm", "utf8");

     console.log("creating canvas");
     const {
         DOMImplementation,
         XMLSerializer
     } = require('xmldom');
     const xmlSerializer = new XMLSerializer();
     const doc = new DOMImplementation().createDocument('http://www.w3.org/1999/xhtml', 'html', null);
     const svgNode = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');

     JsBarcode(svgNode, code, {
         xmlDocument: doc,
         displayValue: false
     });

     const svgText = xmlSerializer.serializeToString(svgNode);

     //console.log(svgText);


     var options = {
         format: "A5",
         orientation: "landscape",
         border: "10mm"
     };
     options = {
         height: "5in",
         width: "10in",
         border: "2mm"
     };

     var document = {
         html: html.replace('{{base64_Image}}', svgText),
         data: {
             Code: code,
             //base64_Image: svgText
         },
         path: filePath,
     };

     console.log('creating pdf...');

     var pdfPromise = pdf.create(document, options);

     await Promise.all([pdfPromise]);

     return filePath;
 };