import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BiRoutingModule } from './bi-routing.module';
import { BiComponent } from './bi/bi.component';
import { SharedModule } from '@shared/shared.module';
import { DimensionComponent } from './dimension/dimension.component';
import { BiDataService } from './service/data.service';
import { ChartComponent } from './chart/chart.component';
import { ChoiceComponent } from './components/choice/choice.component';
import { ReferenceComponent } from './components/reference/reference.component';
import { CascadeComponent } from './components/cascade/cascade.component';

@NgModule({
    declarations: [
        BiComponent,
        DimensionComponent,
        ReferenceComponent,
        ChartComponent,
        ChoiceComponent,
        CascadeComponent,
    ],
    imports: [CommonModule, BiRoutingModule, SharedModule],
    providers: [BiDataService],
})
export class BiModule {}
