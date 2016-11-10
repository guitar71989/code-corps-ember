import Ember from 'ember';

const { Controller, RSVP } = Ember;

export default Controller.extend({
  queryParams: ['amount'],
  amount: null,

  actions: {
    createCreditCardAndDonate(amount, cardParams) {
      this._createCreditCard(cardParams).then((creditCard) => this._donate(creditCard, amount));
    }
  },

  _createCreditCard(cardParams) {
    return RSVP.resolve(cardParams);
  },

  _donate(creditCard, amout) {
    return { creditCard, amout };
  }
});
