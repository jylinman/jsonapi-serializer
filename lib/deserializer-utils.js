'use strict';
var P = require('bluebird');
var _ = require('lodash');

module.exports = function (jsonapi, data, opts) {

  function getValueForRelationship(relationshipData, included) {
    if (opts && opts[relationshipData.type]) {
      var valueForRelationshipFct = opts[relationshipData.type]
        .valueForRelationship;

      return valueForRelationshipFct(relationshipData, included);
    } else {
      return included;
    }
  }

  function findIncluded(relationshipData) {
    return new P(function (resolve) {
      if (!jsonapi.included) { resolve(null); }

      var included = _.findWhere(jsonapi.included, {
        id: relationshipData.id,
        type: relationshipData.type
      });

      if (included) {
        return P
          .all([extractAttributes(included), extractRelationships(included)])
          .spread(function (attributes, relationships) {
            resolve(_.extend(attributes, relationships));
          });
      } else {
        return resolve(null);
      }
    });
  }

  function extractAttributes(from) {
    return new P(function (resolve) {
      var dest = from.attributes;
      dest.id = from.id;

      resolve(dest);
    });
  }

  function extractRelationships(from) {
    if (!from.relationships) { return; }

    var dest = {};

    return P
      .each(Object.keys(from.relationships), function (key) {
        var relationship = from.relationships[key];

        if (_.isArray(relationship.data)) {
          return P
            .map(relationship.data, function (relationshipData) {
              return extractIncludes(relationshipData);
            })
            .then(function (includes) {
              if (includes) { dest[key] = includes; }
            });
        } else {
          return extractIncludes(relationship.data)
            .then(function (include) {
              if (include) { dest[key] = include; }
            });
        }
      })
      .thenReturn(dest);
  }

  function extractIncludes(relationshipData) {
    return findIncluded(relationshipData)
      .then(function (included) {
        var valueForRelationship = getValueForRelationship(relationshipData,
          included);

        if (valueForRelationship && _.isFunction(valueForRelationship.then)) {
          return valueForRelationship.then(function (value) {
            return value;
          });
        } else {
          return valueForRelationship;
        }
      });
  }

  this.perform = function () {
    return P
      .all([extractAttributes(data), extractRelationships(data)])
      .spread(function (attributes, relationships) {
        return _.extend(attributes, relationships);
      });
  };
};
