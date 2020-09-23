
export interface AdlibData {
  mmsId: string; // MMS (001)
  title: string; // MMS (245)
  physicalExtent: string; // MMS (300) 
  approvalDate: Date; // Invoice approval date
  closureDate: Date; // Invoice closure date
  price: number; // POL price 
  currency: string; // POL currency
  vendor: string; // POL vendor name
  note: string; // POL first note
  invoiceId: string;
}