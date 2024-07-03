const mongoose = require("mongoose");

const PdfDetailsSchema = new mongoose.Schema({
  type: { type: Number },
  date: {
    day: { }, 
    month: { },
    year: { },
  },
  formData: { },
  worker: { type: mongoose.Schema.Types.ObjectId, ref: "Worker" },
  classResponsible: { type: mongoose.Schema.Types.ObjectId, ref: "ClassResponsible" },
});

const PdfDetailsModel = mongoose.model("PdfDetails", PdfDetailsSchema);

module.exports = PdfDetailsModel;