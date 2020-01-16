const express = require('express');
const db = require('./userDb');
const posts = require('../posts/postDb');

const router = express.Router();


router.use(express.json());

router.post('/', validateUser, (req, res) => {
  const { text, user_id } = posts.insert(req.body)
  .then( addText => {
    text || user_id ? res.status(400).json({ errorMessage: "Please provide name for the user."}) : res.status(201).json(addText);
  })
  .catch( error => {
    console.log(error);
    res.status(500).json({error: "There was an error while saving the user to the database"  })
  });
});

router.post('/:id/posts', validateUserId, validatePost, (req, res) => {
  const id = req.params.id;
  const { text, user_id } = req.body
  db.getById(id)
  .then( postId => {
    !postId.length ? posts.insert({text: text, user_id: user_id}).then( () => {
      res.status(201).json({ message: req.body});
    })
    .catch(error => {
      console.log(error);
      res.status(500).json({ message: 'Error creating new post'})
    }) :
    res.status(404).json({
      message: "The user with the specified ID does not exist."
    });
  })
  .catch(error => {
    console.log(error);
    res.status(500).json({errorMessage: "The post could not be saved." })
  })
});

router.get('/', (req, res) => {
  db.get()
  .then(user => {
    res.status(200).json(user);
    })
  .catch(error => {
    console.log(`error on GET/api/user`, error);
    res.status(500).json({ errorMessage: "The users information could not be retrieved."})
  })
});

router.get('/:id', validateUserId, (req, res) => {
  const id = req.params.id;
  db.getById(id)
  .then(userById => {
    userById ? res.status(200).json(userById) : res.status(404).json({ message: "The user with the specified ID does not exist." });
  })
  .catch(error => {
    console.log(error);
    res.status(500).json({ error: "The users information could not be retrieved." });
  });
});

router.get('/:id/posts', validateUserId, validatePost,  (req, res) => {
  db.getUserPosts(req.params.id)
  .then(posts =>{
    !posts ? res.status(500).json({ message: "The post with the specified ID does not exist." }) : res.status(200).json(posts);
  })
  .catch(error => {
    console.log(error);
    res.status(500).json({ error: "There was an error while saving the post to the database" })
  });
});

router.delete('/:id', validateUserId, (req, res) => {
  db.remove(req.params.id)
    .then(removed => {
        removed > 0 ? res.status(200).json({ message: 'post successfully deleted' }) : res.status(404).json({ message: "The post with the specified ID does not exist." });
    })
    .catch(error => {
        console.log(error);
        res.status(500).json({ error: "The post could not be removed" })
    })
});

router.put('/:id', validateUserId, (req, res) => {
  const changes = req.body;
  const id = req.params.id;
  const { user } = id;

  user ? res.status(400).json({ errorMessage: " Please provide name for user." }) :

  db.update(id, changes)
  .then( update => {
      update === 0 ? res.status(404).json({ message: "The user with the specified ID does not exist." }) : res.status(200).json(user);
  })
  .catch(error => {
    console.log(error);
    res.status(500).json({ error: "There was an error while saving the user information" });
  });
});

//custom middleware

function validateUserId(req, res, next) {
  const id = db.getById(req.params.id)
  .then( userId )
  userId === id ? req.user = userId 
  : !name ? res.status(400).json({ message: "missing required name field" }) 
  : next();
}

function validateUser(req, res, next) {
  !req.body ? res.status(400).json({ message: "Missing user data"})
  : !req.body.name ? res.status(400).json({ message: "Missing required name field" }) 
  : next();
}

function validatePost(req, res, next) {
  !req.body ? res.status(400).json({ message: "Missing post data" }) 
  : !res.body.text ? res.status(400).json ({ message: "Missing required text field" }) 
  : next();
}

module.exports = router;