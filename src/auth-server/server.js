const express = require('express')
const { auth, requiresAuth } = require('express-openid-connect');


const app = express()
const port = 3000

const config = {
  authRequired: false,
  auth0Logout: false,
  secret: 'A4OZE_ZHvHgVeh7EA4Y61S_OvGRlVIC8I3wfl38BrDInmchcLstn7RSk5Rj6dbRn',
  baseURL: 'http://localhost:3000',
  clientID: 'kp3LihUw5N2douXzyCO8u1NTXRmIEvhc',
  issuerBaseURL: 'https://dev-xo6vgelc.eu.auth0.com'
};

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));

// req.isAuthenticated is provided from the auth router
app.get('/', (req, res) => {
  res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
});

app.get('/profile', requiresAuth(), (req, res) => {
  res.send(JSON.stringify(req.oidc.user));
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})