import { Controller, Post } from '@nestjs/common';

import { AuthService } from '../auth/auth.service';
import { CvService } from '../cv/cv.service';
import { fakeCVS, fakeUsers } from '../data/constants';

@Controller('seed')
export class SeedController {
  constructor(
    private readonly authService: AuthService,
    private readonly cvService: CvService,
  ) {}

  @Post('all')
  async seedAll() {
    const createdUsers = [];

    for (let user of fakeUsers) {
      try {
        const newUser = await this.authService.signUpUser(user);
        createdUsers.push(newUser);
        console.log(`✅ User created: ${user.email}`);
      } catch (error) {
        console.warn(`⚠️ User skipped (already exists): ${user.email}`);
      }
    }

    for (let cv of fakeCVS) {
      try {
        const randomUser =
          createdUsers[Math.floor(Math.random() * createdUsers.length)];
        const newCv = await this.cvService.addCv({ ...cv, user: randomUser });
        console.log(
          `📄 CV "${newCv.name}" created and  associate to ${randomUser.email}`,
        );
      } catch (error) {
        console.warn(`⚠️ CV skipped (already exists): ${cv.name}`);
      }
    }
    return {
      users: createdUsers.length,
      cvs: fakeCVS.length,
      message: 'Seed successfully finished ✅',
    };
  }
}
