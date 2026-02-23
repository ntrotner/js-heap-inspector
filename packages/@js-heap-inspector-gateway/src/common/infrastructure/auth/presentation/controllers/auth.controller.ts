import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  AssignRoleDto,
  AssignRoleUseCase,
  FetchUserDto,
  FetchUserUseCase,
  LoginUserDto,
  LoginUserUseCase,
  RegisterUserDto,
  RegisterUserUseCase,
  UserProfileResponseDto,
  UserResponseDto,
} from '@js-heap-inspector-gateway/common/infrastructure/auth/application';
import {
  RolesGuard,
} from '@js-heap-inspector-gateway/common/infrastructure/auth/infrastructure';
import {
  ApiBearerAuth,
} from '@nestjs/swagger';

/**
 * Auth controller for handling authentication-related routes.
 */
@ApiBearerAuth()
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
  @UseGuards(RolesGuard('admin'))
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
  @UseGuards(RolesGuard(['user', 'admin']))
  async profile(@Body() dto: FetchUserDto): Promise<UserProfileResponseDto | undefined> {
    return this.fetchUserUseCase.execute(dto);
  }
}
