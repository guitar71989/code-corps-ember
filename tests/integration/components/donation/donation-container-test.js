import { moduleForComponent, test } from 'ember-qunit';
import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';

const {
  K
} = Ember;

let setHandler = function(context, createCreditCardAndDonateHandler = K) {
  context.set('createCreditCardAndDonateHandler', createCreditCardAndDonateHandler);
};

moduleForComponent('donation/donation-container', 'Integration | Component | donation/donation container', {
  integration: true,
  beforeEach() {
    setHandler(this);
  }
});

test('it renders no project error when no project is passed in', function(assert) {
  assert.expect(1);

  this.render(hbs`{{donation/donation-container createCreditCardAndDonate=createCreditCardAndDonateHandler}}`);

  let mainContent = this.$().find('p').eq(0);
  assert.equal(mainContent.text().trim(), 'No project selected.');
});

test('it renders donation amount and frequency', function(assert) {
  assert.expect(1);
  this.set('projectTitle', 'Funtown');

  this.render(hbs`{{donation/donation-container createCreditCardAndDonate=createCreditCardAndDonateHandler projectTitle=projectTitle}}`);

  let mainContent = this.$().find('p').eq(0);
  assert.ok(mainContent.text().match('Your payment method will be charged'));
});

test('it renders donation amount and frequency', function(assert) {
  assert.expect(1);
  this.set('amount', 100); // in cents

  this.render(hbs`{{donation/donation-container createCreditCardAndDonate=createCreditCardAndDonateHandler donationAmount=amount}}`);

  let donationInfo = this.$().find('h3').eq(0);
  assert.equal(donationInfo.text().trim(), '$100.00');
});
