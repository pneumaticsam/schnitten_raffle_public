db = db.getSiblingDB('admin')

db.createUser({
    user: 'raffle-admin',
    pwd: 'password',
    roles: [{
        role: 'readWrite',
        db: 'raffle-db',
    }, ],
});

db = new Mongo().getDB("raffle-db");