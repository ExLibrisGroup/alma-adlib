import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
  isAdlibError = isAdlibError;
  results: {successCount: number; failureCount: number; details: any[]};

  constructor(
    private route: ActivatedRoute,
    private alma: AlmaService,
    private adlib: AdlibService,
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
    forkJoin(this.data.map(data=>this.adlib.insertRecords(data)))
    .subscribe({
      next: results => {
        this.results = {
          successCount: results.filter(d=>!isAdlibError(d)).length,
          failureCount: results.filter(d=>isAdlibError(d)).length,
          details: results
        };
        this.data = null;
      },
      complete: () => this.loading = false
    });
  }
}
