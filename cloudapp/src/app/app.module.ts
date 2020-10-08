import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule, LazyTranslateLoader } from '@exlibris/exl-cloudapp-angular-lib';
import { ToastrModule } from 'ngx-toastr';
import { TranslateModule, TranslateLoader, TranslateParser } from '@ngx-translate/core';
import { TranslateICUParser } from 'ngx-translate-parser-plural-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { MainComponent } from './main/main.component';
import { SelectEntitiesComponent } from './select-entities/select-entities.component';
import { AdlibComponent } from './adlib/adlib.component';
import { AlmaService } from './services/alma.service';
import { AdlibService } from './services/adlib.service';
import { ConfigurationComponent } from './configuration/configuration.component';
import { ConfigService } from './services/config.service';
import { NoConfigErrorComponent } from './static/errors.component';

export function getToastrModule() {
  return ToastrModule.forRoot({
    positionClass: 'toast-top-right',
    timeOut: 2000
  });
}

export function getTranslateModuleWithICU() {
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
    SelectEntitiesComponent,
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
    getTranslateModuleWithICU(),
    getToastrModule(),
  ],
  providers: [
    AlmaService,
    AdlibService,
    ConfigService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
