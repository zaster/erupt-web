import { ExceptionModule } from '@delon/abc/exception';
import { NoticeIconModule } from '@delon/abc/notice-icon';
import { SidebarNavModule } from '@delon/abc/sidebar-nav';
import { PageHeaderModule } from '@delon/abc/page-header';
import { ResultModule } from '@delon/abc/result';
import { SEModule } from '@delon/abc/se';
import { STModule } from '@delon/abc/st';
import { SVModule } from '@delon/abc/sv';
import { DelonACLModule } from '@delon/acl';
import { DelonFormModule } from '@delon/form';

export const SHARED_DELON_MODULES = [
    STModule,
    SVModule,
    SEModule,
    PageHeaderModule,
    ResultModule,
    ExceptionModule,
    NoticeIconModule,
    SidebarNavModule,
    DelonFormModule,
];
