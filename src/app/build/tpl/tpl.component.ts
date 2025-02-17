import {Component, OnDestroy, OnInit} from '@angular/core';
import {DataService} from "@shared/service/data.service";
import {Subscription} from "rxjs";
import {ActivatedRoute, Router} from "@angular/router";
import {SettingsService} from "@delon/theme";

@Component({
    selector: 'app-tpl',
    templateUrl: './tpl.component.html'
})
export class TplComponent implements OnInit, OnDestroy {

    url: string;

    spin: boolean = true;


    private router$: Subscription;

    constructor(private dataService: DataService,
                public settingSrv: SettingsService,
                public route: ActivatedRoute) {
    }

    ngOnInit() {
        this.router$ = this.route.params.subscribe((params) => {
            this.url = this.dataService.getEruptTpl(params.name);
        });
    }

    ngOnDestroy(): void {
        this.router$.unsubscribe();
    }

    iframeLoad() {
        this.spin = false;
    }

}
