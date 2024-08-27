const express = require("express");
const router = express.Router();
const Teacher = require("../models/teacher");
const Course = require("../models/courses");
const Class = require("../models/class");

const {
  getTeacchersTeaching,
  getCoursesByTeacher,
  dashboard,
} = require("../Controllers/head");

//GET Routes
router.get("/", function (req, res, next) {
  res.send("Head Dashboard");
});


router.get("/courses/:tid", getCoursesByTeacher);

router.get("/teachers/:cid", getTeacchersTeaching);

// Get list of courses under the department (FA21-BCS-024)
router.get("/courses", async (req, res) => {
  try {
    const courses = await Course.find().sort({ department: 1 });

    if (!courses.length) {
      return res.status(404).json({ message: "Courses not found" });
    }
    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving courses" });
  }
});

// Get details of a specific course under the department (SP21-BCS-032)
router.get("/courses/:id", async (req, res) => {
  try {
    const courseId = req.params.id;
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Courses not found" });
    }
    res.json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving courses" });
  }
});

// Get list of teachers assigned to a specific course under the department (FA21-BCS-041)
router.get("/courses/:id/teachers", async (req, res) => {
  try {
    const courseId = req.params.id;

    const course = await Course.findOne({ _id: courseId }).populate("teachers");
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.json(course.teachers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving teachers" });
  }
});

router.post("/head/assigncourse/:cid/:tid", async (req, res) => {
  try {
    const courseId = req.params.cid;
    const teacherId = req.params.tid;
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    if (course.department !== teacher.department) {
      return res
        .status(400)
        .json({ message: "Teacher and course department mismatch" });
    }

    course.teachers.push({ tid: teacher._id });
    await course.save();

    res
      .status(200)
      .json({ message: "Teacher assigned to the course successfully", course });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get details of a specific course under the department (SP21-BCS-032)
router.get('/courses/:id', async (req, res) => {
  try {
    const courseId = req.params.id;
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Courses not found" });
    }
    res.json(course);
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving courses" });
  }
});

// Get list of teachers assigned to a specific course under the department (FA21-BCS-041)
router.get('/courses/:id/teachers', async (req, res) => {
  try {
    const courseId = req.params.id;

    const course = await Course.findOne({ _id: courseId }).populate("teachers");
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.json(course.teachers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving teachers" });
  }
});

router.post("/head/assigncourse/:cid/:tid", async (req, res) => {
  try {
    const courseId = req.params.cid;
    const teacherId = req.params.tid;
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    if (course.department !== teacher.department) {
      return res
        .status(400)
        .json({ message: "Teacher and course department mismatch" });
    }

    course.teachers.push({ tid: teacher._id });
    await course.save();

    res
      .status(200)
      .json({ message: "Teacher assigned to the course successfully", course });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE routes, remove teacher from deparment
router.put("/removeteacher/:tid", async (req, res, next) => {
  try {
    const { tid } = req.params;
    const teacher = await Teacher.findByIdAndUpdate(tid, {
      department: "null",
    });

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }
    res
      .status(200)
      .json({ message: "Teacher removed from department successfully" });
  } catch {
    res.status(500).json({ message: error.message });
  }
});

// GET Route to get a course taught by a specific teacher
router.get("/getcourse/:tid", async (req, res, next) => {
  try {
    const { tid } = req.params;
    const courses = await Course.find({ "teachers.tid": tid }).populate(
      "teachers.tid"
    );

    if (!courses || courses.length === 0) {
      return res
        .status(404)
        .json({ message: "No courses found for this teacher" });
    }

    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to remove all students from a class
router.delete("/removestudents/:cid", async (req, res) => {
  try {
    const classId = req.params.cid;
    const classObj = await Class.findById(classId);
    if (!classObj) {
      return res.status(404).json({ message: "Class not found" });
    }
    classObj.students = [];
    await classObj.save();
    res.json({ message: "All students removed from the class" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Route to update the head of department's profile information
router.put("/updateprofile/:hid", async (req, res) => {
  try {
    const hid = req.params.hid;
    const updates = req.body;

    // Find the head of department by ID and update their profile
    const updatedHead = await Head.findByIdAndUpdate(hid, updates, { new: true });

    if (!updatedHead) {
      return res.status(404).json({ message: "Head of department not found" });
    }

    res.json(updatedHead);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }

});


router.get("/dashboard", dashboard);

// Put Route basic code to update a course's data
router.put('/updatecourse/:id', function (req, res, next) {
  Course.findByIdAndUpdate(req.params.id, req.body)
    .then(
      (result) => {
        res.statusCode = 200;
        res.json(result);
      },
      (err) => {
        return err;
      }
    );
});

module.exports = router;
