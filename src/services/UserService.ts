import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import { Repository } from 'typeorm';
import { Roles } from '../constants';
import { User } from '../entity/User';
import { UserData } from '../types';

export class UserService {
  constructor(private userRepository: Repository<User>) {}

  async create({ firstName, lastName, email, password }: UserData) {
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
        role: Roles.CUSTOMER,
      });
    } catch {
      const error = createHttpError(
        500,
        'Failed to store data in the database',
      );
      throw error;
    }
  }

  async findByEmail({ email }: { email: string }) {
    return await this.userRepository.findOne({
      where: { email },
    });
  }

  async findById(id: number) {
    return await this.userRepository.findOne({
      where: { id },
    });
  }
}
