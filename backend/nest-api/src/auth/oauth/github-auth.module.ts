import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GithubAuthService } from './github-auth.service';
import { GithubAuthController } from './github-auth.controller';
import { User } from '../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [GithubAuthController],
  providers: [GithubAuthService],
  exports: [GithubAuthService],
})
export class GithubAuthModule {}
