'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('restaurants', 'CategoryId', { 
        type: Sequelize.INTEGER,
        allowNull: false,
        reference: {
          model: 'categories',
          key: 'id'
        } 
      });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Restaurants', 'CategoryId');
  }
};
