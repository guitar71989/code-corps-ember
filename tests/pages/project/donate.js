import { create, visitable } from 'ember-cli-page-object';
import creditCard from '../components/donation/credit-card';
import errorFormatter from '../components/error-formatter';

export default create({
  visit: visitable(':organization/:project/donate'),

  errorFormatter,
  creditCard
});
