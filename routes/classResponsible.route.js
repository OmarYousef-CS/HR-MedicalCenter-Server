const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const crypto = require('crypto');
const ClassResponsible = require('../mongodb/Models/classResponsible.js');
const Classes = require('../mongodb/Models/class.js');
const { isAdmin, isAuthenticated } = require('../auth/middleware.js');

// Get All ClassResponsibles
router.get('/', async (req, res) => {
  try {
    const classesResponsibles = await ClassResponsible.find().populate('class');
    res.status(200).json(classesResponsibles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Read a Single ClassResponsible
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const classResponsible = await ClassResponsible.findOne({ _id: id }).populate('class');
    console.log(classResponsible)
    res.status(200).json(classResponsible);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a ClassResponsible
router.post('/', isAdmin, async (req, res) => {
  try {
    const { username, firstName, lastName, number, email, personalId, classId } = req.body;
    console.log(username, firstName, lastName, number, email, personalId, classId)
    // Manually check validation
    if (!username || !firstName || !lastName || !number || !email || !personalId || !classId) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const ifClassExist = await Classes.findById(classId._id);
    if (!ifClassExist) {
      return res.status(404).json({ message: "Class not found" });
    }

    // Generate a random password
    const randomPassword = crypto.randomBytes(8).toString('hex');

    const newClassResponsible = await ClassResponsible.create({
      username,
      password: randomPassword,
      firstName,
      lastName,
      number,
      email,
      personalId,
      class: ifClassExist,
    });

    console.log(newClassResponsible)

    res.status(201).json(newClassResponsible);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a ClassResponsible
router.put('/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { username, firstName, lastName, number, email, personalId, classId } = req.body;

    console.log(username, firstName, lastName, number, email, personalId, classId)
    console.log(!username, !firstName, !lastName, !number, !email, !personalId, !classId)
    // Manually check validation
    if (!username || !firstName || !lastName || !number || !email || !personalId || !classId) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const ifClassExist = await Classes.findById(classId);
    if (!ifClassExist) {
      return res.status(404).json({ message: "Class not found" });
    }

    const updatedClassResponsible = await ClassResponsible.findByIdAndUpdate(
      { _id: id },
      {
        username,
        firstName,
        lastName,
        number,
        email,
        personalId,
        class: ifClassExist,
      }
    );
    res.status(200).json(updatedClassResponsible);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a ClassResponsible
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const ifClassResponsibleExist = await ClassResponsible.findOneAndDelete({ _id: id });
    if (!ifClassResponsibleExist) {
      return res.status(404).json({ message: "ClassResponsible not found" });
    }
    res.status(200).json("ClassResponsible deleted successfully");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;