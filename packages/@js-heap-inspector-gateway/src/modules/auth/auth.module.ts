import {
  Module,
} from '@nestjs/common';
import {
  TypeOrmModule,
} from '@nestjs/typeorm';
import {
  JwtModule,
} from '@nestjs/jwt';
import {
  User,
} from './domain/entities/user.entity';
import {
  Role,
} from './domain/entities/role.entity';
import {
  TypeOrmUserRepository,
} from './infrastructure/repositories/typeorm-user.repository';
import {
  TypeOrmAuthRepository,
} from './infrastructure/repositories/typeorm-auth.repository';
import {
  JwtService,
} from './infrastructure/services/jwt.service';
import {
  BcryptPasswordService,
} from './infrastructure/services/bcrypt-password.service';
import {
  JwtStrategy,
} from './infrastructure/strategies/jwt.strategy';
import {
  RolesGuard,
} from './infrastructure/guards/roles.guard';
import {
  AuthController,
} from './presentation/controllers/auth.controller';
import {
  RegisterUserUseCase,
} from './application/services/register-user.use-case';
import {
  LoginUserUseCase,
} from './application/services/login-user.use-case';
import {
  AssignRoleUseCase,
} from './application/services/assign-role.use-case';
import {
  UserRepository,
} from './domain/repositories/user.repository.interface';
import {
  PasswordServiceInterface,
} from './application/interfaces/password.service.interface';
import {
  JwtServiceInterface,
} from './application/interfaces/jwt.service.interface';
import {FetchUserUseCase} from "./application/services/fetch-user.use-case";

/**
 * Auth module for handling authentication-related functionality.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {expiresIn: '1h'},
    }),
  ],
  providers: [
    {
      provide: UserRepository,
      useExisting: TypeOrmUserRepository,
    },
    {
      provide: PasswordServiceInterface,
      useExisting: BcryptPasswordService,
    },
    {
      provide: JwtServiceInterface,
      useExisting: JwtService,
    },
    TypeOrmUserRepository,
    TypeOrmAuthRepository,
    JwtService,
    BcryptPasswordService,
    JwtStrategy,
    RolesGuard,
    RegisterUserUseCase,
    LoginUserUseCase,
    AssignRoleUseCase,
    FetchUserUseCase,
  ],
  exports: [TypeOrmUserRepository, JwtService],
  controllers: [AuthController],
})
export class AuthModule {}
