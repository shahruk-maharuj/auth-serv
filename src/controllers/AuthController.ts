import { Response } from 'express';
import { RegisterUserRequest } from '../types';
import { UserService } from '../services/UserService';

export class AuthController {
  constructor(private userService: UserService) {}

  async register(req: RegisterUserRequest, res: Response) {
    const { firstName, lastName, email, password } = req.body;
    await this.userService.create({ firstName, lastName, email, password });
    // Return dummy token just for testing
    return res.status(201).json({ token: 'dummy-token' });
  }
}
