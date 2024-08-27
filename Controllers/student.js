const mongoose = require("mongoose");
const Course = require("../models/courses");
const Student = require("../models/student");
const Class = require("../models/class");

const withdrawCourse = async (req, res) => {
  try {
    const { cid } = req.params;
    const { studentId } = req.body; // Assuming student ID is passed in the request body

    const course = await Course.findById(cid);
    if (!course) {
      return res.status(404).send({ error: "Course not found" });
    }

    course.students = course.students.filter(
      (student) => student.sid.toString() !== studentId
    );
    await course.save();

    res.send({ message: "Successfully withdrawn from the course" });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

const enrollCourse = async (req, res) => {
  try {
    const { cid } = req.params;
    const { studentId } = req.body; // Assuming student ID is passed in the request body

    const course = await Course.findById(cid);
    if (!course) {
      return res.status(404).send({ error: "Course not found" });
    }

    const studentExists = course.students.some(
      (student) => student.sid.toString() === studentId
    );
    if (studentExists) {
      return res
        .status(400)
        .send({ error: "Student already enrolled in this course" });
    }

    course.students.push({
      sid: new mongoose.Types.ObjectId(studentId),
      marks: 0,
    });
    await course.save();

    res.send({ message: "Successfully enrolled in the course" });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

/* Get Classes enrolled by student */
const getClasses = async (req, res) => {
  try {
    const sid = req.params.sid;
    const studentId = new mongoose.Types.ObjectId(sid);
    const student = await Student.findById(studentId);
    const classes = await Class.find({ 'students.sid': studentId });
    if (!classes) {
      return res.status(404).json({ error: "No class found for this student" })
    }
    res.json(classes);

  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const dashboard = async (req, res) => {
  try {
    const studentId = req.query.studentId; // taking studentId from query
    if (!studentId) {
      return res.status(400).json({ error: "Student ID is required" });
    }

    const student = await Student.findById(studentId).exec();
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    const classes = await Class.find({ "students.sid": studentId }) //getting a students's classes
      .select("name department")
      .exec();
    console.log(classes);

    const courses = await Courses.find({ "students.sid": studentId }) //getting a students's courses
      .select("name department")
      .exec();

    res.json({
      student: {
        name: student.name,
        rollno: student.rollno,
        department: student.department,
      },
      classes,
      courses,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};


module.exports = { withdrawCourse, enrollCourse, getClasses,dashboard };
