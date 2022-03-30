import { Component, Injectable, OnInit, ViewChild } from '@angular/core';
import { Entity, CloudAppEventsService, EntityType } from '@exlibris/exl-cloudapp-angular-lib';
import { Observable, Subscription } from 'rxjs';
import { CanActivate, Router } from '@angular/router';
import { SelectEntitiesComponent } from 'eca-components';
import { ConfigService } from '../services/config.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  selectedEntities = new Array<Entity>();
  entityCount = 0;
  @ViewChild(SelectEntitiesComponent) selectEntities: SelectEntitiesComponent;

  constructor(
    private eventsService: CloudAppEventsService,
    private router: Router
  ) { }

  ngOnInit() {
  }

  ngOnDestroy(): void {
  }

  update() {
    const params = {
      ids: this.selectedEntities.map(e => e.id).join(','), 
    };
    this.router.navigate(['adlib', params]);
  }

  clear() {
    this.selectEntities.clear();
  }
}


@Injectable({
  providedIn: 'root',
})
export class MainGuard implements CanActivate {
  constructor(
    private configService: ConfigService,
    private router: Router
  ) {}
  canActivate(): Observable<boolean> {
    return this.configService.get().pipe( map( config => {
      if (!config.adlibBaseUrl) {
        this.router.navigate(['/errors/noconfig']);
        return false;
      }
      return true;
    }))
  }
}