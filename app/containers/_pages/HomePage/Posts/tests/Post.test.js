/* global context */

import React from 'react';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';

import { mount } from 'enzyme';
import { ConnectedRouter } from 'connected-react-router';
import history from 'utils/history';

import NotificationSystem from 'containers/NotificationsSystem';
import IntlCatcher from 'containers/LanguageProvider/IntlCatcher';
import ConfigureTestStore from 'testsHelpers/ConfigureTestStore';

import Post from '../Post';
import messages from '../messages';

const post = {
  id: 1,
  truncatedContent: 'Content',
  title: 'Title',
  createdAt: '2020-09-16T15:38:46+02:00',
  user: {
    name: 'User name',
  },
};

let store;
let wrapper;

function mountWrapper() {
  return mount(
    <IntlProvider locale="en">
      <IntlCatcher>
        <Provider store={store}>
          <ConnectedRouter history={history}>
            <div>
              <NotificationSystem />
              <Post post={post} />
            </div>
          </ConnectedRouter>
        </Provider>
      </IntlCatcher>
    </IntlProvider>,
  );
}

function configureWrapper() {
  store = new ConfigureTestStore().store;
  wrapper = mountWrapper();
}

describe('<Post />', () => {
  it('renders truncatedContent', () => {
    configureWrapper();
    expect(wrapper.text()).toContain(post.truncatedContent);
  });

  context('when has newTag defined', () => {
    beforeEach(() => {
      post.newTag = true;
      configureWrapper();
    });

    it('renders new tag', () => {
      expect(wrapper.text()).toContain(messages.newTag.defaultMessage);
    });
  });

  context('when has newTag is not defined', () => {
    beforeEach(() => {
      post.newTag = undefined;
      configureWrapper();
    });

    it('does not render new tag', () => {
      expect(wrapper.text()).not.toContain(messages.newTag.defaultMessage);
    });
  });
});
