const mongoose = require('mongoose');

const WorkerSchema = new mongoose.Schema({
    firstName: { type: String, required: true, minlength: 1, },
    lastName: { type: String, required: true, minlength: 1, },
    number: { type: String, required: true },
    startDate: { 
      day: {type: Number, min: 0, max: 31, }, 
      month: {type: Number, min: 0, max: 12, }, 
      year: {type: Number, }, 
    },   
    email: { type: String, },
    personalId: { type: String, required: true },
    class: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },

    threeMonthFile: { pdfDetail: {type: mongoose.Schema.Types.ObjectId, ref: "PdfDetails"}, ifCompleted: {type: Boolean} },
    sixMonthfFile: { pdfDetail: {type: mongoose.Schema.Types.ObjectId, ref: "PdfDetails"}, ifCompleted: {type: Boolean} },
    yearfile: { pdfDetail: {type: mongoose.Schema.Types.ObjectId, ref: "PdfDetails"}, ifCompleted: {type: Boolean} },

    files: [ { type: mongoose.Schema.Types.ObjectId, ref: "PdfDetails" } ],
    role: { type: String, },

    // Contract 
});

const workerModel = mongoose.model("Worker", WorkerSchema);

module.exports = workerModel;