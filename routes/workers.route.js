const express = require('express');
const router = express.Router();
const Worker = require('../mongodb/Models/worker.js');
const Classes = require('../mongodb/Models/class.js');
const ClassResponsible = require('../mongodb/Models/classResponsible.js');
const PdfDetails = require('../mongodb/Models/PdfDetails.js')
const puppeteer = require('puppeteer');
const htmlToPdf = require('html-pdf')
const fs = require('fs');
const path = require('path');

// Middleware
const { isAdmin, isAuthenticated } = require('../auth/middleware.js');

// get All Workers
router.get('/', async (req, res) => {
  try {
    const workers = await Worker.find().populate('class')
                                       .populate('threeMonthFile')
                                       .populate('sixMonthfFile')
                                       .populate('yearfile')
                                       .populate('files');
    res.status(200).json(workers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Read a Single Worker
router.get('/:id', async (req, res) => {
  try{
    const { id } = req.params;
     const worker = await Worker.findOne({ _id: id }).populate('class');
     res.status(200).json(worker);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Read a Single Worker
router.get('/getWorkersByClass/:id', async (req, res) => {
  try{
    const { id } = req.params;
     const workers = await Worker.find({ class: id }).populate('class')
                                                     .populate('threeMonthFile')
                                                     .populate('sixMonthfFile')
                                                     .populate('yearfile')
                                                     .populate('files');
     res.status(200).json(workers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a Worker
router.post('/', isAdmin, async (req, res) => {
  try {
    let { firstName, lastName, number, email, personalId, workerClass, role, startDate } = req.body;

    // Manually check validation
    if (!firstName || !lastName || !number || !startDate || !email || !personalId || !workerClass || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    // Cut
    firstName = firstName.trim();
    lastName = lastName.trim();
    number = number.trim();
    email = email.trim();
    role = role.trim();

    const ifClassExist = await Classes.findOne({ workerClass });
    if (!ifClassExist) { return res.status(404).json({ message: "class not found" }); }

    const currentDate = new Date();
    const workerStartDate = new Date(startDate.year, startDate.month, startDate.day);
    const differenceInMillis = currentDate - workerStartDate;
    const differenceInDays = differenceInMillis / (1000 * 3600 * 24);
    const differenceInMonths = differenceInDays / 30.436875;

    let threeMonths = false;
    let sixMonths = false;
    let aYear = false;

    if (differenceInMonths >= 3) {
      threeMonths = true;
    }
    if (differenceInMonths >= 6) {
      sixMonths = true;
    }
    if (differenceInMonths >= 12) {
      aYear = true;
    }

    await Worker.validate({ firstName, lastName, number, startDate, email, personalId, class: workerClass, role, });
    const newWorker = await Worker.create({
      firstName,
      lastName,
      number,
      startDate,
      email,
      personalId,
      class: workerClass,
      role,
      threeMonthFile: { pdfDetail: null, ifCompleted: threeMonths},
      sixMonthfFile: { pdfDetail: null, ifCompleted: sixMonths},
      yearfile: { pdfDetail: null, ifCompleted: aYear},
    });

    res.status(200).json(newWorker);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a Worker
router.put('/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    let { firstName, lastName, number, startDate, email, personalId, workerClass, role } = req.body;

    // Manually check validation
    if (!firstName || !lastName || !number || !startDate || !email || !personalId || !workerClass || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    firstName = firstName.trim();
    lastName = lastName.trim();
    number = number.trim();
    email = email.trim();
    role = role.trim();

    const ifClassExist = await Classes.findOne({ workerClass });
    if (!ifClassExist) { 
      return res.status(404).json({ message: "Class not found" }); 
    }

    const updatedWorker = await Worker.findByIdAndUpdate({ _id: id } , 
      { firstName, lastName, number, startDate, email, personalId, class: workerClass, role }
      ,{ new: true })
    res.status(200).json(updatedWorker);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});  

// Delete a Worker
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const ifWorkerExist = await Worker.findOneAndDelete({ _id: id, });
    if (!ifWorkerExist) {
        return res.status(404).json({ message: "worker not found" });
    }
    res.status(200).json("worker deleted successfully");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route handler using the generatePDF function
router.post('/submitSurvey/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const formData = req.body;


    const findWorker = await Worker.findOne({ _id: id }).populate('class');
    if (!findWorker) { return res.status(404).json({ message: 'worker not exist' }) }

    const classResponsible = await ClassResponsible.findById(req.user._id).populate('class');
    if (!classResponsible) { return res.status(404).json({ message: 'class responsible not exist' }) }

    if (classResponsible.class._id.toString() !== findWorker.class._id.toString()) { return res.status(404).json({ message: 'worker and class responsible are not in the same class' }) }

    // Generate the PDF using the generatePDF function
    const pdfBuffer = await generatePDF(findWorker, formData, classResponsible);

    // Create new PDF details document and save it to the database
    const newPdfCreated = await PdfDetails.create({ 
      type: formData.type,
      date: { day: new Date().getDate(), month: new Date().getMonth() + 1, year: new Date().getFullYear() },
      formData: formData,
      worker: findWorker,
      classResponsible,
    });

    if (!newPdfCreated) {
      return res.status(500).json({ message: 'Error creating PdfDetails document' });
    }

    // Update the findWorker document with the new PdfDetails
    if (formData.type === 1) { 
      console.log('type 1 add: ', formData.type)
      findWorker.threeMonthFile.pdfDetail = newPdfCreated
      findWorker.threeMonthFile.ifCompleted = true;
    } 
    else if (formData.type === 2) { 
      console.log('type 2 add: ', formData.type)
      findWorker.sixMonthfFile.pdfDetail = newPdfCreated
      findWorker.sixMonthfFile.ifCompleted = true;
    }
    else if (formData.type === 3) { 
      console.log('type 3 add: ', formData.type)
      findWorker.yearfile.pdfDetail = newPdfCreated
      findWorker.yearfile.ifCompleted = true;
    }
    else { 
      console.log('type 4 add: ', formData.type)
      findWorker.files.push(newPdfCreated);
    }
    await findWorker.save();

    // Send the PDF file as an attachment
    res.setHeader('Content-Type', 'application/pdf');
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/getSurvey/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id)
    const findFile = await PdfDetails.findById(id).populate('worker').populate('classResponsible')
    if (!findFile) { return res.status(404).json({ message: 'file not exist' }) }
    console.log(findFile)
    const worker = await Worker.findById(findFile.worker.id).populate('class');
    console.log(worker)
    // Generate the PDF using the generatePDF function
    const pdfBuffer = await generatePDF(worker, findFile.formData, findFile.classResponsible );

    // Send the PDF file as an attachment
    res.setHeader('Content-Type', 'application/pdf');
    res.contentType("application/pdf");
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Define the generatePDF function
const generatePDF = async (findWorker, formData, classAdmin) => {
  try {
    const templatePath = path.join(__dirname, 'template.html');
    const outputPath = path.join(__dirname, 'output.pdf');
    
    // Read the HTML template asynchronously
    const template = await fs.promises.readFile(templatePath, 'utf-8');
    let startWorkerDate = `${findWorker.startDate.day}/${findWorker.startDate.month}/${findWorker.startDate.year}`;
    let adminClassName = `${classAdmin.firstName} ${classAdmin.lastName}`;

    // Replace placeholders with client data
    let html = template
      .replace('{{employeenumber}}', findWorker.number)
      .replace('{{firstname}}', findWorker.firstName)
      .replace('{{lastname}}', findWorker.lastName)
      .replace('{{email}}', findWorker.email)
      .replace('{{startdate}}', startWorkerDate)
      .replace('{{id}}', findWorker.personalId)
      .replace('{{role}}', findWorker.role)
      .replace('{{department}}', findWorker.class.name)
      .replace('{{adminName}}', adminClassName)
      .replace('{{adminName}}', adminClassName);

    formData.responses.forEach(obj => {
      const placeholder = `{{${obj.key}}}`;
      html = html.replace(placeholder, obj.answer);
    });

    html = html
      .replace('{{developmentTopic}}', formData.developmentTopic)
      .replace('{{desiredGoal}}', formData.desiredGoal)
      .replace('{{assistanceTopic}}', formData.assistanceTopic)
      .replace('{{assistance}}', formData.assistance)
      .replace('{{employeeFeedback}}', formData.appraisal)
      .replace('{{EmployeeSignature}}', formData.workerSignatur)
      .replace('{{AdminSignature}}', formData.adminSignatur)
      .replace('{{adminAppraisal}}', formData.adminAppraisal);
      
    console.log(111)

    const options = { format: 'A4', orientation: 'portrait', "enable-local-file-access": true, 
      childProcessOptions: {
        env: {
          OPENSSL_CONF: '/dev/null',
        },
      }
    }

    return new Promise((resolve, reject) => {
      htmlToPdf.create(html, options,).toBuffer((err, buffer) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          resolve(buffer);
        }
      });
    });

  /*
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html);
    await page.pdf({ path: outputPath, format: 'A4' });
    await browser.close();
    const pdfBuffer = await fs.promises.readFile(outputPath);
    await fs.promises.unlink(outputPath);
  */
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error; // Rethrow the error to handle it at a higher level
  }
};


module.exports = router;