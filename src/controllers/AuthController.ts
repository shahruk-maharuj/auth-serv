import { Request, Response } from 'express';

export class AuthController {
  register(req: Request, res: Response) {
    const token = 'someToken'; // or generated JWT
    res.status(201).json({ token });
  }
}
