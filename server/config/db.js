const mongoose = require('mongoose');

// In-Memory Document Store providing Mongoose compatibility
class MemoryCollection {
  constructor(name) {
    this.name = name;
    this.documents = new Map();
    this._idCounter = 1;
  }

  _generateId() {
    return 'mem_' + Date.now().toString(36) + '_' + (this._idCounter++).toString(36);
  }

  _clone(doc) {
    if (!doc) return null;
    return JSON.parse(JSON.stringify(doc));
  }

  _matchesQuery(doc, query = {}) {
    for (const [key, val] of Object.entries(query)) {
      if (key === '_id' || key === 'id') {
        const docId = (doc._id || doc.id || '').toString();
        const targetId = (val && val._id ? val._id : val).toString();
        if (docId !== targetId) return false;
        continue;
      }

      if (val !== null && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
        if ('$in' in val) {
          const list = val.$in.map(v => v.toString());
          if (!list.includes((doc[key] || '').toString())) return false;
          continue;
        }
        if ('$gte' in val) {
          if (new Date(doc[key]) < new Date(val.$gte)) return false;
          continue;
        }
        if ('$lte' in val) {
          if (new Date(doc[key]) > new Date(val.$lte)) return false;
          continue;
        }
        if ('$gt' in val) {
          if (new Date(doc[key]) <= new Date(val.$gt)) return false;
          continue;
        }
        if ('$lt' in val) {
          if (new Date(doc[key]) >= new Date(val.$lt)) return false;
          continue;
        }
        if ('$ne' in val) {
          if (doc[key] === val.$ne) return false;
          continue;
        }
        if ('$regex' in val) {
          const flags = val.$options || '';
          const regex = new RegExp(val.$regex, flags);
          if (!regex.test(String(doc[key] || ''))) return false;
          continue;
        }
      }

      if (val instanceof RegExp) {
        if (!val.test(String(doc[key] || ''))) return false;
        continue;
      }

      if (Array.isArray(doc[key]) && !Array.isArray(val)) {
        if (!doc[key].includes(val)) return false;
        continue;
      }

      if (doc[key] !== val) {
        return false;
      }
    }
    return true;
  }

  _wrapDocument(doc) {
    if (!doc) return null;
    const self = this;
    const wrapped = { ...doc };

    // Provide Mongoose doc methods
    wrapped.save = async function() {
      wrapped.updatedAt = new Date();
      self.documents.set(wrapped._id.toString(), self._clone(wrapped));
      return self._wrapDocument(self._clone(wrapped));
    };

    wrapped.toObject = function() {
      const copy = { ...wrapped };
      delete copy.save;
      delete copy.toObject;
      delete copy.toJSON;
      return copy;
    };

    wrapped.toJSON = function() {
      return wrapped.toObject();
    };

    return wrapped;
  }

  async create(data) {
    if (Array.isArray(data)) {
      const results = [];
      for (const item of data) {
        results.push(await this.create(item));
      }
      return results;
    }

    const doc = this._clone(data);
    if (!doc._id) {
      doc._id = this._generateId();
    }
    doc.id = doc._id.toString();
    const now = new Date();
    doc.createdAt = doc.createdAt || now;
    doc.updatedAt = doc.updatedAt || now;

    this.documents.set(doc._id.toString(), this._clone(doc));
    return this._wrapDocument(this._clone(doc));
  }

  async insertMany(docs) {
    return this.create(docs);
  }

  find(query = {}) {
    const self = this;
    let results = [];
    for (const doc of this.documents.values()) {
      if (this._matchesQuery(doc, query)) {
        results.push(this._clone(doc));
      }
    }

    const queryObj = {
      _results: results,
      _sortKey: null,
      _sortDir: 1,
      _limit: null,
      _skip: 0,
      _populateKeys: [],

      sort(criteria) {
        if (typeof criteria === 'string') {
          const parts = criteria.split(' ');
          criteria = {};
          parts.forEach(p => {
            if (p.startsWith('-')) criteria[p.substring(1)] = -1;
            else criteria[p] = 1;
          });
        }
        const [field, dir] = Object.entries(criteria)[0] || ['createdAt', -1];
        this._results.sort((a, b) => {
          if (a[field] < b[field]) return -1 * dir;
          if (a[field] > b[field]) return 1 * dir;
          return 0;
        });
        return this;
      },

      limit(n) {
        this._limit = n;
        return this;
      },

      skip(n) {
        this._skip = n;
        return this;
      },

      select(fields) {
        return this;
      },

      populate(path) {
        this._populateKeys.push(path);
        return this;
      },

      lean() {
        return this;
      },

      async exec() {
        let list = this._results;
        if (this._skip) list = list.slice(this._skip);
        if (this._limit) list = list.slice(0, this._limit);
        return list.map(d => self._wrapDocument(d));
      },

      then(resolve, reject) {
        return this.exec().then(resolve, reject);
      }
    };

    return queryObj;
  }

  async findOne(query = {}) {
    for (const doc of this.documents.values()) {
      if (this._matchesQuery(doc, query)) {
        return this._wrapDocument(this._clone(doc));
      }
    }
    return null;
  }

  async findById(id) {
    if (!id) return null;
    const doc = this.documents.get(id.toString());
    if (doc) {
      return this._wrapDocument(this._clone(doc));
    }
    return null;
  }

  async findByIdAndUpdate(id, update, options = {}) {
    if (!id) return null;
    const existing = this.documents.get(id.toString());
    if (!existing) return null;

    let updated = { ...existing };
    if (update.$set) {
      updated = { ...updated, ...update.$set };
    } else {
      updated = { ...updated, ...update };
    }
    updated.updatedAt = new Date();
    this.documents.set(id.toString(), updated);
    return this._wrapDocument(this._clone(updated));
  }

  async updateOne(query, update) {
    const doc = await this.findOne(query);
    if (!doc) return { matchedCount: 0, modifiedCount: 0 };
    await this.findByIdAndUpdate(doc._id, update);
    return { matchedCount: 1, modifiedCount: 1 };
  }

  async deleteOne(query) {
    const doc = await this.findOne(query);
    if (!doc) return { deletedCount: 0 };
    this.documents.delete(doc._id.toString());
    return { deletedCount: 1 };
  }

  async findByIdAndDelete(id) {
    if (!id) return null;
    const doc = await this.findById(id);
    if (!doc) return null;
    this.documents.delete(id.toString());
    return doc;
  }

  async deleteMany(query = {}) {
    let count = 0;
    for (const [id, doc] of this.documents.entries()) {
      if (this._matchesQuery(doc, query)) {
        this.documents.delete(id);
        count++;
      }
    }
    return { deletedCount: count };
  }

  async countDocuments(query = {}) {
    let count = 0;
    for (const doc of this.documents.values()) {
      if (this._matchesQuery(doc, query)) {
        count++;
      }
    }
    return count;
  }

  async aggregate(pipeline = []) {
    let results = Array.from(this.documents.values()).map(d => this._clone(d));
    for (const stage of pipeline) {
      if (stage.$match) {
        results = results.filter(doc => this._matchesQuery(doc, stage.$match));
      } else if (stage.$group) {
        const idField = stage.$group._id;
        const groups = new Map();
        for (const doc of results) {
          let key = 'null';
          if (idField !== null) {
            key = (idField.startsWith('$') ? doc[idField.substring(1)] : doc[idField]) ?? 'null';
          }
          if (!groups.has(key)) {
            groups.set(key, { _id: idField === null ? null : key });
          }
          const groupEntry = groups.get(key);
          for (const [field, expr] of Object.entries(stage.$group)) {
            if (field === '_id') continue;
            if (expr && expr.$sum !== undefined) {
              const val = typeof expr.$sum === 'string' && expr.$sum.startsWith('$')
                ? (Number(doc[expr.$sum.substring(1)]) || 0)
                : Number(expr.$sum) || 0;
              groupEntry[field] = (groupEntry[field] || 0) + val;
            } else if (expr && expr.$avg !== undefined) {
              const val = typeof expr.$avg === 'string' && expr.$avg.startsWith('$')
                ? (Number(doc[expr.$avg.substring(1)]) || 0)
                : Number(expr.$avg) || 0;
              groupEntry[`_${field}_sum`] = (groupEntry[`_${field}_sum`] || 0) + val;
              groupEntry[`_${field}_count`] = (groupEntry[`_${field}_count`] || 0) + 1;
              groupEntry[field] = groupEntry[`_${field}_sum`] / groupEntry[`_${field}_count`];
            }
          }
        }
        results = Array.from(groups.values());
      }
    }
    return results;
  }

  clear() {
    this.documents.clear();
    this._idCounter = 1;
  }
}

// Memory database registry
const memoryStores = new Map();

function getMemoryModel(modelName) {
  if (!memoryStores.has(modelName)) {
    memoryStores.set(modelName, new MemoryCollection(modelName));
  }
  return memoryStores.get(modelName);
}

let isConnected = false;
let connectionType = 'memory';

async function connectDB(uri = process.env.MONGODB_URI) {
  if (process.env.USE_MEMORY_DB === 'true') {
    isConnected = true;
    connectionType = 'memory';
    return { connectionType, isConnected };
  }

  try {
    // Attempt Mongoose connection with 1500ms timeout
    await mongoose.connect(uri || 'mongodb://localhost:27017/hotelpro', {
      serverSelectionTimeoutMS: 1500
    });
    isConnected = true;
    connectionType = 'mongoose';
    console.log('[Database] Connected to live MongoDB successfully.');
  } catch (err) {
    isConnected = true;
    connectionType = 'memory';
    console.log('[Database] Live MongoDB unavailable. Activated high-performance in-memory MongoDB store.');
  }

  return { connectionType, isConnected };
}

function clearAllMemory() {
  for (const store of memoryStores.values()) {
    store.clear();
  }
}

module.exports = {
  connectDB,
  getMemoryModel,
  clearAllMemory,
  getConnectionType: () => connectionType,
  isConnected: () => isConnected
};
