import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { AdlibData, isAdlibError } from '../models/adlib';
import { AdlibService } from '../services/adlib.service';
import { AlmaService } from '../services/alma.service';

@Component({
  selector: 'app-adlib',
  templateUrl: './adlib.component.html',
  styleUrls: ['./adlib.component.scss']
})
export class AdlibComponent implements OnInit {
  percentage = -1;
  ids: string[];
  loading = false;
  data: AdlibData[];
  results: any;

  constructor(
    private route: ActivatedRoute,
    private alma: AlmaService,
    private adlib: AdlibService,
    private translateService: TranslateService,
  ) { }

  ngOnInit() {
    this.ids = this.route.snapshot.params['ids'].split(',');
    this.loading = true;
    const calls = this.ids.map(id=>this.alma.getDataByPOLine(id));
    forkJoin(calls).pipe(finalize(()=>this.loading = false))
    .subscribe({
      next: resp => this.data = resp
    })

  }

  update() {
    this.loading = true;
    forkJoin(this.data.map(data=>this.adlib.insertRecord(data)))
    .subscribe({
      next: results => {
        console.log('resp', results);
        const details = results.map(result=>
          isAdlibError(result)
          ? { msg: this.translateService.instant('Form.FailureMessage', {message: result.error.error || result.error.message}), success: false } 
          : { msg: this.translateService.instant('Form.SuccessMessage', result), success: true });
        this.results = {
          successCount: details.filter(d=>d.success).length,
          failureCount: details.filter(d=>!d.success).length,
          details: details
        };
        this.data = null;
      },
      complete: () => this.loading = false
    });
  }
}
