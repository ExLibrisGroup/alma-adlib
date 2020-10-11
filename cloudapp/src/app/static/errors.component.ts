import { Component } from "@angular/core";
import { CloudAppEventsService } from "@exlibris/exl-cloudapp-angular-lib";

@Component({
  template: `<p translate>Errors.NoConfig</p>
  <p *ngIf="isAdmin">
    <a [routerLink]="['/configuration']"><span translate>Errors.ConfigLink</span></a>
  </p>
  `,
})
export class NoConfigErrorComponent  {
  isAdmin = false;
  constructor(private eventsService: CloudAppEventsService) {}

  ngOnInit() {
    this.eventsService.getInitData()
    .subscribe(result => this.isAdmin = result.user.isAdmin);
  }
}