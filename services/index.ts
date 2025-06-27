import { CrudService } from './crud';
import { authService } from './auth';

export const services = {
  auth: authService,
  users: new CrudService('users'),
  artists: new CrudService('artists'),
  homeImages: new CrudService('home-images'),
  images: new CrudService('images'),
  orders: new CrudService('orders'),
  products: new CrudService('products'),
  queue: new CrudService('queue'),
  subjects: new CrudService('subjects'),
};

export type Services = typeof services;
