import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
} from '@nestjs/common';
import {
  RegisterUserUseCase,
} from '../../application/services/register-user.use-case';
import {
  LoginUserUseCase,
} from '../../application/services/login-user.use-case';
import {
  AssignRoleUseCase,
} from '../../application/services/assign-role.use-case';
import {
  RegisterUserDto,
} from '../../application/dtos/register-user.dto';
import {
  LoginUserDto,
} from '../../application/dtos/login-user.dto';
import {
  AssignRoleDto,
} from '../../application/dtos/assign-role.dto';
import {
  UserResponseDto,
} from '../../application/dtos/user-response.dto';
import {
  RolesGuard,
} from '../../infrastructure/guards/roles.guard';
import {
  Roles,
} from '../../infrastructure/decorators/roles.decorator';
import {
  UserProfileResponseDto,
} from '../../application/dtos/user-profile-response.dto';
import {
  FetchUserUseCase,
} from '../../application/services/fetch-user.use-case';
import {
  FetchUserDto,
} from '../../application/dtos/fetch-user.dto';

/**
 * Auth controller for handling authentication-related routes.
 */
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly assignRoleUseCase: AssignRoleUseCase,
    private readonly fetchUserUseCase: FetchUserUseCase,
  ) {}

  /**
   * Registers a new user.
   *
   * @param {RegisterUserDto} dto - The registration data.
   * @return {Promise<UserResponseDto>} A promise that resolves to the user response.
   */
  @Post('register')
  async register(@Body() dto: RegisterUserDto): Promise<UserResponseDto> {
    return this.registerUserUseCase.execute(dto);
  }

  /**
   * Logs in a user.
   *
   * @param {LoginUserDto} dto - The login data.
   * @return {Promise<UserResponseDto>} A promise that resolves to the user response.
   */
  @Post('login')
  async login(@Body() dto: LoginUserDto): Promise<UserResponseDto> {
    return this.loginUserUseCase.execute(dto);
  }

  /**
   * Assigns a role to a user.
   *
   * @param {AssignRoleDto} dto - The role assignment data.
   * @return {Promise<void>} A promise that resolves when the role is assigned.
   */
  @Post('assign-role')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async assignRole(@Body() dto: AssignRoleDto): Promise<void> {
    return this.assignRoleUseCase.execute(dto);
  }

  /**
   * Gets the user profile.
   *
   * @param {FetchUserDto} dto - The fetch user data.
   * @return {Promise<UserProfileResponseDto>} A promise that resolves to the user response.
   */
  @Get('profile')
  @UseGuards(RolesGuard)
  async profile(@Body() dto: FetchUserDto): Promise<UserProfileResponseDto | undefined> {
    return this.fetchUserUseCase.execute(dto);
  }
}
