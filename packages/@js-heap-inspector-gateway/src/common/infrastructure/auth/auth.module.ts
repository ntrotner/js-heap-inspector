import {
  BcryptPasswordService,
  JwtService,
  JwtStrategy,
  TypeOrmAuthRepository,
  TypeOrmUserRepository,
} from '@js-heap-inspector-gateway/common/infrastructure/auth/infrastructure';
import {
  Module,
} from '@nestjs/common';
import {
  TypeOrmModule,
} from '@nestjs/typeorm';
import {
  AuthRepository,
  Role,
  User,
  UserRepository,
} from '@js-heap-inspector-gateway/common/infrastructure/auth/domain';
import {
  JwtModule,
} from '@nestjs/jwt';
import {
  AssignRoleUseCase,
  FetchUserUseCase,
  JwtServiceInterface,
  LoginUserUseCase,
  PasswordServiceInterface,
  RegisterUserUseCase,
} from '@js-heap-inspector-gateway/common/infrastructure/auth/application';
import {
  AuthController,
} from '@js-heap-inspector-gateway/common/infrastructure/auth/presentation';

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
      provide: AuthRepository,
      useExisting: TypeOrmAuthRepository,
    },
    {
      provide: PasswordServiceInterface,
      useClass: BcryptPasswordService,
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
    RegisterUserUseCase,
    LoginUserUseCase,
    AssignRoleUseCase,
    FetchUserUseCase,
  ],
  exports: [],
  controllers: [AuthController],
})
export class AuthModule {}
