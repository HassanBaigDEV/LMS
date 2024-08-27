const express = require("express");
const router = express.Router();
const Class = require("../models/class");
const Teacher = require("../models/teacher");
const Student = require("../models/student");
const Courses = require("../models/courses")

const Admin = require("../models/admin");

const { getHeadById , AddStudentsInClass } = require("../Controllers/admin");

//GET Routes
router.get("/", function (req, res, next) {
  res.send("Admin Dashboard");
});
router.get("/courses", function (req, res, next) {
  Courses.find()
  .populate("teachers.tid")
  .populate("students.sid")
  .exec()
  .then(
    (clas) => {
      res.statusCode = 200;
      res.json(clas);
    },
    (err) => {
      return err;
    }
  );
})
router.get("/classes", function (req, res, next) {
  Class.find()
    .populate("teachers.tid")
    .populate("students.sid")
    .exec()
    .then(
      (clas) => {
        res.statusCode = 200;
        res.json(clas);
      },
      (err) => {
        return err;
      }
    );
});
router.get("/classes/:id", function (req, res, next) {
  Class.find({ _id: req.params.id })
    .populate("teachers.tid")
    .populate("students.sid")
    .exec()
    .then(
      (clas) => {
        res.statusCode = 200;
        res.json(clas);
      },
      (err) => {
        return err;
      }
    );
});
router.get("/teachers", function (req, res, next) {
  Teacher.find()
    .exec()
    .then(
      (teacher) => {
        res.statusCode = 200;
        res.json(teacher);
      },
      (err) => {
        return err;
      }
    );
});

router.get("/teachers/:id", function (req, res, next) {
  Teacher.find({ _id: req.params.id })
    .exec()
    .then(
      (teacher) => {
        res.statusCode = 200;
        res.json(teacher);
      },
      (err) => {
        return err;
      }
    );
});
router.get("/students", function (req, res, next) {
  Student.find()
    .exec()
    .then(
      (student) => {
        res.statusCode = 200;
        res.json(student);
      },
      (err) => {
        return err;
      }
    );
});
router.get("/students/:id", function (req, res, next) {
  Student.find({ _id: req.params.id })
    .exec()
    .then(
      (student) => {
        res.statusCode = 200;
        res.json(student);
      },
      (err) => {
        return err;
      }
    );
});

router.get("/admins", function (req, res, next) {
  Admin.find().exec()
    .then(
      (admin) => {
        res.status(200).json(admin)
      },
      (err) => {
        return err;
      }
    )
});

// GET Head by ID
router.get("/:hid", getHeadById);


//ASZ-44
router.post("/addstudents" , AddStudentsInClass);



//POST Routes
router.post("/addteacher", function (req, res, next) {
  Teacher.create(req.body).then(
    (teacher) => {
      res.statusCode = 200;
      res.json(teacher);
    },
    (err) => {
      return err;
    }
  );
});

router.post("/addstudent", function (req, res, next) {
  Student.create(req.body).then(
    (student) => {
      res.statusCode = 200;
      res.json(student);
    },
    (err) => {
      return err;
    }
  );
});
router.post("/addclass", function (req, res, next) {
  Class.create(req.body).then(
    (clas) => {
      res.statusCode = 200;
      res.json(clas);
    },
    (err) => {
      return err;
    }
  );
});

// add admin 
router.post("/add", async (req, res, next) => {
  try {
    const { name } = req.body;
    const newAdmin = new Admin({ name });
    await newAdmin.save();
    res.status(201).json(newAdmin)
  }
  catch (err) {
    res.status(500).json({ message: err.message })
  }
});

//PUT Routes

router.put("/assignteacher/:cid/:tid", function (req, res, next) {
  Class.findOneAndUpdate(
    { _id: req.params.cid },
    {
      $push: {
        teachers: {
          tid: req.params.tid,
        },
      },
    },
    { new: true, upsert: false }
  ).then(
    (result) => {
      res.statusCode = 200;
      res.json(result);
    },
    (err) => {
      return err;
    }
  );
});
router.put("/assignstudent/:cid/:sid", function (req, res, next) {
  Class.findOneAndUpdate(
    { _id: req.params.cid },
    {
      $push: {
        students: {
          sid: req.params.sid,
        },
      },
    },
    { new: true, upsert: false }
  ).then(
    (result) => {
      res.statusCode = 200;
      res.json(result);
    },
    (err) => {
      return err;
    }
  );
});

router.put('/updatestudent/:id', (req, res, next) => {
    Student.findOneAndUpdate({_id: req.params.id}, req.body, {new: true})
    .then((result) => {
        res.statusCode = 200;
        res.json(result);
    }, (err) => { return (err) })
});
router.put('/updateteacher/:id', (req, res, next) => {
    Teacher.findOneAndUpdate({_id: req.params.id}, req.body, {new: true})
    .then((result) => {
        res.statusCode = 200;
        res.json(result);
    }, (err) => { return (err) })
});

// update admin profile
router.put("/updateprofile/:aid", async (req, res, next) => {
  try {
    const { name } = req.body;
    const admin = await Admin.findByIdAndUpdate(
      { _id: req.params.aid },
      { name: name },
      { new: true }
    );

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json(admin);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// PUT Route to update a student by registration number
router.put("/updatestudent/:regno", async (req, res, next) => {
  try {
    const { regno } = req.params;
    const updateData = req.body;
    const student = await Student.findOneAndUpdate({ rollno: regno }, updateData, { new: true });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({ message: "Student updated successfully", student });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//Delete Routes

router.delete("/delclass/:cid", function (req, res, next) {
  Class.deleteOne({ _id: req.params.cid }).then(
    (result) => {
      res.statusCode = 200;
      res.json(result);
    },
    (err) => {
      return err;
    }
  );
});

router.delete("/delstudent/:sid", function (req, res, next) {
  Student.deleteOne({ _id: req.params.sid }).then(
    (result) => {
      res.statusCode = 200;
      res.json(result);
    },
    (err) => {
      return err;
    }
  );
});
router.delete("/delteacher/:tid", function (req, res, next) {
  Teacher.deleteOne({ _id: req.params.tid }).then(
    (result) => {
      res.statusCode = 200;
      res.json(result);
    },
    (err) => {
      return err;
    }
  );
});

//062,086
//Remove All teachers form a class
router.delete('/removeteachers/:cid', async (req, res) => {
  try {
    const { cid } = req.params;

    const classObj = await Class.findById(cid);
    classObj.teachers = [];
    await classObj.save();
    res.status(200).send('All teachers removed from class');
    console.log("All teachers removed from class");
  } catch (error) {
    console.error(error);
  }
});

// Remove specific teacher from a class
router.delete('/removeteacher/:tid/:cid', async (req, res) => {
  try {
    const { tid, cid } = req.params;

    const classObj = await Class.findById(cid);
    classObj.teachers = classObj.teachers.filter(t => t.tid.toString() !== tid);
    await classObj.save();
    res.status(200).send('Teacher removed from class');
    console.log("Teacher removed from class");
  } catch (error) {
    console.error(error);
  }
});




// removing all students from a specific class
router.put("/removestudents/:cid", function (req, res, next) {
  Class.findOneAndUpdate(
    { _id: req.params.cid },
    {
      $set: {
        students: []
      }
    },
    { new: true, upsert: false }
  ).then(
    (result) => {
      res.statusCode = 200;
      res.json(result);
    },
    (err) => {
      return err;
    }
  );
})


// remove a specific student from aclass

router.put("/removestudent/:sid/:cid", function (req, res, next) {
  Class.findOneAndUpdate(
    { _id: req.params.cid },
    {
      $pull: {
        students: {
          sid: req.params.sid
        }
      }
    },
    { new: true, upsert: false }
  ).then(
    (result) => {
      res.statusCode = 200;
      res.json(result);
    },
    (err) => {
      return err;
    }
  );

})


// update a class 
router.put('/updateclass/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const update = req.body; // Data to update

    // Validate the update object against the schema
    const { name, department, teacher, student } = update;
    if (!name || !department || !teacher || !student || !Array.isArray(student) || student.length === 0) {
      return res.status(400).json({ message: 'No valid update data provided' });
    }

    // Find the class by ID
    const foundClass = await Class.findById(id);

    if (!foundClass) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Update the class object with the provided data
    if (name) foundClass.name = name;
    if (department) foundClass.department = department;
    if (teacher) foundClass.teacher = teacher;
    foundClass.student = foundClass.student.concat(student);

    // Save the updated class object
    const updatedClass = await foundClass.save();

    res.status(200).json({ message: 'Class updated successfully', updatedClass });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


module.exports = router;
