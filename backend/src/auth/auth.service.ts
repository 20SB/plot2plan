import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const user = await this.usersService.create(registerDto);
    const { password, ...userWithoutPassword } = user.toObject();

    const payload = { sub: user._id.toString(), email: user.email };
    const token = this.jwtService.sign(payload);

    return {
      user: userWithoutPassword,
      access_token: token,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.usersService.validatePassword(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    await this.usersService.updateLastLogin(user._id.toString());

    const { password, ...userWithoutPassword } = user.toObject();
    const payload = { sub: user._id.toString(), email: user.email };
    const token = this.jwtService.sign(payload);

    return {
      user: userWithoutPassword,
      access_token: token,
    };
  }

  async validateUser(email: string): Promise<any> {
    return this.usersService.findByEmail(email);
  }
}
