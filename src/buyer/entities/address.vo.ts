export class Address {
  street_line_1: string;
  street_line_2?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country: string;
  label?: string;
  isDefault?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
