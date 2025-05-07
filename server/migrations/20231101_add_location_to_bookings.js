'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Bookings', 'latitude', {
      type: Sequelize.DECIMAL(10, 8),
      allowNull: true,
      after: 'address'
    });
    
    await queryInterface.addColumn('Bookings', 'longitude', {
      type: Sequelize.DECIMAL(11, 8),
      allowNull: true,
      after: 'latitude'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Bookings', 'latitude');
    await queryInterface.removeColumn('Bookings', 'longitude');
  }
}; 