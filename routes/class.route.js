const express = require('express');
const router = express.Router();
const Class = require('../mongodb/Models/class.js');

// Read all classes
router.get('/', async (req, res) => {
  try {
    const classes = await Class.find();
    res.status(200).json(classes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Read a single class
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const classes = await Class.findOne({ _id: id });
    res.status(200).json(classes);
  } catch(error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a class
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;

    // Manually check validation
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }
    
    const newClass = await Class.create({ name });
    console.log(newClass)
    res.status(201).json(newClass);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a class
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    // Manually check validation
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const updatedClass = await Class.findByIdAndUpdate(id, { name }, { new: true });
    res.status(200).json(updatedClass);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a class
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedClass = await Class.findOneAndDelete({ _id: id });
    if (!deletedClass) { return res.status(404).json({ message: 'Class not found' }); }
    res.status(200).json({ message: 'Class deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
