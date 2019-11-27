const mongoose = require('mongoose');
const crypto = require('crypto');

const { Schema } = mongoose;

const UsersSchema = new Schema({
    email: { type: String, unique: true, required: true },
    hash: { type: String, required: true },
    salt: { type: String, required: true },
    createdDate: { type: Date, default: Date.now }
});

UsersSchema.methods.setPassword = function(password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};

UsersSchema.methods.validatePassword = function(password) {
    const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
    return this.hash === hash;
};

UsersSchema.methods.toAuthJSON = function() {
    return {
        _id: this._id,
        email: this.email,
    };
};

mongoose.model('Users', UsersSchema);