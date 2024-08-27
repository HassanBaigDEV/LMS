const express = require("express");
const mongoose = require("mongoose");
const Course = require("../models/courses.js"); // Adjust the path as necessary
const Student = require("../models/student"); // Adjust the path as necessary
const { addCourse } = require("../Controllers/courses.js");
const router = express.Router();

// GET Route for courses
router.get("/", function (req, res, next) {
  res.send("Courses");
});

// GET route for list of students in a specific course under a particular department (FA21-BCS-005)
router.get('/:courseId/students', async (req, res) => {
  try {
    const { courseId } = req.params;
    const { department } = req.query;  // Get the department from the query parameters

    const course = await Course.findOne({ _id: courseId, department })
      .populate('students.sid', 'name rollno department') // Populate student details
      .exec();

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const students = course.students.map(student => ({
      id: student.sid._id,
      name: student.sid.name,
      rollno: student.sid.rollno,
      department: student.sid.department,
      marks: student.marks,
    }));

    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



// DELETE Route to unenroll a student from a course
router.delete("/courses/:cid/unenroll-student/:sid", async (req, res) => {
  try {
    const { cid, sid } = req.params;

    const course = await Course.findById(cid);
    if (!course) {
      return res.status(404).send("Course not found");
    }

    // Pull the student object with the specific sid
    course.students = course.students.filter(
      (student) => student.sid.toString() !== sid
    );

    await course.save();

    res.status(200).send("Student unenrolled successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// PUT Route to update a course
router.put("/:id", async (req, res) => {
  try {
    const courseId = req.params.id;
    const updates = req.body;

    const updatedCourse = await Course.findByIdAndUpdate(courseId, updates, { new: true });

    if (!updatedCourse) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.json(updatedCourse);
  } catch (error) {
    console.error("Error updating course:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/head/addcourse", async (req, res) => {
  addCourse(req, res);
});


//GET route to retrieve list of teachers assigned to a specific course -- FA21-BCS-069
router.get("/:id/teachers", async (req, res) => {
  const courseId = req.params.id;

  try {
    const course = await Course.findById(courseId).populate("teachers.tid");

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json({ teachers: course.teachers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
