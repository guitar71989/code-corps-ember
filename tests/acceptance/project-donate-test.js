import { test } from 'qunit';
import moduleForAcceptance from 'code-corps-ember/tests/helpers/module-for-acceptance';
import { authenticateSession } from 'code-corps-ember/tests/helpers/ember-simple-auth';
import createOrganizationWithSluggedRoute from 'code-corps-ember/tests/helpers/mirage/create-organization-with-slugged-route';
import Ember from 'ember';
import projectDonatePage from '../pages/project/donate';

const {
  Test: { registerWaiter, unregisterWaiter }
} = Ember;

moduleForAcceptance('Acceptance | Project - Donate');

test('It requires authentication', function(assert) {
  assert.expect(1);

  let organization = createOrganizationWithSluggedRoute();
  let project = server.create('project', { organization });

  projectDonatePage.visit({
    amount: 10,
    organization: organization.slug,
    project: project.slug
  });

  andThen(() => {
    assert.equal(currentRouteName(), 'login');
  });
});

test('Allows adding a card and donating (creating a subscription)', function(assert) {
  assert.expect(3);

  let user = server.create('user');
  authenticateSession(this.application, { 'user_id': user.id });

  let organization = createOrganizationWithSluggedRoute();
  let project = server.create('project', { organization });

  projectDonatePage.visit({
    amount: 10,
    organization: organization.slug,
    project: project.slug
  });

  andThen(() => {
    projectDonatePage.creditCard.cardNumber('4242-4242-4242-4242');
    projectDonatePage.creditCard.cardCVC('123');
    projectDonatePage.creditCard.cardMonth('12');
    projectDonatePage.creditCard.cardYear('2020');
  });

  andThen(() => {
    // needs to be done in a separate "andThen", due to async credit card validation
    console.log('button disabled', find('.credit-card-form button').prop('disabled'));
    projectDonatePage.creditCard.clickSubmit();
  });

  // ember doesn't wait for stripe service to create a token, so the whole process doesn't happen
  // in order to circumvent the issue, we register a waiter which periodically check if subscription was
  // set on the controller. It's ugly, but I have no better idea
  // If we change how the controller behaves, for example, if we do not set the loading flag and instead
  // just transition to a new route, this will basically hang.
  function checkLoadingFlag() {
    let isLoading = this.application.__container__.lookup('controller:project.donate').get('isLoading');
    return isLoading === false;
  }

  andThen(() => {
    registerWaiter(this, checkLoadingFlag);
  });

  andThen(() => {
    // amount is 1000, in cents
    let subscription = server.schema.stripeSubscriptions.findBy({ amount: 1000 });
    assert.ok(subscription, 'Subscription was created sucessfully.');
    assert.equal(subscription.userId, user.id, 'User was set to current user.');
    assert.equal(subscription.projectId, project.id, 'Project was set to current project.');
  });

  andThen(() => {
    unregisterWaiter(this, checkLoadingFlag);
  });

  // TODO: Add assertions to check whatever needs to happen on success happens
});

// TODO: test handling validation errors error (showing on page)
// TODO: test handling stripe errors
