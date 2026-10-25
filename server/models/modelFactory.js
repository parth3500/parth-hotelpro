const mongoose = require('mongoose');
const { getMemoryModel, getConnectionType } = require('../config/db');

function createModel(modelName, schemaDefinition, options = {}) {
  let mongooseModel = null;
  try {
    if (mongoose.models[modelName]) {
      mongooseModel = mongoose.models[modelName];
    } else {
      const schema = new mongoose.Schema(schemaDefinition, {
        timestamps: true,
        ...options
      });
      mongooseModel = mongoose.model(modelName, schema);
    }
  } catch (err) {
    // If mongoose fails, fallback
  }

  // Model proxy that delegates based on active connection mode
  const memoryStore = getMemoryModel(modelName);

  return new Proxy({}, {
    get(target, prop) {
      if (getConnectionType() === 'mongoose' && mongooseModel && mongoose.connection.readyState === 1) {
        return mongooseModel[prop];
      }
      // Delegate to memoryStore
      if (typeof memoryStore[prop] === 'function') {
        return memoryStore[prop].bind(memoryStore);
      }
      return memoryStore[prop];
    }
  });
}

module.exports = { createModel };
