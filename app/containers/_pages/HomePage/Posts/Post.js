import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import history from 'utils/history';
import moment from 'moment';
import { Link } from 'react-router-dom';
import {
  Avatar,
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  Typography,
} from '@material-ui/core';
import messages from './messages';

function Post({ post }) {
  const newTag = () => {
    if (post.newTag) {
      return (
        <Chip
          className="new-tag"
          variant="outlined"
          size="small"
          label={<FormattedMessage {...messages.newTag} />}
        />
      );
    }
    return null;
  };

  return (
    <Card>
      {newTag()}

      <CardHeader
        avatar={<Avatar src={post.user.avatar} />}
        title={post.user.name}
        subheader={moment(post.createdAt).format('YYYY-MM-MM HH:mm')}
      ></CardHeader>
      <CardActionArea onClick={() => history.push(`/post/${post.id}`)}>
        <CardContent>
          <Typography gutterBottom component="h2" variant="h6">
            {post.title}
          </Typography>
          <Typography component="span" align="center">
            {post.truncatedContent}
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions>
        <Button size="small" component={Link} to={`/post/${post.id}`}>
          <FormattedMessage {...messages.readMore} />
        </Button>
      </CardActions>
    </Card>
  );
}

Post.propTypes = {
  post: PropTypes.object.isRequired,
};

export default Post;
