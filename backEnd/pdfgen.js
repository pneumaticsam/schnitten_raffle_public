 //Required package
var pdf = require("pdf-creator-node");
var fs = require("fs");
const { pathToFileURL } = require("url");
const { SymbologyType, createStream } = require("symbology");


module.exports = async function genPdf(code, forceOverwrite) {
  filePath = pathToFileURL(`repo/pdf/${code}.pdf`).toString();

  filePath=filePath.substring(7); 

  console.log(`PDFfile now = [${filePath}]`);


  if (!forceOverwrite && fs.existsSync(filePath)) {
    console.log(`${filePath} already exists, exiting...`);
    return filePath;
  }


  // Read HTML Template
  var html = fs.readFileSync("./pdfTemplate.htm", "utf8");
  
  var barCodeData;
  
  console.log("creating stream");
    barCodeData = await createStream({
      symbology: SymbologyType.CODE128,
      showHumanReadableText: false
    }, code)
    console.log("creating stream");

  var options = { format: "A5", orientation: "landscape", border: "10mm" };
  options = { height: "5in", width: "10in", border: "2mm" };

  var document = {
    html: html,
    data: {
      Code: code,
      base64_Image:barCodeData.data
    },
    path: filePath,
  };

  console.log('creating pdf...');

  var pdfPromise = pdf.create(document, options);

  await Promise.all([pdfPromise]);

  return filePath;
};
