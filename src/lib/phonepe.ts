export const getPhonePePendingOrderStorageKey = (merchantOrderId: string) =>
  `phonepe:pending-order:${merchantOrderId}`;
