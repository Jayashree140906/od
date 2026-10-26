import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { Types } from 'mongoose';
import { User, IUser } from '../models/User.js';
import { Department } from '../models/Department.js';
import { ClassSection } from '../models/ClassSection.js';
import { signToken } from '../utils/jwt.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/index.js';
import { ROLES } from '../config/constants.js';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const validated = registerSchema.parse(req.body);

      const existingEmail = await User.findOne({ email: validated.email.toLowerCase() });
      if (existingEmail) {
        return sendError(res, 'An account with this institutional email already exists.', 409);
      }

      if (validated.role === ROLES.STUDENT) {
        if (!validated.registerNumber || !validated.registerNumber.trim()) {
          return sendError(res, 'Student register number is required.', 400);
        }
        if (!validated.classSection) {
          return sendError(res, 'Class and section selection is required for students.', 400);
        }
        const existingReg = await User.findOne({ registerNumber: validated.registerNumber.trim() });
        if (existingReg) {
          return sendError(res, 'Student with this register number is already registered.', 409);
        }
      }

      if (validated.role === ROLES.FACULTY || validated.role === ROLES.HOD) {
        if (!validated.staffId || !validated.staffId.trim()) {
          return sendError(res, 'Staff ID is required.', 400);
        }
        const existingStaff = await User.findOne({ staffId: validated.staffId.trim() });
        if (existingStaff) {
          return sendError(res, 'Staff with this Staff ID is already registered.', 409);
        }
      }

      let departmentId: Types.ObjectId | undefined;
      if (validated.department) {
        if (Types.ObjectId.isValid(validated.department)) {
          departmentId = new Types.ObjectId(validated.department);
        } else {
          const deptCode = validated.department.replace(/^dept_/, '').toUpperCase();
          const deptDoc = await Department.findOne({ code: deptCode });
          if (deptDoc) departmentId = deptDoc._id as Types.ObjectId;
        }
      }

      let classSectionId: Types.ObjectId | undefined;
      if (validated.classSection) {
        if (Types.ObjectId.isValid(validated.classSection)) {
          classSectionId = new Types.ObjectId(validated.classSection);
        } else {
          const secDoc = await ClassSection.findOne({
            $or: [
              { name: validated.classSection },
              ...(departmentId ? [{ department: departmentId }] : []),
            ],
          });
          if (secDoc) classSectionId = secDoc._id as Types.ObjectId;
        }
      }

      const newUser = await User.create({
        name: validated.name.trim(),
        email: validated.email.toLowerCase().trim(),
        password: validated.password,
        role: validated.role,
        department: departmentId,
        classSection: classSectionId,
        registerNumber: validated.registerNumber?.trim(),
        staffId: validated.staffId?.trim(),
        phone: validated.phone?.trim(),
        isActive: true,
        verificationStatus: 'pending',
      });

      let verificationMessage =
        'Your registration is submitted and pending verification by your Class Faculty Advisor.';
      if (validated.role === ROLES.FACULTY) {
        verificationMessage =
          'Your faculty registration is submitted and pending verification by the Head of Department (HOD).';
      } else if (validated.role === ROLES.HOD) {
        verificationMessage =
          'Your HOD registration is submitted and pending verification by the System Administrator.';
      }

      const userObj = newUser.toObject();
      delete userObj.password;

      return sendSuccess(res, userObj, `Registration successful! ${verificationMessage}`, 201);
    } catch (err) {
      next(err);
    }
  }

  static async getRegisterMeta(_req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      let departments = await Department.find().select('name code');
      let classes = await ClassSection.find()
        .select('name semester department')
        .populate('department', 'name code');

      // If database has no departments yet, auto-populate standard departments and sections
      if (!departments || departments.length === 0) {
        const createdDepts = await Department.insertMany([
          { code: 'CSE', name: 'Computer Science and Engineering' },
          { code: 'ECE', name: 'Electronics and Communication Engineering' },
          { code: 'IT', name: 'Information Technology' },
          { code: 'MECH', name: 'Mechanical Engineering' },
        ]);
        departments = createdDepts;

        const defaultClasses: any[] = [];
        for (const dept of createdDepts) {
          defaultClasses.push(
            { name: `${dept.code}-A`, department: dept._id, semester: 6, academicYear: '2025-2026' },
            { name: `${dept.code}-B`, department: dept._id, semester: 6, academicYear: '2025-2026' }
          );
        }
        await ClassSection.insertMany(defaultClasses);

        classes = await ClassSection.find()
          .select('name semester department')
          .populate('department', 'name code');
      }

      return sendSuccess(res, { departments, classes }, 'Registration metadata retrieved');
    } catch (err) {
      next(err);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { email, password } = loginSchema.parse(req.body);

      const user = await User.findOne({ email: email.toLowerCase() })
        .select('+password')
        .populate('department', 'code name')
        .populate('classSection', 'name semester');

      if (!user) {
        return sendError(res, 'Invalid credentials. User not found.', 401);
      }

      if (!user.isActive) {
        return sendError(res, 'Your account has been deactivated. Please contact the administrator.', 403);
      }

      // Check verification hierarchy status
      if (user.verificationStatus === 'pending') {
        let approver = 'your Class Faculty Advisor';
        if (user.role === ROLES.FACULTY) approver = 'your Head of Department (HOD)';
        if (user.role === ROLES.HOD) approver = 'the System Administrator';
        return sendError(
          res,
          `Your registration is pending verification by ${approver}. You will be able to sign in once approved.`,
          403
        );
      }

      if (user.verificationStatus === 'rejected') {
        return sendError(
          res,
          `Your registration request was rejected. ${user.rejectionReason ? `Reason: ${user.rejectionReason}` : 'Please contact department administration.'}`,
          403
        );
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return sendError(res, 'Invalid credentials. Incorrect password.', 401);
      }

      const token = signToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
        department: user.department?._id?.toString(),
        name: user.name,
      });

      // Set HTTP-only cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      const userObj = user.toObject();
      delete userObj.password;

      return sendSuccess(
        res,
        {
          token,
          user: userObj,
        },
        'Login successful'
      );
    } catch (err) {
      next(err);
    }
  }

  static async logout(_req: Request, res: Response): Promise<any> {
    res.clearCookie('token');
    return sendSuccess(res, null, 'Logged out successfully');
  }

  static async me(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      if (!req.user) {
        return sendError(res, 'Not authenticated', 401);
      }

      const user = await User.findById(req.user.userId)
        .populate('department', 'code name')
        .populate('classSection', 'name semester facultyAdvisor');

      if (!user) {
        return sendError(res, 'User not found', 404);
      }

      return sendSuccess(res, user, 'User profile fetched');
    } catch (err) {
      next(err);
    }
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { email } = forgotPasswordSchema.parse(req.body);

      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return sendSuccess(
          res,
          null,
          'If an account exists with this email, a password reset link has been dispatched.'
        );
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await user.save();

      // In development, return the token for quick verification
      return sendSuccess(
        res,
        {
          message: 'Password reset token generated.',
          token: resetToken,
        },
        'If an account exists with this email, a password reset link has been dispatched.'
      );
    } catch (err) {
      next(err);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { token, newPassword } = resetPasswordSchema.parse(req.body);
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: new Date() },
      });

      if (!user) {
        return sendError(res, 'Invalid or expired password reset token.', 400);
      }

      user.password = newPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      return sendSuccess(res, null, 'Password successfully reset. You can now login with your new password.');
    } catch (err) {
      next(err);
    }
  }

  static async getPendingVerifications(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      if (!req.user) return sendError(res, 'Not authenticated', 401);

      const query: any = { verificationStatus: 'pending' };

      if (req.user.role === ROLES.FACULTY) {
        // Faculty verifies students in their department
        query.role = ROLES.STUDENT;
        if (req.user.department) {
          query.department = new Types.ObjectId(req.user.department);
        }
      } else if (req.user.role === ROLES.HOD) {
        // HOD verifies faculty (and students) in their department
        query.role = { $in: [ROLES.FACULTY, ROLES.STUDENT] };
        if (req.user.department) {
          query.department = new Types.ObjectId(req.user.department);
        }
      } else if (req.user.role === ROLES.ADMIN) {
        // Admin can verify all (especially HODs)
      } else {
        return sendError(res, 'Unauthorized to view pending registrations', 403);
      }

      const pendingUsers = await User.find(query)
        .sort({ createdAt: -1 })
        .populate('department', 'name code')
        .populate('classSection', 'name semester');

      return sendSuccess(res, pendingUsers, 'Pending registrations retrieved');
    } catch (err) {
      next(err);
    }
  }

  static async verifyUser(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      if (!req.user) return sendError(res, 'Not authenticated', 401);

      const { id } = req.params;
      const { action, reason } = req.body;

      if (!['APPROVE', 'REJECT'].includes(action)) {
        return sendError(res, 'Action must be APPROVE or REJECT', 400);
      }

      const targetUser = await User.findById(id);
      if (!targetUser) {
        return sendError(res, 'User not found', 404);
      }

      // Hierarchy validation:
      // Student can be approved by Faculty, HOD, Admin
      // Faculty can be approved by HOD, Admin
      // HOD can be approved ONLY by Admin
      if (targetUser.role === ROLES.STUDENT) {
        if (![ROLES.FACULTY, ROLES.HOD, ROLES.ADMIN].includes(req.user.role as any)) {
          return sendError(res, 'Only Faculty Advisors, HODs, or Admins can verify students.', 403);
        }
      } else if (targetUser.role === ROLES.FACULTY) {
        if (![ROLES.HOD, ROLES.ADMIN].includes(req.user.role as any)) {
          return sendError(res, 'Only HOD or Admin can verify faculty members.', 403);
        }
      } else if (targetUser.role === ROLES.HOD) {
        if (req.user.role !== ROLES.ADMIN) {
          return sendError(res, 'Only the System Administrator can verify HOD accounts.', 403);
        }
      }

      if (action === 'APPROVE') {
        targetUser.verificationStatus = 'verified';
        targetUser.verifiedBy = new Types.ObjectId(req.user.userId);
        targetUser.verifiedAt = new Date();
        targetUser.rejectionReason = '';
      } else {
        targetUser.verificationStatus = 'rejected';
        targetUser.rejectionReason = reason || 'Registration rejected by authority';
        targetUser.verifiedBy = new Types.ObjectId(req.user.userId);
        targetUser.verifiedAt = new Date();
      }

      await targetUser.save();

      return sendSuccess(
        res,
        { id: targetUser._id, status: targetUser.verificationStatus },
        `User registration ${action === 'APPROVE' ? 'verified & approved' : 'rejected'} successfully.`
      );
    } catch (err) {
      next(err);
    }
  }

  static async getDemoUsers(_req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const demoUsers = await User.find({
        email: { $in: [
          'student@campusflow.edu',
          'faculty@campusflow.edu',
          'hod@campusflow.edu',
          'jayashree140906@gmail.com',
        ] },
      }).select('name email role registerNumber staffId');

      return sendSuccess(res, demoUsers, 'Demo credentials fetched');
    } catch (err) {
      next(err);
    }
  }
}
