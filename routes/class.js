const classController = require('../Controllers/class')
const express = require('express');
const router = express.Router();

router.route("/student/:sid/classes")
    .get(classController.getClassesEnrolledByStudent);

router.route("/student/:sid/classes/:cid")
    .get(classController.getSpecificClassEnrolledByStudent);

router.route("/student/:sid/classes/teachers")
    .get(classController.getTeachersOfEnrolledClasses);