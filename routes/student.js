const express = require("express");
const router = express.Router();
const Student = require("../models/student");
const Class = require("../models/class");
const Course = require("../models/courses");
const Teacher = require("../models/teacher");
const mongoose = require('mongoose');

const { withdrawCourse, enrollCourse, dashboard, getClasses } = require("../Controllers/student");

// GET Routes
router.get("/", function (req, res, next) {
  res.send("Student Dashboard");
});

// Route to get teachers for a student
router.get("/teachers/:sid", async (req, res) => {
  try {
    const studentId = req.params.sid;

    // Find all classes that the student is enrolled in
    const classes = await Class.find({ "students.sid": studentId }).populate(
      "teachers.tid"
    );

    // Extract the unique teachers from the classes
    const teachers = [];
    const teacherIds = new Set();

    classes.forEach((classItem) => {
      classItem.teachers.forEach((teacher) => {
        if (!teacherIds.has(teacher.tid._id.toString())) {
          teacherIds.add(teacher.tid._id.toString());
          teachers.push(teacher.tid);
        }
      });
    });

    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to get grades for a student
router.get("/grades/:sid", async (req, res) => {
  const { sid } = req.params;

  try {
    const courses = await Course.find(
      { "students.sid": sid },
      "name students.$"
    );

    const grades = courses.map((course) => {
      const studentData = course.students.find(
        (student) => student.sid.toString() === sid
      );
      return {
        courseName: course.name,
        marks: studentData.marks,
      };
    });

    res.json({ grades });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// Route to get a certain course's grades for a student
router.get("/grades/:sid/:cid", async (req, res) => {
  const { sid } = req.params;
  const { cid } = req.params;

  try {
    const marksOfAllStds = await Course.findOne({ "_id": cid.toString() });
    const allStudents = marksOfAllStds.students;

    marks = "Not found";

    for (const student of allStudents) {
      if (student.sid == sid.toString())
        marks = student.marks
    }

    res.json(marks);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// Route to withdraw from a course
router.delete("/withdrawcourse/:cid", async (req, res) => {
  withdrawCourse(req, res);
});

// Route to enroll in a course
router.post("/enrollcourse/:cid", async (req, res) => {
  enrollCourse(req, res);
});

// Route to retrieve student profile information
router.get('/profile/:sid', async (req, res) => {
  try {
    const sid = req.params.sid;
    const studentObjectId = new mongoose.Types.ObjectId(sid);
    const student = await Student.findById(studentObjectId);
    if (!student) {
      console.log("Student not found");
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
router.put("/updateprofile/:sid", async (req, res) => {
  try {
    const sid = req.params.sid;
    const updatedProfile = req.body;

    
    const updatedStudent = await Student.findByIdAndUpdate(sid, updatedProfile, { new: true });

    if (!updatedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(updatedStudent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// route to find class details of a specific student
router.get('/classes/:sid/:cid', async (req, res) => {
  try {
    const { sid, cid } = req.params;
    const classDetails = await Class.findById(cid).populate('students.sid', 'name rollno department').populate('teachers.tid', 'name');
    if (!classDetails) {
      return res.status(404).json({ message: 'Class not found' });
    }
    console.log(classDetails)
    const isStudentEnrolled = classDetails.students.some(student => student.sid.equals(sid));
    console.log(isStudentEnrolled)
    if (!isStudentEnrolled) {
      return res.status(404).json({ message: 'Student not enrolled in this class' });
    }
    res.json(classDetails);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

//Get student enrolled in particular course

router.get("/getStudentEnrolled", function (req, res, next) {
  const courseId = req.body.courseId;
  Course.findById(courseId)
    .populate("students.sid")
    .then(
      (course) => {
        if (!course) {
          res.statusCode = 404;
          res.json({ message: "Course not found" });
        } else {
          res.statusCode = 200;
          res.json(course.students);
        }
      },
      (err) => {
        return err;
      }
    );
});

//Get all courses studied by a student.
router.get("/getcourses/:sid", async (req, res, next) => {
  try {
    const studentId = req.params.sid;
    const courses = await Course.find({ "students.sid": studentId }).populate(
      "teachers.tid"
    );

    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//Get details of a specific student enrolled in classes taught by the teacher.
router.get('/:studentId/teacher/:teacherId', async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const teacherId = req.params.teacherId;

    // Find the student
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Find the teacher
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Find the courses taught by the teacher and enrolled by the student
    const courses = await Course.find({
      teachers: { $elemMatch: { tid: teacherId } },
      students: { $elemMatch: { sid: studentId } },
    }).populate('teachers.tid', 'name designation department')
      .populate('students.sid', 'name rollno department');

    res.json({ student, teacher, courses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

//Update marks of a student in a course
router.put('/:studentId/courses/:courseId', async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const studentId = req.params.studentId;
    const { marks } = req.body;

    // Find the course and update the student's marks
    const course = await Course.findOneAndUpdate(
      { _id: courseId, 'students.sid': studentId },
      { $set: { 'students.$.marks': marks } },
      { new: true }
    );

    if (!course) {
      return res.status(404).json({ message: 'Course or student not found' });
    }

    res.json(course);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Delete a student by their registration number
router.delete('/deletestudent/:regno', function (req, res, next) {
  Student.deleteOne({ rollno: req.params.regno })
    .exec()
    .then((result) => {
      if (result.deletedCount === 0) { // Check if any document was deleted
        return res.status(404).json("No student found");
      }
      res.status(200).json("Deleted Successfully");
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json(err);
    })
});
//GET route to retrieve details of a specific student -- FA21-BCS-069   
router.get("/:id", async (req, res) => {
  const studentId = req.params.id;

  try {
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({ student });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});
router.put("/updateprofile/:sid", async (req, res) => {
  try {
    const sid = req.params.sid;
    const updatedProfile = req.body;

    
    const updatedStudent = await Student.findByIdAndUpdate(sid, updatedProfile, { new: true });

    if (!updatedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(updatedStudent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

/* Retrieve Classes enrolled by student */
router.get("/classes/:sid",getClasses)

router.get("/dashboard", dashboard);

module.exports = router;

