import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { Entity, EntityType } from '@exlibris/exl-cloudapp-angular-lib';

@Component({
  selector: 'app-select-entities',
  templateUrl: './select-entities.component.html',
  styleUrls: ['./select-entities.component.scss'],
  encapsulation: ViewEncapsulation.None /* apply to added elements */
})
export class SelectEntitiesComponent implements OnInit {
  masterChecked: boolean;
  masterIndeterminate: boolean;
  entities: SelectItem[];
  @Input() selectedEntities: Set<string>;
  @Output() entitySelected = new EventEmitter();

  constructor() { }

  ngOnInit() {
    this.masterChecked = false;
  }

  @Input()
  set entityList(val: Entity[]) {
    /* The Get PO Line API only takes code, so entity id based on type */
    this.entities = val.map(i=>new SelectItem(i, id => this.selectedEntities.has(id), i.type == EntityType.PO_LINE ? 'code' : 'id'));
    this.determineMasterValue();
  }

  masterChange() {
    Object.values(this.entities).forEach(b=>{
      b.checked = this.masterChecked;
      this.entitySelected.emit({id: b.id, checked: b.checked})
    })
  }

  listChange(e: MatCheckboxChange){
    this.determineMasterValue();
    this.entitySelected.emit({id: e.source.value, checked: e.checked});
  }

  determineMasterValue() {
    const checked_count = Object.values(this.entities).filter(i=>i.checked).length;
    this.masterChecked = checked_count == this.entities.length;
    this.masterIndeterminate = checked_count > 0 && checked_count < this.entities.length;
  }

  clear() {
    Object.values(this.entities).forEach(b=>b.checked = false);
    this.masterChecked = false;
    this.masterIndeterminate = false;
  }
}

export class SelectItem {
  checked: boolean;
  id: string;
  description: string;
  code: string;
  name: string;

  constructor(item: Partial<SelectItem>, checker: (id: string) => boolean, field: string = 'id') {
    Object.assign(this, item);
    this.id = item[field];
    this.name = (this.description || this.code) || this.id;
    this.checked = checker(item.id);
  }
}