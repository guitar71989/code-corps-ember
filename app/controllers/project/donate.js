import Ember from 'ember';

const {
  Controller,
  computed: { alias },
  inject: { service },
  RSVP
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
                 .then((tokenData) => this._createSubscription(tokenData, amount))
                 .then(() => this._transitionToThankYou())
                 .catch((reason) => this._handleError(reason))
                 .finally(() => this.set('isLoading', false));
    }
  },

  _createCreditCardToken(cardParams) {
    let stripeCard = this._stripeCardFromParams(cardParams);
    let stripe = this.get('stripe');

    return stripe.card.createToken(stripeCard);
  },

  _createSubscription(cardToken, amount) {
    let { project, store, user } = this.getProperties('project', 'store', 'user');
    let subscription = store.createRecord('stripe-subscription', { amount, project, user });

    return subscription.save();
  },

  _transitionToThankYou() {
    let project = this.get('project');
    return this.transitionToRoute('project.thankyou', project);
  },

  _handleError(response) {
    if (response.isAdapterError) {
      return this._handleSubscriptionErrors(response);
    } else if (response.error.type === "card_error") {
      return this._handleStripeError(response);
    } else {
      // Rethrow if error type is not handled
      return RSVP.reject(response);
    }
  },

  _handleStripeError(response) {
    this.set('stripeError', response);
  },

  _handleSubscriptionErrors(response) {
    let { errors, status } = response;
    let payloadContainsValidationErrors = errors.some(() => status === 422);

    if (!payloadContainsValidationErrors) {
      this.set('subscriptionValidationErrors', response);
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
});
