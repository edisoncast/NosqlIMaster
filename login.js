const mongoose = require('mongoose');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const crypto = require('crypto');

//Configuracion mongoose
mongoose.connect('mongodb://localhost/maestria', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });
require('./models/Users');
mongoose.set('debug', true);
const Users = mongoose.model('Users');

const app = express();

//Inicialización y configuración del módulo de express.



app.use(session({
    secret: 'secret',
    cookie: { maxAge: 60000 },
    resave: false,
    saveUninitialized: false
}));

app.use(express.static(path.join(__dirname, '/public')));

app.set('views', __dirname + '/views/');
app.set('view engine', 'pug');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

//Ruta para redireccionar al login
app.get('/', function(request, response) {
    response.render('login');
});

//Ruta para validar si un usuario puede ingresar

app.post('/login', (request, response, next) => {
    const email = request.body.email;
    const password = request.body.password;
    if (email && password) {
        Users.findOne({ email }, function(err, user) {
            if (err) throw err;
            if (user && user.validatePassword(password)) {
                request.session.loggedin = true;
                request.session.email = email;
                response.render('allow', { "data": email });
            } else {
                response.send('Usuario o password incorrecto!');
            }
        });
    } else {
        response.send('Usted debe ingresar un usuario y un password!');
        response.end();
    }
});



//Crear un usuario
app.post('/', (request, response, next) => {
    const { body: { user } } = request;
    if (!user.email) {
        return response.status(422).json({
            errors: {
                email: 'es requerido',
            },
        });
    }

    if (!user.password) {
        return res.status(422).json({
            errors: {
                password: 'es requerido',
            },
        });
    }

    const finalUser = new Users(user);

    finalUser.setPassword(user.password);

    return finalUser.save()
        .then(() => response.json({ user: finalUser.toAuthJSON() }));
});


app.listen(3000, () => console.log('Servidor ejecutando en http://localhost:3000/'));