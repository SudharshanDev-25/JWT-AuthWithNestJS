import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { UserRegister } from './dto/user-reg.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './entities/user.entity';
import { LoginUser } from './dto/user-login.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwt: JwtService,
  ) {}
  async create(registerDto: UserRegister) {
    const existingUser = await this.userModel.findOne({
      email: registerDto.email,
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const newUser = await this.userModel.create({
      ...registerDto,
      password: hashedPassword,
    });
    const tokens = await this.getTokens(newUser._id.toString(), newUser.email);

    return tokens;
  }

  async loginUser(loginDto: LoginUser) {
    const user = await this.userModel.findOne({ email: loginDto.email });
    if (!user) throw new BadRequestException('Invalid credentials');
    const match = await bcrypt.compare(loginDto.password, user.password);
    if (!match) throw new BadRequestException('Invalid credentials');
    const tokens = await this.getTokens(user._id.toString(), user.email);

    return tokens;
  }

  async getTokens(id: string, email: string) {
    const payload = { sub: id, email };
    const accessToken = await this.jwt.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '1h',
    });
    return { accessToken };
  }
}
