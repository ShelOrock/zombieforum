import { Sequelize } from 'sequelize';
import { Conversation, Reply, Activity } from '../database/index.js';

import express from 'express';
const router = express.Router();

//return all replies
router.get('/', (req, res, next) => {

  if (req.headers.authorization !== `Bearer admin` && req.headers.authorization !== `Bearer user`) {
    return res.status(403).send('You do not have permission to perform this action. Contact administrator')
  }

  Reply.findAll({
    where: {
      isFlagged: true,
    },
    order: [['createdAt', 'DESC']],
    include: {
      model: Conversation,
    },
  })
    .then(replies => res.send(replies))
    .catch(e => console.error(e));
});

router.get('/search', (req, res, next) => {
  const { term } = req.query;
  Reply.findAll({
    where: {
      body: { [Sequelize.Op.iLike]: `%${term}%` },
    },
    include: { model: Conversation },
  })
    .then(replies => res.send(replies))
    .catch(e => console.error(e));
});

//return a single reply
router.get('/:id', (req, res, next) => {
  Reply.findOne({
    where: {
      id: req.params.id,
    },
    include: {
      model: Activity,
    },
  })
    .then(result => {
      if (!result) {
        res
          .status(404)
          .send()
      } else {
        res
          .status(200)
          .send(res);
      }
    })
    .catch(e => {
      res.status(500).send();
      next(e);
    });
});

router.post('/', (req, res, next) => {

  const { conversationId, userId } = req.body;

  if (!userId) {
    return res.status(401).send('Sign in to perform this action')
  }
  if (!conversationId) {
    return res.status(400).send('POST reply request missing conversationId');
  }
  if (req.headers.authorization !== `Bearer ${userId}`) {
    return res.status(403).send('You do not have permission to perform this action. Contact administrator.')
  }

  Reply.create({
    ...req.body,
  })
    .then(created => {
      res.status(200).send(created);
    })
    .catch(e => {
      res.status(500).send();
      next(e);
    });
});

router.put('/:id', (req, res, next) => {

  if (req.headers.authorization !== `Bearer admin` && req.headers.authorization !== `Bearer user`) {
    return res.status(403).send('You do not have permission to perform this action. Contact administrator.')
  }
  Reply.update(
    {
      ...req.body
    },
    {
      where: { id: req.params.id },
      returning: true,
    }
  )
    .then(updated => {
      updated
        ? res.sendStatus(201)
        : res.sendStatus(404);
    })
    .catch(e => {
      res.status(500).send();
      next(e);
    });
});

router.delete('/:id', (req, res, next) => {

  if (req.headers.authorization !== `Bearer admin` && req.headers.authorization !== `Bearer user`) {
    res.status(403).send('You do not have permission to perform this request. Contact administrator.')
  }

  Reply.destroy({
    where: {
      id: req.params.id,
    },
    include: [{ model: Activity }],
  })
    .then(destroyed => {
      destroyed
        ? res.status(204).send({ success: true })
        : res.status(404).send({ success: false });
    })
    .catch(e => {
      res.status(500).send();
      next(e);
    });
});

export default router;
