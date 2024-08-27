const Head = require("../models/head");
const Courses = require("../models/courses");
const mongoose = require("mongoose");


const getHeadById = async (req, res, next) => {
  try {
    const { hid } = req.params;

    const head = await Head.findById(hid);

    if (!head) {
      return res.status(404).send({ error: "Head not found" });
    }

    res.status(200).send(head);
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
};

const AddStudentsInClass = async (req, res, next)=>{

  try {
    const { classId, sids } = req.body;

    // Validate input
    if (!classId || !Array.isArray(sids) || sids.length === 0) {
        return res.status(400).json({ error: 'Invalid input' });
    }

    // Find the class
    const course = await Courses.findById(classId);
    if (!course) {
        return res.status(404).json({ error: 'Class not found' });
    }

    // Add students to the class
    for (let sid of sids) {
        if (!mongoose.Types.ObjectId.isValid(sid)) {
            return res.status(400).json({ error: `Invalid student ID: ${sid}` });
        }

        // Assuming the course model has a students array to store student IDs
        if (!course.students.includes(sid)) {
            course.students.push(sid);
        }
    }

    // Save the updated class
    await course.save();

    res.status(200).json({ message: 'Students added successfully', course });
} catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
    next(error);
}

}


module.exports = { getHeadById , AddStudentsInClass };