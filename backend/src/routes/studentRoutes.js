const express = require('express');
const { upload } = require('../middleware/upload');
const {
  studentCreateRules,
  studentUpdateRules,
  idParamRule,
  listQueryRules,
  validate,
} = require('../middleware/studentValidation');
const controller = require('../controllers/studentController');

const router = express.Router();

router.get('/meta/analytics', controller.getAnalytics);

router.get('/', listQueryRules, validate, controller.getStudents);
router.get('/:id', idParamRule, validate, controller.getStudentById);

router.post(
  '/',
  upload.single('photo'),
  studentCreateRules,
  validate,
  controller.createStudent
);

router.put(
  '/:id',
  upload.single('photo'),
  idParamRule,
  studentUpdateRules,
  validate,
  controller.updateStudent
);

router.delete('/:id', idParamRule, validate, controller.deleteStudent);

module.exports = router;
