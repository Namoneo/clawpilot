import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { GithubAuthService } from './github-auth.service';

@Controller('auth/github')
export class GithubAuthController {
  constructor(private githubAuthService: GithubAuthService) {}

  @Get()
  redirectToGithub(@Res() res: Response) {
    const authUrl = this.githubAuthService.getGithubAuthUrl();
    return res.redirect(authUrl);
  }

  @Get('callback')
  async handleCallback(@Query('code') code: string, @Res() res: Response) {
    try {
      const accessToken = await this.githubAuthService.exchangeCodeForToken(code);
      const githubUser = await this.githubAuthService.getGithubUser(accessToken);
      const emails = await this.githubAuthService.getGithubUserEmails(accessToken);
      
      githubUser.emails = emails;
      
      const user = await this.githubAuthService.validateGithubUser(githubUser);
      const loginResult = await this.githubAuthService.login(user);

      // Redirect to frontend with token
      const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:4200'}/auth/callback?token=${loginResult.access_token}`;
      
      return res.redirect(redirectUrl);
    } catch (error) {
      console.error('GitHub OAuth error:', error);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:4200'}/login?error=github_auth_failed`);
    }
  }
}
