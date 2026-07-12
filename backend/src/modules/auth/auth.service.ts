import { prisma } from '../../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';

export const authService = {
  async login(email: string, password: string) {
    // TODO: implement in Phase 1
    // 1. Find user by email
    // 2. Compare bcrypt hash
    // 3. Sign JWT with { id, role, name }
    throw new Error('Not implemented');
  },
};
