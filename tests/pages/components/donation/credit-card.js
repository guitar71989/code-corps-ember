import { clickable, fillable, property, selectable } from 'ember-cli-page-object';

export default {
  scope: '.credit-card-form',

  allFieldDisabledStates: property('disabled', 'input, select', { multiple: true }),

  cardNumber: fillable('[name=card-number]'),
  cardMonth: selectable('select.month'),
  cardYear: selectable('select.year'),
  cardCVC: fillable('[name=card-cvc]'),

  clickSubmit: clickable('button')
};
