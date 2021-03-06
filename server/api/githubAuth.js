import express from 'express';
import axios from 'axios';
import chalk from 'chalk';

import { User } from '../database/index.js';

const router = express.Router();

router.get('/login', (req, res) => {
  res.redirect(
    `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}`
  );
});

router.get('/callback', (req, res) => {
  const { code } = req.query;
  axios
    .post(
      `https://github.com/login/oauth/access_token?code=${code}&client_id=${process.env.GITHUB_CLIENT_ID}&client_secret=${process.env.GITHUB_CLIENT_SECRET}`,
      {},
      {
        headers: {
          Accept: 'application/json',
        },
      }
    )
    .then(async authRes => {
      const userRes = await axios.get('https://api.github.com/user', {
        headers: {
          Authorization: `token ${authRes.data.access_token}`,
        },
      });
      const userData = userRes.data;
      return User.findOrCreate({
        where: { email: userData.email },
        defaults: {
          github_access_token: authRes.data.access_token,
          userType: 'user',
          sessionId: req.session.id,
          githubUsername: userData.login,
          reposUrl: userData.repos_url,
          name: userData.name,
          email: userData.email,
          image: userData.avatar_url,
          bio: userData.bio,
        },
      }).then(([user, created]) => {
        return [user, created, authRes];
      });
    })
    .then(([user, created, authRes]) => {
      console.log('user gh at updated');
      if (!created) {
        user.update({
          github_access_token: authRes.data.access_token,
          sessionId: req.session.id,
        });
      }
    })
    .then(() => {
      res.redirect('/');
    })
    .catch(e => {
      console.log(chalk.red('Error authenticating with Github.'));
      console.error(e);
      res.redirect('/error');
    });
});

router.get('/user', (req, res, next) => {
  return User.findOne({
    where: {
      // github_access_token: req.user.github_access_token || null,
      sessionId: req.session.id,
    },
  })
    .then(user => res.send(user))
    .catch(e => {
      res.status(500).send();
      console.error(e);
      next(e);
    });
});

router.post('/user/repos', (req, res, next) => {
  axios
    .get(`https://api.github.com/users/${req.body.githubUsername}/repos`, {
    })
    .then(repos => {
      res.send(repos.data);
    })
    .catch(e => {
      res.status(500).send();
      next(e);
    });
});

export default router;
