import express from 'express';
import { registerStudent, registerCompany, login } from '../controllers/authController';

const router = express.Router();

router.post('/register/student', registerStudent);
router.post('/register/company', registerCompany);
router.post('/login', login);

export default router;
