import Ember from 'ember';

const {
  Controller,
  computed: { alias },
  inject: { service }
} = Ember;

export default Controller.extend({
  queryParams: ['amount'],
  amount: null,

  currentUser: service(),
  store: service(),
  stripe: service(),

  project: alias('model'),
  user: alias('currentUser.user'),

  actions: {
    createCreditCardAndDonate(amount, cardParams) {
      this.set('isLoading', true);
      return this._createCreditCardToken(cardParams)
                 .then((cardToken) => this._donate(cardToken, amount))
                 .then((subscription) => this.set('subscription', subscription))
                 .catch(this._handleError)
                 .finally(() => this.set('isLoading', false));
    }
  },

  _stripeCardFromParams(cardParams) {
    return {
      number: cardParams.cardNumber,
      cvc: cardParams.cvc,
      exp_month: cardParams.month,
      exp_year: cardParams.year
    };
  },

  _createCreditCardToken(cardParams) {
    let stripeCard = this._stripeCardFromParams(cardParams);
    let stripe = this.get('stripe');

    return stripe.card.createToken(stripeCard);
  },

  _donate(cardToken, amount) {
    let { project, store, user } = this.getProperties('project', 'store', 'user');
    let subscription = store.createRecord('stripe-subscription', { amount, project, user });

    return subscription.save();
  },

  _handleError(response) {
    // TODO: Need check error type here and either call
    // _handleStripeError or _handleSubscriptionErrors
    console.log(response);
  },

  _handleStripeError(response) {
    // TODO: Write handler for stripe error. Probably set property on controller and
    // let a component render it
    console.log(response);
  },

  _handleSubscriptionErrors(response) {
    let { errors, status } = response;
    let payloadContainsValidationErrors = errors.some(() => status === 422);

    if (!payloadContainsValidationErrors) {
      this.set('subscriptionValidationErrors', response);
    }
  }
});
