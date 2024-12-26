const { DataTypes, Model } = require('sequelize');
const sequelize = require('../sequelize/sequelize');
const User = require('./User'); // Import the User model

class Address extends Model {}

Address.init({
    street: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    city: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    country: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    purchaseDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
}, {
    sequelize,
    modelName: 'Address',
    tableName: 'addresses',
    timestamps: true, // Adds createdAt and updatedAt fields
});

// Define the one-to-many relationship
User.hasMany(Address, {
    foreignKey: 'userId',
    as: 'addresses',
});
Address.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
});

module.exports = Address;
