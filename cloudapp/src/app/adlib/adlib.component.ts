import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
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
  data: any;

  constructor(
    private route: ActivatedRoute,
    private alma: AlmaService,
  ) { }

  ngOnInit() {
    this.ids = this.route.snapshot.params['ids'].split(',');
    this.loading = true;
    const calls = this.ids.map(id=>this.alma.getDataByPOLine(id));
    forkJoin(calls).pipe(finalize(()=>this.loading = false))
    .subscribe({
      next: resp => {
        console.log('resp', resp);
        this.data = resp;
      }
    })

  }

}
