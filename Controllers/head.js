const Courses = require("../models/courses");
const mongoose = require("mongoose");

//getTeacchersTeaching

const getCoursesByTeacher = async (req, res, next) => {
  try {
    const teacherId = req.params.tid;

    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      return res.status(400).json({ error: "Invalid teacher ID" });
    }

    const teacherCourses = await Courses.find({ "teachers.tid": teacherId });

    if (!teacherCourses.length) {
      return res
        .status(404)
        .json({ error: "No Courses found for this teacher" });
    }

    res.status(200).json(teacherCourses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

const getTeacchersTeaching = async (req, res, next) => {
  try {
    const classId = req.params.cid;

    if (!mongoose.Types.ObjectId.isValid(classId)) {
      return res.status(400).json({ error: "Invalid class ID" });
    }

    const course = await Courses.findById(classId).populate("teachers.tid");

    if (!course) {
      return res.status(404).json({ error: "Class not found" });
    }

    res.status(200).json(course.teachers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

const dashboard = async (req, res) => {
  try {
    const headId = req.query.headId; // taking headId from body
    if (!headId) {
      return res.status(400).json({ error: "Head ID is required" });
    }
    const head = await Head.findById(headId);
    if (!head) {
      return res.status(404).json({ error: "Head not found" });
    }
    const department = head.department;
    const teacherCount = await Teacher.countDocuments({ department });
    const studentCount = await Student.countDocuments({ department });
    const classCount = await Class.countDocuments({ department });

    res.json({
      department,
      teachers: teacherCount,
      students: studentCount,
      classes: classCount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};


module.exports = { getCoursesByTeacher, getTeacchersTeaching, dashboard};
