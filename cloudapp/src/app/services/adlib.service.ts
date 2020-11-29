import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { CloudAppEventsService, HttpMethod } from "@exlibris/exl-cloudapp-angular-lib";
import { iif, Observable, of } from "rxjs";
import { catchError, map, switchMap, tap } from "rxjs/operators";
import { AdlibData, AdlibError, AdlibResponse, isAdlibError } from "../models/adlib";
import { select } from "../utilities";
import { ConfigService } from "./config.service";

const PROXY_URL = 'https://api-ap.exldevnetwork.net/proxy';

@Injectable()
export class AdlibService {
  token: string;

  constructor(
    private http: HttpClient,
    private eventsService: CloudAppEventsService,
    private configService: ConfigService,
  ) { }

  insertRecords(data: AdlibData) {
    let accessionResponse: AdlibResponse | AdlibError;
    return this.insertAccesesionRecord(data).pipe(
      tap(resp => accessionResponse = resp),
      switchMap(resp => iif(
        ()=>isAdlibError(resp),
        of({error: 'Catalog record skipped - Accession record was not created', data: data} as AdlibError),
        this.insertCatalogRecord(data)
      )),
      /* Return only accession record response, for now */
      map(resp=>accessionResponse)
    )
  }

  insertAccesesionRecord(data: AdlibData): Observable<AdlibResponse | AdlibError> {
    return wrapError(this.call({
      method: HttpMethod.POST,
      body: this.buildAdlibAccessionXml(data),
      db: 'accession',
      params: new HttpParams()
        .set('command', 'insertrecord')
        .set('xmltype', 'Unstructured')
        .set('data', '')
      })
      .pipe(
        map(result=> ({ mmsId: data.mmsId, priref: this.extractPriref(result) } as AdlibResponse))
      ),
    data);
  }

  insertCatalogRecord(data: AdlibData): Observable<AdlibResponse | AdlibError> {
    return wrapError(this.call({
      method: HttpMethod.POST,
      body: this.buildAdlibCatalogXml(data),
      db: 'catalog',
      params: new HttpParams()
        .set('command', 'insertrecord')
        .set('xmltype', 'Unstructured')
        .set('data', '')
      })
      .pipe(
        map(result=> ({ mmsId: data.mmsId, priref: this.extractPriref(result) } as AdlibResponse))
      ), 
    data);
  }

  extractPriref(record: string) {
    const doc = new DOMParser().parseFromString(record, "application/xml");
    const priref = select(doc, `/adlibXML/recordList/record/@priref`, { single: true }).singleNodeValue;
    return priref && priref.textContent;
  }

  searchRecord(id: string) {
    return this.call({
      params: new HttpParams()
        .set('search', `priref=${id}`)
    })
  }

  call(options: { method?: HttpMethod, params?: HttpParams, body?: string, db?: 'accession' | 'catalog' }) {
    return iif(()=>this.token == undefined,
      this.eventsService.getAuthToken().pipe(tap(token=>this.token = token)),
      of(this.token)
    ).pipe(
      switchMap(()=>this.configService.get()),
      switchMap(config=>{
        const url = new URL(config.adlibBaseUrl);
        const db = options.db == 'catalog' ? config.adlibCatalogDb : config.adlibAccessionDb;
        const reqUrl = `${PROXY_URL}${url.pathname}?database=${db}`;
        const headers = new HttpHeaders({
          'X-Proxy-Host': url.hostname,
          'X-Proxy-Auth': config.adlibAuth,
          'Authorization': `Bearer ${this.token}`,
          'Content-type': 'application/xml'
        })
        const opts = { headers, params: options.params, responseType: 'text' as 'json' };
        switch (options.method || HttpMethod.GET) {
          case HttpMethod.GET:
            return wrapError(this.http.get(reqUrl, opts));
          case HttpMethod.PUT:
            return wrapError(this.http.put(reqUrl, options.body, opts));
          case HttpMethod.POST:
            return wrapError(this.http.post(reqUrl, options.body, opts));
          case HttpMethod.DELETE:
            return wrapError(this.http.delete(reqUrl, opts));
        }
      }),
      map(response=>{
        const doc = new DOMParser().parseFromString(response, "application/xml");
        const errormsg = select(doc, `/adlibXML/diagnostic/error/message`, { single: true }).singleNodeValue;
        if (errormsg) {
          throw new Error(errormsg.textContent);
        } else {
          return response;
        }
      })
    )
  }

  buildAdlibAccessionXml(data: AdlibData) {
    return `
    <adlibXML>
      <recordList>
        <record priref="0">
          <title>${data.title}</title>
          <object_number>${data.mmsId}</object_number>
          <dimension.free>${data.physicalExtent}</dimension.free>
          <accession_date>${data.accessionDate}</accession_date>
          <acquisition.price.value>${data.price}</acquisition.price.value>
          <valuation_AUD>${data.valuation}</valuation_AUD>
          <acquisition.price.currency>${data.currency}</acquisition.price.currency>
          <acquisition.notes>${data.vendor}</acquisition.notes>
          <mitchell_number>${data.mitchellNumber}</mitchell_number>
        </record>
      </recordList>
    </adlibXML>
    `;
  }

  buildAdlibCatalogXml(data: AdlibData) {
    return `
    <adlibXML>
      <recordList>
        <record priref="0">
          <title>${data.title}</title>
          <related_accession_number>${data.mmsId}</related_accession_number>
          <dimension.free>${data.physicalExtent}</dimension.free>
          <acquisition.notes>${data.vendor}</acquisition.notes>
        </record>
      </recordList>
    </adlibXML>    
    `
  }
}

const wrapError = (obs: Observable<any>, data?: AdlibData): Observable<any> => {
  return obs.pipe(catchError(e=>of({error: e, data})))
}