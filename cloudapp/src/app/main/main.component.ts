import { Component, OnInit, ViewChild } from '@angular/core';
import { Entity, CloudAppEventsService, EntityType } from '@exlibris/exl-cloudapp-angular-lib';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { SelectEntitiesComponent } from '../select-entities/select-entities.component';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  private pageLoad$: Subscription;
  ids = new Set<string>();
  entities: Entity[] = [];
  @ViewChild(SelectEntitiesComponent) selectEntities: SelectEntitiesComponent;

  constructor(
    private eventsService: CloudAppEventsService,
    private router: Router
  ) { }

  ngOnInit() {
    this.pageLoad$ = this.eventsService.onPageLoad( pageInfo => {
      this.entities = (pageInfo.entities)
      .filter(e=>[EntityType.PO_LINE].includes(e.type));
    });
  }

  ngOnDestroy(): void {
    this.pageLoad$.unsubscribe();
  }

  onEntitySelected(event) {
    if (event.checked) this.ids.add(event.id);
    else this.ids.delete(event.id);
  }

  update() {
    const params = {
      ids: Array.from(this.ids).join(','), 
    };
    this.router.navigate(['adlib', params]);
  }

  clear() {
    this.ids.clear();
    this.selectEntities.clear();
  }
}
