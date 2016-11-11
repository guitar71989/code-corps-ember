import { moduleForComponent, test } from 'ember-qunit';
import donationContainerComponent from '../../../pages/components/donation/donation-container';
import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import PageObject from 'ember-cli-page-object';
import stubService from 'code-corps-ember/tests/helpers/stub-service';

let page = PageObject.create(donationContainerComponent);

const {
  K
} = Ember;

let setHandler = function(context, donateHandler = K) {
  context.set('donateHandler', donateHandler);
};

moduleForComponent('donation/donation-container', 'Integration | Component | donation/donation container', {
  integration: true,
  beforeEach() {
    setHandler(this);
    page.setContext(this);
  },
  afterEach() {
    page.removeContext();
  }
});

test('it renders correctly', function(assert) {
  assert.expect(3);

  this.set('amount', 100);
  this.set('projectTitle', 'CodeCorps');

  page.render(hbs`{{donation/donation-container donate=(action donateHandler) donationAmount=amount projectTitle=projectTitle}}`);

  assert.equal(page.donationAmountText, '$100.00 given each month', 'Amount text is rendered correctly');
  assert.equal(
    page.paymentInformationText,
    'Your payment method will be charged $100.00 per month to support CodeCorps.',
    'Payment information renders correctly.'
  );
  assert.ok(page.creditCardIsRendered, 'Credit card component is rendered.');
});

test('it handles clicking card submit button correctly', function(assert) {
  assert.expect(1);

  this.set('amount', 100);
  this.set('projectTitle', 'CodeCorps');

  let expectedProps = {
    cardNumber: '1234-5678-9012-3456',
    cvc: '123',
    month: '12',
    year: '2020'
  };

  function donateHandler(actualProps) {
    assert.deepEqual(actualProps, expectedProps, 'Card parameters were passed correctly.');
  }

  stubService(this, 'stripe', {
    card: {
      validateCardNumber: () => true,
      validateCVC: () => true,
      validateExpiry: () => true
    }
  });

  setHandler(this, donateHandler);

  page.render(hbs`{{donation/donation-container donate=(action donateHandler) donationAmount=amount projectTitle=projectTitle}}`);

  page.creditCard
      .cardNumber(expectedProps.cardNumber)
      .cardMonth(expectedProps.month)
      .cardYear(expectedProps.year)
      .cardCVC(expectedProps.cvc)
      .clickSubmit();
});
