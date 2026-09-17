import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export const registerStudent = async (req: Request, res: Response) => {
  try {
    const { 
      email, password, firstName, lastName, phone,
      location, city, state, country, locality, bio,
      institution, degree, department, currentYear, semester, graduationYear, cgpa,
      skills, preferredRoles, preferredIndustries, preferredLocations, workMode, careerInterests 
    } = req.body;

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newStudent = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'STUDENT',
        name: `${firstName} ${lastName}`,
        studentProfile: {
          create: {
            firstName,
            lastName,
            phone,
            location,
            city,
            state,
            country,
            locality,
            bio,
            institution,
            degree,
            department,
            currentYear,
            semester,
            graduationYear: graduationYear ? parseInt(graduationYear) : null,
            cgpa: cgpa ? parseFloat(cgpa) : null,
            skills: skills || [],
            preferredRoles: preferredRoles || [],
            preferredIndustries: preferredIndustries || [],
            preferredLocations: preferredLocations || [],
            workMode,
            careerInterests
          }
        }
      },
      include: {
        studentProfile: true
      }
    });

    const token = jwt.sign(
      { id: newStudent.id, role: newStudent.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({ user: { id: newStudent.id, email: newStudent.email, role: newStudent.role, name: newStudent.name }, token });
  } catch (error) {
    console.error('Student registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const registerCompany = async (req: Request, res: Response) => {
  try {
    const { 
      email, password, companyName, companyEmail, phone, website,
      description, industryDomain, companySize,
      location, city, state, country,
      recruiterName, recruiterEmail, recruiterPhone
    } = req.body;

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newCompany = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'INDUSTRY',
        name: companyName,
        industryProfile: {
          create: {
            companyName,
            companyEmail,
            phone,
            website,
            description,
            industryDomain,
            companySize,
            location,
            city,
            state,
            country,
            recruiterName,
            recruiterEmail,
            recruiterPhone
          }
        }
      },
      include: {
        industryProfile: true
      }
    });

    const token = jwt.sign(
      { id: newCompany.id, role: newCompany.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({ user: { id: newCompany.id, email: newCompany.email, role: newCompany.role, name: newCompany.name }, token });
  } catch (error) {
    console.error('Company registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({ user: { id: user.id, email: user.email, role: user.role, name: user.name }, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
