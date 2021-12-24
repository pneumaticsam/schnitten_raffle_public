 //Required package
var pdf = require("pdf-creator-node");
var fs = require("fs");
var moment = require("moment");
const { string } = require("joi");
const { pathToFileURL } = require("url");

module.exports = async function genPdf(code, serial, force) {
  file = pathToFileURL(`repo/pdf/${code}.pdf`).toString();
  console.log(`PDFfile = [${file}]`);

  file=file.substring(7);

  console.log(`PDFfile now = [${file}]`);


  if (!force && fs.existsSync(file)) {
    console.log(`${file} already exists, exiting...`);
    return file;
  }
  // Read HTML Template
  var html = fs.readFileSync("./pdfTemplate.htm", "utf8");

  //"format": "Letter", // allowed units: A3, A4, A5, Legal, Letter, Tabloid "orientation": "portrait", // portrait or landscape

  var options = { format: "A5", orientation: "landscape", border: "10mm" };
  options = { height: "5in", width: "12in", border: "2mm" };

  var document = {
    html: html,
    data: {
      Code: code,
      Serial: serial ?? moment().format("ssyyyyHHMMmmhhDD"),
    },
    path: file,
  };

  console.log('aBOUT TO CREATE...');

  var pdfPromise = pdf.create(document, options);

  var thePromises = await Promise.all([pdfPromise]);

  console.log(thePromises);
  // .then((res) => {
  //   console.log(res);
  //   //return res;
  // })
  // .catch((error) => {
  //   console.error(error.error);
  //   //return null;
  // });
  return file;
};
