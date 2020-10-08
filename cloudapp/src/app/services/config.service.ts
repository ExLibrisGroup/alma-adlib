import { Injectable } from "@angular/core";
import { CloudAppSettingsService } from "@exlibris/exl-cloudapp-angular-lib";
import { Observable, of } from "rxjs";
import { map, tap } from "rxjs/operators";
import { Config } from "../models/config";

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  _config: Config;

  constructor( 
    private configService: CloudAppSettingsService
  ) {  }

  get(): Observable<Config> {
    if (this._config) {
      return of(this._config);
    } else {
      return this.configService.get()
        .pipe(
          map(config=> Object.keys(config).length==0 ? new Config() : config),
          tap(config=>this._config=config)
        );
    }
  }

  set(val: Config) {
    this._config = val;
    return this.configService.set(val);
  }

}