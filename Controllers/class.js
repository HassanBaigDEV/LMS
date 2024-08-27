const mongoose = require('mongoose');
const Class = require("../models/class");
const Student = require('../models/student');

exports.getClassesEnrolledByStudent = async (req, res) => {
    try {
        const studentId = req.params.sid;
        let classes = await Class.find({
            students: { $in: [studentId] }
        });

        res.status(200).json(classes);
    } catch (error) {
        res.status(500).json({
            err: error.message
        });
    }
}

exports.getSpecificClassEnrolledByStudent = async (req, res) => {
    try {
        const classId = req.params.cid;
        const studentId = req.params.sid;
        let _class = await Class.findOne({
            _id: classId,
            students: { $in: [studentId] }
        }).populate("teacher.tid").populate("student.sid");

        if (!_class) {
            return res.status(404).json({ message: "Class not found or student not enrolled" });
        }

        res.status(200).json(_class);
    } catch (error) {
        res.status(500).json({
            err: error.message
        });
    }
}

exports.getTeachersOfEnrolledClasses = async (req, res) => {
    try {
        const studentId = req.params.sid;
        let classes = await Class.find({
            students: { $in: [studentId] }
        }).populate("teachers.tid");

        const teachers = classes
            .flatMap(cls => cls.teachers.map(teacher => teacher.tid))
            .filter((value, index, self) => self.findIndex(t => t._id.equals(value._id)) === index);

        res.status(200).json(teachers);
    } catch (error) {
        res.status(500).json({
            err: error.message
        });
    }
}
