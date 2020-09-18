import { gql } from '@apollo/client';

export const POSTS_QUERY = gql`
  query {
    posts {
      id
      content
      title
      createdAt
      user {
        name
      }
    }
  }
`;
