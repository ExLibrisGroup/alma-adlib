import { Injectable } from "@angular/core";
import { CloudAppRestService } from "@exlibris/exl-cloudapp-angular-lib";
import { AdlibData } from "../models/adlib";
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { iif, Observable, of } from "rxjs";
import { select } from "../utilities";

@Injectable()
export class AlmaService {

  constructor(
    private restService: CloudAppRestService
  ) {}

  getDataByPOLine(num: string): Observable<AdlibData> {
    let poline: any, bib: any;
    return this.getPOLine(num).pipe(
      tap(resp => poline = resp),
      switchMap(() => iif(
        () => !!(poline.mmsId),
        this.getBib(poline.mmsId),
        of(null)
      )),
      tap(resp => bib = resp),
      switchMap(() => iif(
        () => !!(poline.invoiceId),
        this.getInvoice(poline.invoiceId),
        of(null)
      )),
      map(invoice=>{
        /* If invoice exists, populate price; otherwise leave valuation */
        let price = {};
        if (invoice != null) {
          price['valuation'] = null;
          price['price'] = poline.valuation;
        }
        return Object.assign({}, bib, poline, invoice, price) as AdlibData
      })
    )
  }

  getPOLine(num: string): Observable<any> {
    const mltest = /ML\d/;
    return this.restService.call(`/acq/po-lines/${num}`).pipe(
      map(poline=>({
        valuation: poline.price.sum,
        currency: poline.price.currency.value,
        vendor: poline.vendor.desc,
        mitchellNumber: (Array.isArray(poline.note) && poline.note.some(n=>mltest.test(n.note_text)) && poline.note.find(n=>mltest.test(n.note_text)).note_text) || '',
        invoiceId: poline.invoice_reference,
        accessionDate: poline.created_date,
        mmsId: (poline.resource_metadata && poline.resource_metadata.mms_id) 
          ? poline.resource_metadata.mms_id.value
          : null
      }))
    )
  }

  

  getInvoice(number: string): Observable<any> {
    return this.restService.call(`/acq/invoices?q=all~${number}`).pipe(
      switchMap(invoices=>iif(()=>Array.isArray(invoices.invoice) && invoices.invoice.length>0,
        this.restService.call(invoices.invoice[0].link),
        of(null))),
      catchError(()=>of(null)),
      map(invoice => invoice 
        ? { accessionDate: invoice.invoice_date } 
        : { }
      )
    )
  }

  getBib(mmsId: string): Observable<any> {
    return this.restService.call(`/bibs/${mmsId}`).pipe(
      map(bib=>{
        const doc = new DOMParser().parseFromString(bib.anies, "application/xml");
        const physicalExtent = select(doc, `/record/datafield[@tag='300']/subfield[@code='a']`, { single: true });
        return {
          mmsId: bib.mms_id,
          title: bib.title,
          physicalExtent: physicalExtent && physicalExtent.singleNodeValue && physicalExtent.singleNodeValue.textContent
        }
      })
    )

  }

}