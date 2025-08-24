import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import { Repository } from 'typeorm';
import { User } from '../entity/User';
import { LimitedUserData, UserData } from '../types';

export class UserService {
  constructor(private userRepository: Repository<User>) {}

  async create({
    firstName,
    lastName,
    email,
    password,
    role,
    tenantId,
  }: UserData) {
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      const err = createHttpError(400, 'Email already exists');
      throw err;
    }
    // hash the password before storing it
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    try {
      return await this.userRepository.save({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role,
        tenant: tenantId ? { id: tenantId } : undefined,
      });
    } catch {
      const error = createHttpError(
        500,
        'Failed to store data in the database',
      );
      throw error;
    }
  }

  async findByEmailWithPassword(email: string) {
    return await this.userRepository.findOne({
      where: { email },
      select: ['id', 'firstName', 'lastName', 'email', 'password', 'role'],
    });
  }

  async findById(id: number) {
    return await this.userRepository.findOne({
      where: { id },
    });
  }

  async update(userId: number, { firstName, lastName, role }: LimitedUserData) {
    try {
      return await this.userRepository.update(userId, {
        firstName,
        lastName,
        role,
      });
    } catch {
      const error = createHttpError(
        500,
        'Failed to update the user in the database',
      );
      throw error;
    }
  }

  async getAll() {
    return await this.userRepository.find();
  }

  async deleteById(userId: number) {
    return await this.userRepository.delete(userId);
  }
}
