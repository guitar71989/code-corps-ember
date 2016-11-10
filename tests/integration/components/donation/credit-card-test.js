import { moduleForComponent, test } from 'ember-qunit';
import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import PageObject from 'ember-cli-page-object';
import stubService from 'code-corps-ember/tests/helpers/stub-service';

import creditCardComponent from '../../../pages/components/donation/credit-card';

let page = PageObject.create(creditCardComponent);

const {
  K
} = Ember;

let setHandler = function(context, submitHandler = K) {
  context.set('submitHandler', submitHandler);
};

moduleForComponent('donation/credit-card', 'Integration | Component | donation/credit card', {
  integration: true,
  beforeEach() {
    setHandler(this);
    page.setContext(this);
  },
  afterEach() {
    page.removeContext();
  }
});

test('inputs can be disabled', function(assert) {
  assert.expect(1);

  this.set('canDonate', false);

  page.render(hbs`{{donation/credit-card canDonate=canDonate submit=submitHandler}}`);

  assert.ok(page.allFieldDisabledStates.every((isDisabled) => isDisabled), 'All fields are disabled.');
});

test('inputs are enabled by default', function(assert) {
  assert.expect(1);

  this.set('canDonate', true);

  page.render(hbs`{{donation/credit-card canDonate=canDonate submit=submitHandler}}`);

  assert.ok(page.allFieldDisabledStates.every((isDisabled) => !isDisabled), 'All fields are enabled.');
});

test('it sends submit with credit card fields when button is clicked', function(assert) {
  assert.expect(1);

  this.set('canDonate', true);

  let expectedProps = {
    cardNumber: '1234-5678-9012-3456',
    cvc: '123',
    month: '12',
    year: '2020'
  };

  let submitHandler = function(actualProps) {
    assert.deepEqual(actualProps, expectedProps, 'Action was called with proper attributes.');
  };

  setHandler(this, submitHandler);

  stubService(this, 'stripe', {
    card: {
      validateCardNumber: () => true,
      validateCVC: () => true,
      validateExpiry: () => true
    }
  });

  page.render(hbs`{{donation/credit-card canDonate=canDonate submit=submitHandler}}`)
      .cardNumber(expectedProps.cardNumber)
      .cardMonth(expectedProps.month)
      .cardYear(expectedProps.year)
      .cardCVC(expectedProps.cvc)
      .clickSubmit();
});
