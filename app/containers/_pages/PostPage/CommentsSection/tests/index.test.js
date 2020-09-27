/* global context */

import React from 'react';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';

import { mount } from 'enzyme';
import waitForExpect from 'wait-for-expect';
import { act } from 'react-dom/test-utils';

import NotificationSystem from 'containers/NotificationsSystem';
import IntlCatcher from 'containers/LanguageProvider/IntlCatcher';
import ConfigureTestStore from 'testsHelpers/ConfigureTestStore';
import { MockedProvider } from '@apollo/client/testing';

import CommentsSection from '../index';
import { COMMENTS_QUERY } from '../graphql';
import messages from '../messages';

// Mock Form required by CommentsSection
/* eslint-disable react/prop-types */
jest.mock(
  'containers/_pages/PostPage/CommentsSection/Comment',
  () => ({ comment }) => (
    <div>
      Comment component {comment.content} {comment.newTag ? 'newTag' : null}
    </div>
  ),
);
jest.mock('containers/_pages/PostPage/CommentsSection/Form', () => () => (
  <div>Form component</div>
));
/* eslint-enable */

// Posts
const postObject = {
  id: 1,
  content: 'Content',
  title: 'Title',
  createdAt: '2020-09-16T15:38:46+02:00',
  user: {
    name: 'User name',
  },
};

// Comments
const resultComment = {
  id: 2,
  content: 'resultCommentContent',
  createdAt: '2020-09-16T15:38:46+02:00',
  user: {
    name: 'resultCommentUserName',
  },
};
const loadedOnScrollComment = {
  id: 1,
  content: 'loadedOnScrollCommentContent',
  createdAt: '2020-10-16T15:38:46+02:00',
  user: {
    name: 'loadedOnScrollCommentUserName',
  },
};
let store;
let wrapper;

const mocks = (opts) => [
  {
    request: {
      query: COMMENTS_QUERY,
      variables: {
        postId: postObject.id,
      },
    },
    result: {
      data: {
        comments: opts.resultComments ? [resultComment] : [],
      },
    },
  },
  {
    request: {
      query: COMMENTS_QUERY,
      variables: {
        postId: postObject.id,
      },
    },
    result: {
      data: {
        comments: opts.resultComments ? [resultComment] : [],
      },
    },
  }, // fetchPolicy: 'network-only' calls useQuery again during fetchMore, hopefully it is fixed soon : https://github.com/apollographql/apollo-client/issues/6327
  {
    request: {
      query: COMMENTS_QUERY,
      variables: {
        olderThanId: resultComment.id,
        postId: postObject.id,
      },
    },
    result: {
      data: {
        comments: opts.loadedOnScrollComments ? [loadedOnScrollComment] : [],
      },
    },
  },
];

function mountWrapper(opts) {
  return mount(
    <IntlProvider locale="en">
      <IntlCatcher>
        <Provider store={store}>
          <MockedProvider mocks={mocks(opts)} addTypename={false}>
            <div>
              <NotificationSystem />
              <CommentsSection post={postObject} />
            </div>
          </MockedProvider>
        </Provider>
      </IntlCatcher>
    </IntlProvider>,
  );
}

function configureWrapper(opts = {}) {
  store = new ConfigureTestStore().store;
  wrapper = mountWrapper(opts);
}

describe('<CommentsSection />', () => {
  it('renders Form component', async () => {
    configureWrapper();
    await waitForExpect(() => {
      wrapper.update();
      expect(wrapper.text()).toContain('Form component');
    });
  });

  context('when comment is returned by COMMENTS_QUERY', () => {
    beforeEach(() => {
      configureWrapper({ resultComments: true });
    });

    it('renders Comment with comment in props', async () => {
      await act(async () => {
        await waitForExpect(() => {
          wrapper.update();
          expect(wrapper.text()).toContain(
            `Comment component ${resultComment.content}`,
          );
        });
      });
    });

    context('when comment is returned by COMMENTS_QUERY on fetchMore', () => {
      beforeEach(() => {
        configureWrapper({
          resultComments: true,
          loadedOnScrollComments: true,
        });
      });

      it('renders loaded Comment with comment in props', async () => {
        await act(async () => {
          // check if first query loaded before fetchMore
          await waitForExpect(() => {
            wrapper.update();
            expect(wrapper.text()).toContain(
              `Comment component ${resultComment.content}`,
            );
          });
          const infiniteScroll = wrapper.find('InfiniteScroll');
          infiniteScroll.props().next(); // fetchMore
          await waitForExpect(() => {
            expect(wrapper.text()).toContain(
              `Comment component ${loadedOnScrollComment.content}`,
            );
          });
        });
      });
    });

    context(
      'when empty array is returned by COMMENTS_QUERY on fetchMore',
      () => {
        beforeEach(() => {
          configureWrapper({ resultComments: true });
        });

        it('renders scrollEnd message', async () => {
          await act(async () => {
            // check if first query loaded before fetchMore
            await waitForExpect(() => {
              wrapper.update();
              expect(wrapper.text()).toContain(
                `Comment component ${resultComment.content}`,
              );
            });
            const infiniteScroll = wrapper.find('InfiniteScroll');
            infiniteScroll.props().next(); // fetchMore
            await act(async () => {
              await waitForExpect(() => {
                wrapper.update();
                expect(wrapper.text()).toContain(
                  messages.scrollEnd.defaultMessage,
                );
              });
            });
          });
        });
      },
    );
  });

  context('when empty array is returned by COMMENTS_QUERY', () => {
    beforeEach(() => {
      configureWrapper({ resultComments: false });
    });

    it('renders scrollEnd message', async () => {
      await act(async () => {
        await waitForExpect(() => {
          wrapper.update();
          expect(wrapper.text()).toContain(messages.scrollEnd.defaultMessage);
        });
      });
    });
  });
});
