/** Shared route param list for the Market Intelligence stack. */
export type MarketStackParamList = {
  MarketHome: undefined;
  PriceTrend: { cropId?: string } | undefined;
  MandiList: { cropId?: string } | undefined;
  DemandMap: { cropId?: string } | undefined;
  AIInsight: { cropId?: string } | undefined;
  Arrivals: { cropId?: string } | undefined;
  OversupplyAlert: { cropId?: string } | undefined;
  FindBuyers: { cropId?: string } | undefined;
  PriceForecast: { cropId?: string } | undefined;
  AlertsCentre: undefined;
  FilterSearch: undefined;
  CropCompare: undefined;
  MspFrp: undefined;
  MarketEmpty: undefined;
  // Cold storage booking flow (from a price-crash alert)
  ColdStorageList: { cropName?: string; quantityKg?: number; recommendedDays?: number } | undefined;
  ColdStorageDetail: { storageId: string };
  ColdStorageBooking: { storageId: string };
  StorageBookingConfirmed: { bookingId: string; storageName: string; quantityKg: number; durationDays: number; total: number };
  NotificationsCenter: undefined;
  Settings: undefined;
};
