const Teacher = require("../models/teacher");
const Class = require("../models/class");

const getStudentsInSpecificClassTaughtByTeacher = async (req, res, next) => {
  try {
    const { cid } = req.params;

    Class.findById(cid)
      .populate("teachers.tid")
      .populate("students.sid")
      .exec()
      .then(
        (clas) => {
          const students = clas.students;

          const actualStudents = students.map((el) => {
            return el.sid;
          });

          res.statusCode = 200;
          res.json(actualStudents);
        },
        (err) => {
          return err;
        }
      );
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
};

const viewProfile = async (req, res) => {
  try {
    const tid = req.params.tid;
    const teacherId = new mongoose.Types.ObjectId(tid);
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    res.json(student);

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }


}

const retrieveStudents = async (req, res) => {
  try {
    const tid = req.params.tid;
    const teacherId = new mongoose.Types.ObjectId(tid);
    const teacher = await Teacher.findById(teacherId);
    const classes = await Class.find({ teacher: teacherId });
    if (!classes.length) {
      return res.status(404).json({ error: 'No classes found for this teacher' });
    }

    // Extract students from all classes
    let students = [];
    classes.forEach(classInfo => {
      students = students.concat(classInfo.students);
    });

    res.json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while retrieving students' });
  }
}

const dashboard = async (req, res) => {
  try {
    const teacherId = req.query.teacherId;
    if (!teacherId) {
      return res.status(400).json({ error: "Teacher ID is required" });
    }
    const teacher = await Teacher.findById(teacherId).exec();
    if (!teacher) {
      return res.status(404).send({ message: "Teacher not found" });
    }

    const courses = await Courses.find({ "teachers.tid": teacherId })
      .select("name department")
      .exec();

    const classes = await Class.find({ "teachers.tid": teacherId })
      .select("name department")
      .exec();

    res.json({
      teacher: {
        id: teacher._id,
        name: teacher.name,
        designation: teacher.designation,
        department: teacher.department,
      },
      courses,
      classes,
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

module.exports = { getStudentsInSpecificClassTaughtByTeacher, dashboard, viewProfile, retrieveStudents };
