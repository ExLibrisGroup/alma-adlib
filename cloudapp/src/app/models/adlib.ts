
export interface AdlibData {
  mmsId: string; // MMS (001)
  title: string; // MMS (245)
  physicalExtent: string; // MMS (300) 
  accessionDate: Date; // Invoice date or PO Line sent date
  price: number; // POL price 
  valuation: number;
  currency: string; // POL currency
  vendor: string; // POL vendor name
  mitchellNumber: string; // POL first note
  invoiceId: string;
}

export interface AdlibResponse {
  mmsId: string;
  priref: string;
}

export interface AdlibError {
  error: any;
}

export const isAdlibError = (obj: any): obj is AdlibError => obj.error !== undefined;