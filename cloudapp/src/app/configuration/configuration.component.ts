import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from '@exlibris/exl-cloudapp-angular-lib';
import { Config } from '../models/config';
import { ConfigService } from '../services/config.service';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss']
})
export class ConfigurationComponent implements OnInit {
  @ViewChild('adlibuser') username: ElementRef;
  @ViewChild('adlibpass') password: ElementRef;
  form: FormGroup;
  saving = false;

  constructor(
    private configService: ConfigService,
    private alert: AlertService,
    private translate: TranslateService,
  ) { }

  ngOnInit() {
    this.load();
  }

  load() {
    this.configService.get().subscribe( config => this.form = configFormGroup(config));
  }

  save() {
    this.saving = true;
    let val = this.form.value;
    const username = this.username.nativeElement.value, password = this.password.nativeElement.value;

    if (username && password) val.adlibAuth = btoa(`${username}:${password}`);
    this.configService.set(val).subscribe(
      () => {
        this.alert.success(this.translate.instant('Configuration.Success'));
        this.form.markAsPristine();
      },
      err => this.alert.error(err.message),
      ()  => this.saving = false
    );
  }  
}

const configFormGroup = (config: Config) => {
  return new FormGroup({
    adlibBaseUrl: new FormControl(config.adlibBaseUrl),
    adlibAuth: new FormControl(config.adlibAuth),
    adlibAccessionDb: new FormControl(config.adlibAccessionDb),
    adlibCatalogDb: new FormControl(config.adlibCatalogDb),
    mitchellRegex: new FormControl(config.mitchellRegex),
  })
}