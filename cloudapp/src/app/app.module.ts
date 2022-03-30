import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule, LazyTranslateLoader, AlertModule } from '@exlibris/exl-cloudapp-angular-lib';
import { TranslateModule, TranslateLoader, TranslateParser } from '@ngx-translate/core';
import { TranslateICUParser } from 'ngx-translate-parser-plural-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { MainComponent } from './main/main.component';
import { SelectEntitiesModule } from 'eca-components';
import { AdlibComponent } from './adlib/adlib.component';
import { AlmaService } from './services/alma.service';
import { AdlibService } from './services/adlib.service';
import { ConfigurationComponent } from './configuration/configuration.component';
import { ConfigService } from './services/config.service';
import { NoConfigErrorComponent } from './static/errors.component';

export function CloudAppTranslateModuleWithICU() {
  return TranslateModule.forRoot({
    loader: {
      provide: TranslateLoader,
      useClass: (LazyTranslateLoader)
    },
    parser: {
      provide: TranslateParser,
      useClass: TranslateICUParser
    }
  });
}

@NgModule({
  declarations: [			
    AppComponent,
    MainComponent,
    AdlibComponent,
    ConfigurationComponent,
    NoConfigErrorComponent,
   ],
  imports: [
    MaterialModule,
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    SelectEntitiesModule,
    CloudAppTranslateModuleWithICU(),
    AlertModule,
  ],
  providers: [
    AlmaService,
    AdlibService,
    ConfigService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
