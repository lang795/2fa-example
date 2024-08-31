import {
    Controller,
    Get,
    Param,
    UseGuards,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { RoleType } from 'src/shared/role-type.enum';
import { HasRoles } from '../../auth/guard/has-roles.decorator';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../../auth/guard/roles.guard';
import { ParseObjectIdPipe } from '../../shared/parse-object-id.pipe';
import { PostService } from './post.service';

@Controller('post')
@UseGuards(JwtAuthGuard, RolesGuard)
@HasRoles(RoleType.USER, RoleType.ADMIN)
export class PostController {
    constructor(private readonly postService: PostService) {}

    @Get(':id')
    getPostById(
        @Param('id', ParseObjectIdPipe) id: string
    ): Observable<{ post: any }> {
        return this.postService.findById(id);
    }
}
