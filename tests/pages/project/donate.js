import { create, visitable } from 'ember-cli-page-object';
import creditCard from '../components/donation/credit-card';

export default create({
  visit: visitable(':organization/:project/donate'),

  creditCard
});
