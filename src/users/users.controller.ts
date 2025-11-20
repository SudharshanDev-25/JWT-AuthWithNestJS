import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserRegister } from './dto/user-reg.dto';
import { LoginUser } from './dto/user-login.dto';

@Controller('/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/save')
  create(@Body() newUser: UserRegister) {
    return this.usersService.create(newUser);
  }

  @Post('/login')
  login(@Body() loginDto: LoginUser) {
    return this.usersService.loginUser(loginDto);
  }
}
