import { isVisible, text } from 'ember-cli-page-object';
import creditCard from './credit-card';

export default {
  scope: '.donation-container',

  creditCard,

  creditCardIsRendered: isVisible('.credit-card-form'),

  donationAmountText: text('.donation-amount'),
  paymentInformationText: text('.payment-information')
};
