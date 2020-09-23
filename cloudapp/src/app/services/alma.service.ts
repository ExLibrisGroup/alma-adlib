import { Injectable } from "@angular/core";
import { CloudAppRestService } from "@exlibris/exl-cloudapp-angular-lib";
import { AdlibData } from "../models/adlib";
import { map, switchMap, tap } from 'rxjs/operators';
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
      map(invoice=>Object.assign({}, invoice, bib, poline) as AdlibData)
    )
  }

  getPOLine(num: string): Observable<any> {
    return this.restService.call(`/acq/po-lines/${num}`).pipe(
      map(poline=>({
        price: poline.price.sum,
        currency: poline.price.currency.value,
        vendor: poline.vendor.value,
        note: poline.note[0] && poline.note[0].note_text,
        invoiceId: poline.invoice_reference,
        mmsId: (poline.resource_metadata && poline.resource_metadata.mms_id) 
          ? poline.resource_metadata.mms_id.value
          : null
      }))
    )
  }

  getInvoice(id: string): Observable<any> {
    return this.restService.call(`/acq/invoices/${id}`).pipe(
      map(invoice=>({
        approvalDate: null, // Invoice approval date
        closureDate: null // Invoice closure date
      }))
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
          physicalExtent: physicalExtent && physicalExtent.singleNodeValue.textContent
        }
      })
    )

  }

}